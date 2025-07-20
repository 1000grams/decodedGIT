import boto3
import json
import requests

try:
    secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
    secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
    
    print(f'Raw secret: {secret[""SecretString""]}')
    
    creds = json.loads(secret['SecretString'])
    print(' JSON parsing successful!')
    print(f'Client ID: {creds[""client_id""][:10]}...')
    
    # Test Spotify API
    auth_url = 'https://accounts.spotify.com/api/token'
    auth_data = {
        'grant_type': 'client_credentials',
        'client_id': creds['client_id'],
        'client_secret': creds['client_secret']
    }
    
    response = requests.post(auth_url, data=auth_data)
    
    if response.status_code == 200:
        print(' Spotify API authentication successful!')
        print(' SPOTIFY INTEGRATION IS WORKING!')
    else:
        print(f' Spotify auth failed: {response.status_code}')
        print(f'Response: {response.text}')
        
except Exception as e:
    print(f' Test failed: {e}')
