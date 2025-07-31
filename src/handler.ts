import { APIGatewayProxyHandler } from 'aws-lambda';
import * as AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const tableName = process.env.TABLE_NAME || '';

export const handler: APIGatewayProxyHandler = async (event) => {
  const method = event.httpMethod;
  const body = event.body ? JSON.parse(event.body) : null;

  switch (method) {
    case 'POST':
      const id = body.id;
      const data = body.data;
      await dynamoDb.put({ TableName: tableName, Item: { id, data } }).promise();
      return { statusCode: 200, body: JSON.stringify({ message: 'Item created' }) };

    default:
      return { statusCode: 400, body: JSON.stringify({ message: 'Unsupported method' }) };
  }
};