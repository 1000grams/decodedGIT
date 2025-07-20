const AWS = require("aws-sdk");
const ses = new AWS.SES({ region: "eu-central-1" });

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  const { name, email, company, role, message, type } = body;

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
    await ses.sendEmail(emailParams).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Submitted successfully" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  } catch (error) {
    console.error("Signup Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Submission failed" }),
      headers: { "Access-Control-Allow-Origin": "*" },
    };
  }
};
