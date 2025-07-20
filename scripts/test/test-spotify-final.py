import boto3
import requests
import json

def test_spotify_credentials():
    try:
        # Get credentials from the fixed secret
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
        creds = json.loads(secret['SecretString'])
        
        print(f"   Client ID: {creds['client_id'][:10]}...")
        print(f"   Client Secret: {creds['client_secret'][:10]}...")
        
        # Test Spotify API
        auth_url = 'https://accounts.spotify.com/api/token'
        auth_data = {
            'grant_type': 'client_credentials',
            'client_id': creds['client_id'],
            'client_secret': creds['client_secret']
        }
        
        response = requests.post(auth_url, data=auth_data)
        
        if response.status_code == 200:
            print("   ✅ Spotify API authentication successful!")
            token_data = response.json()
            access_token = token_data['access_token']
            
            # Test search
            search_url = 'https://api.spotify.com/v1/search'
            headers = {'Authorization': f'Bearer {access_token}'}
            params = {'q': 'Rue de Vivre', 'type': 'artist', 'limit': 1}
            
            search_response = requests.get(search_url, headers=headers, params=params)
            
            if search_response.status_code == 200:
                data = search_response.json()
                if data['artists']['items']:
                    artist = data['artists']['items'][0]
                    print(f"   ✅ Found artist: {artist['name']}")
                    print(f"   ✅ Followers: {artist['followers']['total']:,}")
                    return True
                else:
                    print("   ⚠️  Artist not found but API is working")
                    return True
            else:
                print(f"   ❌ Search failed: {search_response.status_code}")
                return False
        else:
            print(f"   ❌ Auth failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Test failed: {e}")
        return False

if __name__ == "__main__":
    print("🎵 Testing Spotify API Integration...")
    success = test_spotify_credentials()
    print(f"   Result: {'✅ SUCCESS' if success else '❌ FAILED'}")
