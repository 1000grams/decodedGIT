const {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  AdminListGroupsForUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');

const REGION = process.env.AWS_REGION || 'eu-central-1';
const USER_POOL_ID = process.env.USER_POOL_ID || '5fxmkd';
const CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

const client = new CognitoIdentityProviderClient({ region: REGION });

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const { email, password } = body;

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing credentials' }),
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    };
  }

  const command = new InitiateAuthCommand({
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password }
  });

  try {
    const auth = await client.send(command);
    const groupsResp = await client.send(
      new AdminListGroupsForUserCommand({ UserPoolId: USER_POOL_ID, Username: email })
    );
    const groups = (groupsResp.Groups || []).map((g) => g.GroupName);
    return {
      statusCode: 200,
      body: JSON.stringify({
        idToken: auth.AuthenticationResult.IdToken,
        accessToken: auth.AuthenticationResult.AccessToken,
        refreshToken: auth.AuthenticationResult.RefreshToken,
        groups
      }),
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    };
  } catch (err) {
    console.error('Cognito auth error', err);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid credentials' }),
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    };
  }
};
