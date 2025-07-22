const { DynamoDBClient, ScanCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const TABLE_NAME = process.env.CATALOG_TABLE || 'DecodedCatalog';
const PREVIEWS_BUCKET = process.env.PREVIEWS_BUCKET || 'decodedmusic-previews';

const DEFAULT_CATALOG = [{ id: 'stub', title: 'Sample Track', artist_id: 'stub' }];

const ddb = new DynamoDBClient({ region: REGION });
const s3 = new S3Client({ region: REGION });

exports.handler = async (event) => {
  const id = event.pathParameters ? event.pathParameters.id : null;
  try {
    if (event.httpMethod === 'GET' && !id) {
      // list catalog items
      const data = await ddb.send(new ScanCommand({ TableName: TABLE_NAME, Limit: 50 }));
      const items = (data.Items || []).map(cleanItem);
      return response(200, items.length ? items : DEFAULT_CATALOG);
    } else if (event.httpMethod === 'GET' && id) {
      const data = await ddb.send(new GetItemCommand({ TableName: TABLE_NAME, Key: { id: { S: id } } }));
      if (!data.Item) return response(200, DEFAULT_CATALOG[0]);
      const item = cleanItem(data.Item);
      if (item.preview_key) {
        const url = await getSignedUrl(
          s3,
          new GetObjectCommand({ Bucket: PREVIEWS_BUCKET, Key: item.preview_key }),
          { expiresIn: 30 }
        );
        item.preview_url = url;
      }
      delete item.preview_key;
      return response(200, item);
    } else {
      return response(405, { message: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error('Catalog handler error', err);
    return response(500, { message: 'Internal Server Error' });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(body),
  };
}

function cleanItem(item) {
  const obj = {};
  for (const [k, v] of Object.entries(item)) {
    const val = v.S ?? (v.N ? Number(v.N) : undefined);
    obj[k] = val;
  }
  return obj;
}
