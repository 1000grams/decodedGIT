import boto3
import json

def test_json_parsing():
    try:
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
        
        print(f"Raw secret string: {secret['SecretString']}")
        print(f"Secret string type: {type(secret['SecretString'])}")
        
        # Try to parse JSON
        creds = json.loads(secret['SecretString'])
        
        print(f"✅ JSON parsing successful!")
        print(f"Client ID: {creds['client_id'][:10]}...")
        print(f"Client Secret: {creds['client_secret'][:10]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ JSON parsing failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 Testing JSON parsing...")
    success = test_json_parsing()
    print(f"Result: {'✅ SUCCESS' if success else '❌ FAILED'}")
