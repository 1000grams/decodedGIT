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
<<<<<<< HEAD
    // 🔍 Fetch and log SSM Parameters
=======
    // \ud83d\udd0d Fetch and log SSM Parameters
>>>>>>> 23d180db33d9b8ccfbbae5c78a31eb4c3edf3d9e
    for (const name of ssmParams) {
      try {
        const param = await ssm.getParameter({
          Name: name,
          WithDecryption: false,
        }).promise();
<<<<<<< HEAD
        console.log(`✅ SSM Param [${name}]:`, param.Parameter.Value);
      } catch (err) {
        console.error(`❌ SSM Param [${name}] error:`, err.message);
      }
    }

    // 🔍 Fetch and log each secret
=======
        console.log(`\u2705 SSM Param [${name}]:`, param.Parameter.Value);
      } catch (err) {
        console.error(`\u274c SSM Param [${name}] error:`, err.message);
      }
    }

    // \ud83d\udd0d Fetch and log each secret
>>>>>>> 23d180db33d9b8ccfbbae5c78a31eb4c3edf3d9e
    for (const name of secretNames) {
      try {
        const secret = await secretsManager.getSecretValue({
          SecretId: name,
        }).promise();

<<<<<<< HEAD
        const parsed = secret.SecretString && secret.SecretString.startsWith("{")
          ? JSON.parse(secret.SecretString)
          : secret.SecretString;

        console.log(`✅ Secret [${name}]:`, parsed);
      } catch (err) {
        console.error(`❌ Secret [${name}] error:`, err.message);
=======
        const parsed = secret.SecretString.startsWith("{")
          ? JSON.parse(secret.SecretString)
          : secret.SecretString;

        console.log(`\u2705 Secret [${name}]:`, parsed);
      } catch (err) {
        console.error(`\u274c Secret [${name}] error:`, err.message);
>>>>>>> 23d180db33d9b8ccfbbae5c78a31eb4c3edf3d9e
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Secrets + Params test complete" }),
    };
  } catch (err) {
<<<<<<< HEAD
    console.error("💥 Unexpected error:", err.message);
=======
    console.error("\ud83d\udca5 Unexpected error:", err.message);
>>>>>>> 23d180db33d9b8ccfbbae5c78a31eb4c3edf3d9e
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
