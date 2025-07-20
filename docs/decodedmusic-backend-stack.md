# decoded-genai-stack CloudFormation Stack

This stack is used by Codex and GitHub automation to provision the core backend services.

- **Stack Name:** `decoded-genai-stack`
- **Resources:** AWS Lambda, API Gateway and a DynamoDB table
- After deployment the CloudFormation console should show a status of `CREATE_COMPLETE`.

Deploy with:

```bash
aws cloudformation deploy \
  --template-file cloudformation/decodedMusicBackend.yaml \
  --stack-name decoded-genai-stack \
  --region eu-central-1 \
  --capabilities CAPABILITY_NAMED_IAM

To remove an old stack named `DecodedMusicBackend` run:

```bash
aws cloudformation delete-stack \
  --stack-name DecodedMusicBackend \
  --region eu-central-1
```
```

