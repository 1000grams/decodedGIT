// lib/todo-api-stack.ts

// --- Ensure these imports are at the top ---
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

// --- This is the critical line ---
// Ensure your class `extends cdk.Stack`
export class TodoApiStack extends cdk.Stack {
  // Ensure the constructor matches this signature
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    // Ensure `props` is passed to super()
    super(scope, id, props);

    // --- PASTE YOUR CDK RESOURCES HERE ---
    
    // Example:
    const table = new dynamodb.Table(this, 'TodoTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // For easy cleanup during development
    });

    const lambdaFunction = new lambda.Function(this, 'TodoFunction', {
      runtime: lambda.Runtime.NODEJS_18_X, // Or your preferred runtime
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lambda'), // Assumes your lambda code is in a 'lambda' folder
      environment: {
        TABLE_NAME: table.tableName,
      },
    });

    // Grant the Lambda function permissions to read/write to the DynamoDB table
    table.grantReadWriteData(lambdaFunction);

    new apigateway.LambdaRestApi(this, 'TodoApi', {
      handler: lambdaFunction,
      proxy: false, // Use specific routes
    });
  }
}