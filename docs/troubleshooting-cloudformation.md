# Troubleshooting CloudFormation Stack Failures

If a stack creation fails, inspect the events to locate the resource that triggered `CREATE_FAILED`.

1. Open the **CloudFormation** console and select your stack.
2. Choose the **Events** tab and scroll to the earliest entries.
3. The row marked `CREATE_FAILED` lists the failed resource and an error message.

You can also retrieve these details via the AWS CLI:

```bash
aws cloudformation describe-stack-events --stack-name <your-stack-name> \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]' --output table
```

Look for the `ResourceStatusReason` field to determine why the resource failed.
