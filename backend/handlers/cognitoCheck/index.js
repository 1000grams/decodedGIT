const { CognitoIdentityProviderClient, AdminListGroupsForUserCommand } = require('@aws-sdk/client-cognito-identity-provider');

// Environment variables
const REGION = process.env.AWS_REGION || 'eu-central-1';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || 'eu-central-1_d9JNeVdni';
const ARTIST_GROUP = process.env.ARTIST_GROUP || 'artist';

const client = new CognitoIdentityProviderClient({ region: REGION });

exports.handler = async (event) => {
  console.log("🔍 Event received:", JSON.stringify(event));

  try {
    const body = JSON.parse(event.body || '{}');
    const email = body.email;

    console.log("📧 Checking groups for email:", email);

    if (!email) {
      console.warn("⚠️ Email not provided.");
      return response(400, { message: 'email required' });
    }

    const command = new AdminListGroupsForUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
    });

    const res = await client.send(command);

    const groups = res.Groups || [];
    console.log("✅ Groups fetched:", groups.map(g => g.GroupName));

    const authorized = groups.some(g => g.GroupName === ARTIST_GROUP);
    return response(200, { authorized });

  } catch (err) {
    console.error("❌ Error checking Cognito groups:", err);
    return response(500, { message: 'error', detail: err.message });
  }
};

function response(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body),
  };
}
