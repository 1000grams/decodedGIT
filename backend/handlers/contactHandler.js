const AWS = require('aws-sdk');
const ses = new AWS.SES({ region: 'eu-central-1' });

exports.handler = async (event) => {
  const body = JSON.parse(event.body || '{}');
  const { name, email, message } = body;
  const params = {
    Destination: { ToAddresses: ['ops@decodedmusic.com'] },
    Message: {
      Body: {
        Text: { Data: `Contact Form:\nName: ${name}\nEmail: ${email}\nMessage: ${message}` }
      },
      Subject: { Data: 'Decoded Contact Form' }
    },
    Source: 'ops@decodedmusic.com'
  };
  try {
    await ses.sendEmail(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Received' }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  } catch (err) {
    console.error('Contact error:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Submission failed' }),
      headers: { 'Access-Control-Allow-Origin': '*' }
    };
  }
};
