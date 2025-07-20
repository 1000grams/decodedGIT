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
        
        # Try alternative secret names
        alternative_names = [
            'spotify/credentials',
            'decoded/spotify/credentials',
            'prod/spotify',
            'spotify-credentials'
        ]
        
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        for alt_name in alternative_names:
            try:
                print(f"   Trying alternative secret name: {alt_name}")
                secret = secrets_client.get_secret_value(SecretId=alt_name)
                spotify_creds = json.loads(secret['SecretString'])
                print(f"✅ Found credentials at: {alt_name}")
                break
            except:
                continue
        else:
            print("❌ No Spotify credentials found in any location")
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
                    print(f"   Followers: {artist['followers']['total']:,}")
                    print(f"   Popularity: {artist['popularity']}/100")
                    print(f"   Spotify ID: {artist['id']}")
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

def check_secrets_manager():
    """Check what's actually in Secrets Manager"""
    print("\n🔑 Checking AWS Secrets Manager...")
    
    try:
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        
        # List all secrets
        response = secrets_client.list_secrets()
        
        print("📋 Available secrets:")
        spotify_secrets = []
        for secret in response['SecretList']:
            secret_name = secret['Name']
            print(f"   - {secret_name}")
            if 'spotify' in secret_name.lower():
                spotify_secrets.append(secret_name)
        
        if spotify_secrets:
            print(f"\n🎵 Found {len(spotify_secrets)} Spotify-related secrets:")
            for secret_name in spotify_secrets:
                print(f"   ✅ {secret_name}")
                return spotify_secrets[0]  # Return first found secret
        else:
            print("\n❌ No Spotify secrets found!")
            print("   You may need to create Spotify credentials in Secrets Manager")
            return None
            
    except Exception as e:
        print(f"❌ Failed to check Secrets Manager: {e}")
        return None

def test_lambda_endpoint():
    """Test the actual Lambda endpoint"""
    print("\n🔗 Testing Lambda Spotify Endpoint...")
    
    try:
        # Test without authentication first
        api_url = 'https://n64vgs0he0.execute-api.eu-central-1.amazonaws.com/prod/dashboard/spotify'
        
        print(f"📡 Calling: {api_url}")
        
        response = requests.get(api_url)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Lambda endpoint responding")
            try:
                data = response.json()
                print(f"   Response type: {type(data)}")
                if isinstance(data, dict):
                    print(f"   Response keys: {list(data.keys())}")
            except:
                print(f"   Response text: {response.text[:200]}...")
        elif response.status_code == 401:
            print("🔐 Authentication required (expected)")
        elif response.status_code == 403:
            print("🚫 Forbidden - check IAM permissions")
        elif response.status_code == 500:
            print("🔥 Server error - check Lambda logs")
            print(f"   Error response: {response.text}")
        else:
            print(f"❓ Unexpected status: {response.text}")
            
    except Exception as e:
        print(f"❌ Lambda endpoint test failed: {e}")

if __name__ == "__main__":
    print("🔍 SPOTIFY INTEGRATION DIAGNOSIS")
    print("=" * 50)
    
    # Check what secrets exist
    secret_name = check_secrets_manager()
    
    # Test direct API
    print("\n" + "=" * 50)
    direct_test = test_spotify_direct()
    
    # Test Lambda endpoint
    print("\n" + "=" * 50)
    test_lambda_endpoint()
    
    print(f"\n📊 SUMMARY:")
    print(f"   Direct Spotify API: {'✅ WORKING' if direct_test else '❌ FAILED'}")
    
    if not direct_test:
        print("\n💡 NEXT STEPS:")
        if not secret_name:
            print("   1. CREATE Spotify credentials in AWS Secrets Manager:")
            print("      aws secretsmanager create-secret --name 'prod/spotify/credentials'")
            print("      --secret-string '{\"client_id\":\"YOUR_ID\",\"client_secret\":\"YOUR_SECRET\"}'")
        print("   2. Verify client_id and client_secret are correct")
        print("   3. Ensure secrets are in eu-central-1 region")
        print("   4. Check CloudWatch logs for dashboardSpotify Lambda")