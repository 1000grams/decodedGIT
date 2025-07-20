const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const USER_POOL_ID = process.env.USER_POOL_ID || '5fxmkd';
const CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const { email, password } = body;

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing credentials' }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  }

  const params = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: CLIENT_ID,
    AuthParameters: { USERNAME: email, PASSWORD: password }
  };

  try {
    const auth = await cognito.initiateAuth(params).promise();
    const groupsResp = await cognito
      .adminListGroupsForUser({ UserPoolId: USER_POOL_ID, Username: email })
      .promise();
    const groups = (groupsResp.Groups || []).map((g) => g.GroupName);
    return {
      statusCode: 200,
      body: JSON.stringify({
        idToken: auth.AuthenticationResult.IdToken,
        accessToken: auth.AuthenticationResult.AccessToken,
        refreshToken: auth.AuthenticationResult.RefreshToken,
        groups
      }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (err) {
    console.error('Cognito auth error', err);
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Invalid credentials' }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  }
};
