"use strict";
// lib/todo-api-stack.ts
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TodoApiStack = void 0;
// --- Ensure these imports are at the top ---
const cdk = __importStar(require("aws-cdk-lib"));
const dynamodb = __importStar(require("aws-cdk-lib/aws-dynamodb"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
// --- This is the critical line ---
// Ensure your class `extends cdk.Stack`
class TodoApiStack extends cdk.Stack {
    // Ensure the constructor matches this signature
    constructor(scope, id, props) {
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
exports.TodoApiStack = TodoApiStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9kby1hcGktc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0b2RvLWFwaS1zdGFjay50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsd0JBQXdCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFeEIsOENBQThDO0FBQzlDLGlEQUFtQztBQUVuQyxtRUFBcUQ7QUFDckQsK0RBQWlEO0FBQ2pELHVFQUF5RDtBQUV6RCxvQ0FBb0M7QUFDcEMsd0NBQXdDO0FBQ3hDLE1BQWEsWUFBYSxTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQ3pDLGdEQUFnRDtJQUNoRCxZQUFZLEtBQWdCLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzlELHNDQUFzQztRQUN0QyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUV4Qix3Q0FBd0M7UUFFeEMsV0FBVztRQUNYLE1BQU0sS0FBSyxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQ2xELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ2pFLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVyxDQUFDLGVBQWU7WUFDakQsYUFBYSxFQUFFLEdBQUcsQ0FBQyxhQUFhLENBQUMsT0FBTyxFQUFFLHNDQUFzQztTQUNqRixDQUFDLENBQUM7UUFFSCxNQUFNLGNBQWMsR0FBRyxJQUFJLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUMvRCxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsNEJBQTRCO1lBQ2pFLE9BQU8sRUFBRSxlQUFlO1lBQ3hCLElBQUksRUFBRSxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsRUFBRSxtREFBbUQ7WUFDMUYsV0FBVyxFQUFFO2dCQUNYLFVBQVUsRUFBRSxLQUFLLENBQUMsU0FBUzthQUM1QjtTQUNGLENBQUMsQ0FBQztRQUVILDRFQUE0RTtRQUM1RSxLQUFLLENBQUMsa0JBQWtCLENBQUMsY0FBYyxDQUFDLENBQUM7UUFFekMsSUFBSSxVQUFVLENBQUMsYUFBYSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDNUMsT0FBTyxFQUFFLGNBQWM7WUFDdkIsS0FBSyxFQUFFLEtBQUssRUFBRSxzQkFBc0I7U0FDckMsQ0FBQyxDQUFDO0lBQ0wsQ0FBQztDQUNGO0FBaENELG9DQWdDQyIsInNvdXJjZXNDb250ZW50IjpbIi8vIGxpYi90b2RvLWFwaS1zdGFjay50c1xuXG4vLyAtLS0gRW5zdXJlIHRoZXNlIGltcG9ydHMgYXJlIGF0IHRoZSB0b3AgLS0tXG5pbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgKiBhcyBkeW5hbW9kYiBmcm9tICdhd3MtY2RrLWxpYi9hd3MtZHluYW1vZGInO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5cbi8vIC0tLSBUaGlzIGlzIHRoZSBjcml0aWNhbCBsaW5lIC0tLVxuLy8gRW5zdXJlIHlvdXIgY2xhc3MgYGV4dGVuZHMgY2RrLlN0YWNrYFxuZXhwb3J0IGNsYXNzIFRvZG9BcGlTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIC8vIEVuc3VyZSB0aGUgY29uc3RydWN0b3IgbWF0Y2hlcyB0aGlzIHNpZ25hdHVyZVxuICBjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wcz86IGNkay5TdGFja1Byb3BzKSB7XG4gICAgLy8gRW5zdXJlIGBwcm9wc2AgaXMgcGFzc2VkIHRvIHN1cGVyKClcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIC0tLSBQQVNURSBZT1VSIENESyBSRVNPVVJDRVMgSEVSRSAtLS1cbiAgICBcbiAgICAvLyBFeGFtcGxlOlxuICAgIGNvbnN0IHRhYmxlID0gbmV3IGR5bmFtb2RiLlRhYmxlKHRoaXMsICdUb2RvVGFibGUnLCB7XG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2lkJywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIGJpbGxpbmdNb2RlOiBkeW5hbW9kYi5CaWxsaW5nTW9kZS5QQVlfUEVSX1JFUVVFU1QsXG4gICAgICByZW1vdmFsUG9saWN5OiBjZGsuUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLCAvLyBGb3IgZWFzeSBjbGVhbnVwIGR1cmluZyBkZXZlbG9wbWVudFxuICAgIH0pO1xuXG4gICAgY29uc3QgbGFtYmRhRnVuY3Rpb24gPSBuZXcgbGFtYmRhLkZ1bmN0aW9uKHRoaXMsICdUb2RvRnVuY3Rpb24nLCB7XG4gICAgICBydW50aW1lOiBsYW1iZGEuUnVudGltZS5OT0RFSlNfMThfWCwgLy8gT3IgeW91ciBwcmVmZXJyZWQgcnVudGltZVxuICAgICAgaGFuZGxlcjogJ2luZGV4LmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCdsYW1iZGEnKSwgLy8gQXNzdW1lcyB5b3VyIGxhbWJkYSBjb2RlIGlzIGluIGEgJ2xhbWJkYScgZm9sZGVyXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBUQUJMRV9OQU1FOiB0YWJsZS50YWJsZU5hbWUsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gR3JhbnQgdGhlIExhbWJkYSBmdW5jdGlvbiBwZXJtaXNzaW9ucyB0byByZWFkL3dyaXRlIHRvIHRoZSBEeW5hbW9EQiB0YWJsZVxuICAgIHRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShsYW1iZGFGdW5jdGlvbik7XG5cbiAgICBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFSZXN0QXBpKHRoaXMsICdUb2RvQXBpJywge1xuICAgICAgaGFuZGxlcjogbGFtYmRhRnVuY3Rpb24sXG4gICAgICBwcm94eTogZmFsc2UsIC8vIFVzZSBzcGVjaWZpYyByb3V0ZXNcbiAgICB9KTtcbiAgfVxufSJdfQ==