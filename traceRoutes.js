import {
  ApiGatewayV2Client,
  GetApisCommand,
  GetRoutesCommand,
  GetIntegrationsCommand,
} from '@aws-sdk/client-apigatewayv2';
import { LambdaClient, GetFunctionCommand } from '@aws-sdk/client-lambda';

const region = 'eu-central-1'; // set your region
const apiClient = new ApiGatewayV2Client({ region });
const lambdaClient = new LambdaClient({ region });

async function traceRoutes() {
  const apis = await apiClient.send(new GetApisCommand({}));
  for (const api of apis.Items) {
    console.log(`🔍 API: ${api.Name} (${api.ApiId})`);

    const routes = await apiClient.send(new GetRoutesCommand({ ApiId: api.ApiId }));
    const integrations = await apiClient.send(new GetIntegrationsCommand({ ApiId: api.ApiId }));

    for (const route of routes.Items) {
      const integration = integrations.Items.find(i => i.IntegrationId === route.Target?.split('/')[1]);
      if (integration?.IntegrationUri?.includes('lambda')) {
        const lambdaArn = decodeURIComponent(integration.IntegrationUri.split('/functions/')[1].split('/invocations')[0]);
        const fn = await lambdaClient.send(new GetFunctionCommand({ FunctionName: lambdaArn }));
        console.log(`  - 🛣️ Route: ${route.RouteKey} ➝ Lambda: ${fn.Configuration.FunctionName}`);
      }
    }
  }
}

traceRoutes().catch(console.error);
