const {
  CognitoIdentityProviderClient,
  SignUpCommand,
} = require("@aws-sdk/client-cognito-identity-provider");
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const REGION = process.env.AWS_REGION || "eu-central-1";
const CLIENT_ID = process.env.USER_POOL_CLIENT_ID;

const cognito = new CognitoIdentityProviderClient({ region: REGION });
const ses = new SESClient({ region: REGION });

exports.handler = async (event) => {
  const body = JSON.parse(event.body || "{}");
  const { name, email, password, company, role, message, type } = body;

  if (!email || !password) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Email and password required" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }

  const signupCommand = new SignUpCommand({
    ClientId: CLIENT_ID,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "name", Value: name || "" },
      { Name: "email", Value: email },
    ],
  });

  const emailParams = {
    Destination: { ToAddresses: ["ops@decodedmusic.com"] },
    Message: {
      Body: {
        Text: {
          Data: `New Signup (${type}):\nName: ${name}\nEmail: ${email}\nCompany: ${company}\nRole: ${role}\nMessage: ${message}`,
        },
      },
      Subject: { Data: `\uD83C\uDFB6 New Signup – ${type === "artist" ? "Artist" : "Licensing"} Inquiry` },
    },
    Source: "ops@decodedmusic.com",
  };

  try {
    await cognito.send(signupCommand);
    await ses.send(new SendEmailCommand(emailParams));
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Signup successful" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (error) {
    console.error("Signup Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Signup failed" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
};
