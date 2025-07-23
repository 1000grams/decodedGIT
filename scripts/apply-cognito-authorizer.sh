#!/bin/bash
API_ID=2h2oj7u446
REGION=eu-central-1
AUTHORIZER_ID=replace_with_your_authorizer_id

echo '🔐 Applying Cognito Authorizer to selected API Gateway methods...'
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 0yy2cq \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 0yy2cq \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 0yy2cq \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 0yy2cq \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 38zfkl \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 38zfkl \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 38zfkl \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 38zfkl \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 6njqrr \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 6njqrr \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 6njqrr \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 6njqrr \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 6sknk2 \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 6sknk2 \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 6sknk2 \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 6sknk2 \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 78tcjj \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 78tcjj \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 78tcjj \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 78tcjj \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 9stxe2 \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id 9stxe2 \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id b68o7x \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id b68o7x \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id b68o7x \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id b68o7x \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id bzmftn \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id bzmftn \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id bzmftn \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id bzmftn \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id fujz1x \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id fujz1x \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id fujz1x \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id fujz1x \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id m8rjvq \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id m8rjvq \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id m8rjvq \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id m8rjvq \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id mcz816 \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id mcz816 \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id mcz816 \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id mcz816 \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id vi70h2 \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id vi70h2 \
  --http-method GET \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id vi70h2 \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizationType,value=COGNITO_USER_POOLS
aws apigateway update-method \
  --rest-api-id $API_ID \
  --resource-id vi70h2 \
  --http-method POST \
  --region $REGION \
  --patch-operations op=replace,path=/authorizerId,value=$AUTHORIZER_ID

echo '🚀 Deploying API Gateway changes...'
aws apigateway create-deployment --rest-api-id $API_ID --stage-name prod --region $REGION
echo '✅ Deployment complete.'