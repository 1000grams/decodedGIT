#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { TodoApiStack } from '../lib/todo-api-stack';

const app = new cdk.App();

export const stackName = 'decodedMusicBackend';


new TodoApiStack(app, stackName, {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || '396913703024', // Use a string for the account ID
    region: process.env.CDK_DEFAULT_REGION || 'eu-central-1',
  },
});