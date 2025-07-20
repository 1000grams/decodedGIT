import boto3
import json

try:
    secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
    secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
    
    print(f"Raw secret: {secret['SecretString']}")
    
    creds = json.loads(secret['SecretString'])
    print("✅ JSON parsing successful!")
    print(f"Client ID: {creds['client_id'][:10]}...")
    print("🎯 JSON FORMAT IS NOW CORRECT!")
    
except Exception as e:
    print(f"❌ Still failed: {e}")
