import boto3
import requests
import json
from botocore.exceptions import ClientError

def test_spotify_direct():
    """Test Spotify API directly without Lambda"""
    print("🎵 Testing Spotify API Direct Connection...")
    
    # Get Spotify credentials from Secrets Manager
    try:
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
        spotify_creds = json.loads(secret['SecretString'])
        
        print("✅ Spotify credentials retrieved from Secrets Manager")
        print(f"   Client ID: {spotify_creds.get('client_id', 'Not found')[:10]}...")
        
    except Exception as e:
        print(f"❌ Failed to get Spotify credentials: {e}")
        return False
    
    # Test Spotify Web API
    try:
        # Get access token
        auth_url = 'https://accounts.spotify.com/api/token'
        auth_data = {
            'grant_type': 'client_credentials',
            'client_id': spotify_creds['client_id'],
            'client_secret': spotify_creds['client_secret']
        }
        
        auth_response = requests.post(auth_url, data=auth_data)
        
        if auth_response.status_code == 200:
            token_data = auth_response.json()
            access_token = token_data['access_token']
            print("✅ Spotify access token obtained")
            
            # Test search API
            search_url = 'https://api.spotify.com/v1/search'
            headers = {'Authorization': f'Bearer {access_token}'}
            params = {'q': 'Rue de Vivre', 'type': 'artist', 'limit': 1}
            
            search_response = requests.get(search_url, headers=headers, params=params)
            
            if search_response.status_code == 200:
                print("✅ Spotify Search API working")
                search_data = search_response.json()
                if search_data['artists']['items']:
                    artist = search_data['artists']['items'][0]
                    print(f"   Found artist: {artist['name']}")
                    print(f"   Followers: {artist['followers']['total']}")
                    return True
                else:
                    print("⚠️  No Rue de Vivre artist found")
                    return False
            else:
                print(f"❌ Spotify Search API failed: {search_response.status_code}")
                print(f"   Response: {search_response.text}")
                return False
        else:
            print(f"❌ Spotify auth failed: {auth_response.status_code}")
            print(f"   Response: {auth_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Spotify API test failed: {e}")
        return False

def test_lambda_spotify_endpoint():
    """Test the Lambda Spotify endpoint"""
    print("\n🔗 Testing Lambda Spotify Endpoint...")
    
    try:
        # Test the actual Lambda endpoint
        api_url = 'https://n64vgs0he0.execute-api.eu-central-1.amazonaws.com/prod/dashboard/spotify'
        
        # You'll need to add proper authentication headers
        headers = {
            'Content-Type': 'application/json',
            # Add Cognito authorization header here
        }
        
        response = requests.get(api_url, headers=headers)
        
        print(f"Lambda endpoint status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("✅ Lambda Spotify endpoint working")
            print(f"   Response keys: {list(data.keys())}")
            return True
        else:
            print(f"❌ Lambda endpoint failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Lambda endpoint test failed: {e}")
        return False

if __name__ == "__main__":
    print("🔍 SPOTIFY INTEGRATION DIAGNOSIS")
    print("=" * 50)
    
    # Test direct API
    direct_test = test_spotify_direct()
    
    # Test Lambda endpoint
    lambda_test = test_lambda_spotify_endpoint()
    
    print(f"\n📊 RESULTS:")
    print(f"   Direct Spotify API: {'✅ PASS' if direct_test else '❌ FAIL'}")
    print(f"   Lambda Endpoint: {'✅ PASS' if lambda_test else '❌ FAIL'}")
    
    if direct_test and not lambda_test:
        print("\n💡 RECOMMENDATION: Lambda function needs debugging")
        print("   Check dashboardSpotify Lambda logs in CloudWatch")
    elif not direct_test:
        print("\n💡 RECOMMENDATION: Check Spotify credentials in Secrets Manager")