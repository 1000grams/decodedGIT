import boto3
import json
import requests

try:
    secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
    secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
    
    print(f"Raw secret length: {len(secret['SecretString'])}")
    print(f"Raw secret: {repr(secret['SecretString'])}")
    
    creds = json.loads(secret['SecretString'])
    print("✅ JSON parsing successful!")
    print(f"Client ID: {creds['client_id'][:10]}...")
    
    # Test Spotify API authentication
    auth_url = 'https://accounts.spotify.com/api/token'
    auth_data = {
        'grant_type': 'client_credentials',
        'client_id': creds['client_id'],
        'client_secret': creds['client_secret']
    }
    
    response = requests.post(auth_url, data=auth_data)
    
    if response.status_code == 200:
        print("✅ Spotify API authentication successful!")
        token = response.json()['access_token']
        
        # Search for Rue de Vivre
        print("\n🔍 Searching for 'Rue de Vivre'...")
        search_url = 'https://api.spotify.com/v1/search'
        headers = {'Authorization': f'Bearer {token}'}
        params = {'q': 'Rue de Vivre', 'type': 'artist', 'limit': 5}
        
        search_response = requests.get(search_url, headers=headers, params=params)
        
        if search_response.status_code == 200:
            data = search_response.json()
            artists = data['artists']['items']
            
            if artists:
                print(f"✅ Found {len(artists)} artist(s):")
                for artist in artists:
                    print(f"   - {artist['name']} ({artist['followers']['total']:,} followers)")
            else:
                print("❌ No 'Rue de Vivre' artist found on Spotify")
                print("   This is why dashboard shows 'loading' - no data exists!")
        else:
            print(f"❌ Search failed: {search_response.status_code}")
    else:
        print(f"❌ Auth failed: {response.status_code}")
        print(f"Response: {response.text}")
        
except Exception as e:
    print(f"❌ Test failed: {e}")
