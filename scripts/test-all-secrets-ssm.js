const AWS = require("aws-sdk");
const ssm = new AWS.SSM();
const secretsManager = new AWS.SecretsManager();

const secretNames = [
  "my/newsApiKey",
  "my/stripeSecret",
  "my/facebookToken",
  "my/instagramToken",
  "my/spotifyClientId",
  "my/spotifyClientSecret",
];

const ssmParams = ["/decoded/s3Bucket"];

exports.handler = async () => {
  try {
    // Fetch and log SSM Parameters
    for (const name of ssmParams) {
      try {
        const param = await ssm
          .getParameter({ Name: name, WithDecryption: false })
          .promise();
        console.log(`✅ SSM Param [${name}]:`, param.Parameter.Value);
      } catch (err) {
        console.error(`❌ SSM Param [${name}] error:`, err.message);
      }
    }

    // Fetch and log each secret
    for (const name of secretNames) {
      try {
        const secret = await secretsManager
          .getSecretValue({ SecretId: name })
          .promise();

        const parsed = secret.SecretString.startsWith("{")
          ? JSON.parse(secret.SecretString)
          : secret.SecretString;

        console.log(`✅ Secret [${name}]:`, parsed);
      } catch (err) {
        console.error(`❌ Secret [${name}] error:`, err.message);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Secrets + Params test complete" }),
    };
  } catch (err) {
    console.error("💥 Unexpected error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};

// Allow running in CloudShell
if (require.main === module) {
  exports.handler();
}

