import boto3
import json
import requests

def check_api_gateway_cors():
    print("🌐 API GATEWAY CORS VERIFICATION")
    print("=" * 50)
    
    try:
        apigw_client = boto3.client('apigateway', region_name='eu-central-1')
        correct_api_id = 'm5vfcsuueh'
        
        print(f"\n🔍 Checking API Gateway: {correct_api_id}")
        
        try:
            correct_api = apigw_client.get_rest_api(restApiId=correct_api_id)
            print(f"   ✅ API Name: {correct_api['name']}")
            
            resources = apigw_client.get_resources(restApiId=correct_api_id)
            
            cors_enabled = False
            for resource in resources['items']:
                if 'resourceMethods' in resource:
                    methods = resource['resourceMethods']
                    if 'OPTIONS' in methods:
                        cors_enabled = True
                        print(f"   ✅ CORS OPTIONS method found on: {resource['path']}")
            
            if not cors_enabled:
                print("   ❌ NO CORS OPTIONS METHODS FOUND!")
                print("      This explains the CORS policy errors!")
            
        except Exception as e:
            print(f"   ❌ Error checking API: {e}")
        
    except Exception as e:
        print(f"❌ API Gateway check failed: {e}")

def check_lambda_permissions():
    print(f"\n🔐 LAMBDA IAM PERMISSIONS CHECK")
    print("=" * 50)
    
    try:
        lambda_client = boto3.client('lambda', region_name='eu-central-1')
        
        print("🔍 Searching for dashboard Lambda functions...")
        
        functions = lambda_client.list_functions()
        
        dashboard_functions = []
        for func in functions['Functions']:
            func_name = func['FunctionName']
            if any(keyword in func_name.lower() for keyword in ['dashboard', 'spotify', 'accounting']):
                dashboard_functions.append(func_name)
                print(f"   ✅ Found: {func_name}")
                
                try:
                    policy = lambda_client.get_policy(FunctionName=func_name)
                    print(f"      📋 Has resource policy")
                except lambda_client.exceptions.ResourceNotFoundException:
                    print(f"      ❌ NO RESOURCE POLICY - API Gateway can't invoke!")
                except Exception as e:
                    print(f"      ⚠️  Policy check error: {e}")
        
        if not dashboard_functions:
            print("   ❌ NO DASHBOARD LAMBDA FUNCTIONS FOUND!")
            print("      This explains the 403 Forbidden errors!")
        
    except Exception as e:
        print(f"❌ Lambda permissions check failed: {e}")

def test_correct_endpoints():
    print(f"\n🧪 TESTING CORRECT API ENDPOINTS")
    print("=" * 50)
    
    correct_base = "https://m5vfcsuueh.execute-api.eu-central-1.amazonaws.com/prod"
    endpoints_to_test = [
        f"{correct_base}/dashboard/spotify",
        f"{correct_base}/dashboard/accounting",
        f"{correct_base}/spotify",
        f"{correct_base}/accounting"
    ]
    
    for endpoint in endpoints_to_test:
        try:
            print(f"\n🔗 Testing: {endpoint}")
            response = requests.get(endpoint, timeout=10)
            print(f"   Status: {response.status_code}")
            
            cors_headers = ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers']
            
            cors_present = False
            for header in cors_headers:
                if header in response.headers:
                    print(f"   ✅ {header}: {response.headers[header]}")
                    cors_present = True
            
            if not cors_present:
                print("   ❌ NO CORS HEADERS FOUND!")
                print("      This will cause browser CORS policy errors!")
            
            if response.status_code == 403:
                print("   ❌ 403 Forbidden - Lambda permissions issue!")
            elif response.status_code == 401:
                print("   ✅ 401 Unauthorized - Function exists, needs auth")
            elif response.status_code == 200:
                print("   ✅ 200 OK - Working perfectly!")
                
        except requests.exceptions.Timeout:
            print("   ⚠️  Timeout - endpoint may not exist")
        except Exception as e:
            print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    check_api_gateway_cors()
    check_lambda_permissions() 
    test_correct_endpoints()
