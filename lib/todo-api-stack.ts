// lib/todo-api-stack.ts

import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class TodoApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 1. The DynamoDB Table
    const table = new dynamodb.Table(this, 'TodoTable', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // 2. Create a Lambda function for EACH action
    const addTodoLambda = new lambda.Function(this, 'AddTodoFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'addTodo.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: { TABLE_NAME: table.tableName },
    });

    const getTodosLambda = new lambda.Function(this, 'GetTodosFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'getTodos.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: { TABLE_NAME: table.tableName },
    });
    
    const getTodoLambda = new lambda.Function(this, 'GetTodoFunction', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'getTodo.handler',
        code: lambda.Code.fromAsset('lambda'),
        environment: { TABLE_NAME: table.tableName },
    });

    const updateTodoLambda = new lambda.Function(this, 'UpdateTodoFunction', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'updateTodo.handler',
        code: lambda.Code.fromAsset('lambda'),
        environment: { TABLE_NAME: table.tableName },
    });

    const deleteTodoLambda = new lambda.Function(this, 'DeleteTodoFunction', {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'deleteTodo.handler',
        code: lambda.Code.fromAsset('lambda'),
        environment: { TABLE_NAME: table.tableName },
    });

    // 3. Grant table permissions to each Lambda
    table.grantReadWriteData(addTodoLambda);
    table.grantReadData(getTodosLambda);
    table.grantReadData(getTodoLambda);
    table.grantReadWriteData(updateTodoLambda);
    table.grantReadWriteData(deleteTodoLambda);

    // 4. Create the API Gateway and add a resource for '/todos'
    const api = new apigateway.RestApi(this, 'TodoApi', {
      restApiName: 'Todo Service API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      }
    });

    const todosResource = api.root.addResource('todos');

    // 5. Add methods to the '/todos' resource
    todosResource.addMethod('POST', new apigateway.LambdaIntegration(addTodoLambda));
    todosResource.addMethod('GET', new apigateway.LambdaIntegration(getTodosLambda));
    
    // 6. Add a sub-resource for '/todos/{id}'
    const todoByIdResource = todosResource.addResource('{id}');

    // 7. Add methods to the '/todos/{id}' resource
    todoByIdResource.addMethod('GET', new apigateway.LambdaIntegration(getTodoLambda));
    todoByIdResource.addMethod('PUT', new apigateway.LambdaIntegration(updateTodoLambda));
    todoByIdResource.addMethod('DELETE', new apigateway.LambdaIntegration(deleteTodoLambda));
  }
}