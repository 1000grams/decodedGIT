# Secrets Management

This project uses **AWS Secrets Manager** and **AWS Systems Manager Parameter Store** to keep sensitive values out of the source tree.

## Storing Secrets

Use Secrets Manager for API keys and other confidential tokens:

```bash
aws secretsmanager create-secret --name my/apiKey --secret-string '{"apiKey":"ABC123XYZ"}'
```

For configuration values that change infrequently, SSM Parameter Store with `SecureString` works well:

```bash
aws ssm put-parameter --name "/myapp/apiKey" --value "ABC123XYZ" --type "SecureString"
```

## Accessing Secrets in Lambda

A small helper at `backend/utils/secrets.js` fetches values on demand:

```javascript
const { getSecretValue, getParameter } = require('../utils/secrets');

exports.handler = async () => {
  const token = await getSecretValue(process.env.FACEBOOK_TOKEN_SECRET);
  const pageIds = (await getParameter(process.env.FACEBOOK_PAGE_IDS_PARAM)).split(',');
  // ...
};
```

See `.env.example` for the environment variables that hold secret or parameter names.
