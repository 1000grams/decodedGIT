const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const USER_POOL_ID = process.env.USER_POOL_ID || '5fxmkd';
const REGION = process.env.AWS_REGION || 'us-east-1';
const jwksUri = `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`;

const client = jwksClient({ jwksUri });

function getKey(header, callback) {
  client.getSigningKey(header.kid, function (err, key) {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

exports.handler = async (event) => {
  const authHeader = event.headers && (event.headers.Authorization || event.headers.authorization);
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'Missing or invalid Authorization header' }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  }
  const token = authHeader.split(' ')[1];
  return new Promise((resolve) => {
    jwt.verify(token, getKey, { algorithms: ['RS256'] }, (err, decoded) => {
      if (err) {
        resolve({
          statusCode: 401,
          body: JSON.stringify({ message: 'Invalid token', error: err.message }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      } else {
        // Token is valid, you can add your business logic here
        resolve({
          statusCode: 200,
          body: JSON.stringify({ message: 'Token is valid', user: decoded }),
          headers: { 'Access-Control-Allow-Origin': '*' }
        });
      }
    });
  });
};
