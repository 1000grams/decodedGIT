const AWS = require('aws-sdk');
const secrets = new AWS.SecretsManager();
const ssm = new AWS.SSM();

async function getSecretValue(id) {
  if (!id) return undefined;
  const { SecretString, SecretBinary } = await secrets.getSecretValue({ SecretId: id }).promise();
  const value = SecretString || Buffer.from(SecretBinary, 'base64').toString('utf8');
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

async function getParameter(name) {
  if (!name) return undefined;
  const { Parameter } = await ssm.getParameter({ Name: name, WithDecryption: true }).promise();
  return Parameter.Value;
}

module.exports = { getSecretValue, getParameter };
