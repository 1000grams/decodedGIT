import boto3
import requests
import base64

# Configuration
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'
DYNAMO_CATALOG_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
CATALOG_ARTIST_ID = 'ruedevivre'

dynamodb = boto3.resource('dynamodb')

def test_spotify_auth():
    """Test Spotify authentication"""
    print("🔐 Testing Spotify Authentication...")
    
    auth_url = 'https://accounts.spotify.com/api/token'
    credentials = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    credentials_b64 = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        'Authorization': f'Basic {credentials_b64}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    data = {'grant_type': 'client_credentials'}
    
    try:
        response = requests.post(auth_url, headers=headers, data=data)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"   ✅ Success! Token: {token[:20]}...")
            return token
        else:
            print(f"   ❌ Failed: {response.text}")
            return None
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return None

def check_catalog_status():
    """Check catalog and linking status"""
    print("\n📚 Checking Catalog Status...")
    
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        # Total works
        total_response = catalog_table.scan(
            FilterExpression='artistId = :aid AND #type = :type',
            ExpressionAttributeNames={'#type': 'type'},
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID, ':type': 'work'}
        )
        
        total_works = total_response['Count']
        print(f"   📊 Total works in catalog: {total_works}")
        
        # Linked works
        linked_response = catalog_table.scan(
            FilterExpression='artistId = :aid AND attribute_exists(spotifyLink)',
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID}
        )
        
        linked_works = linked_response['Count']
        print(f"   🔗 Spotify linked works: {linked_works}")
        
        # Album breakdown
        album_counts = {}
        for item in total_response['Items']:
            album = item.get('albumInfo', {}).get('album', 'Unknown Album')
            album_counts[album] = album_counts.get(album, 0) + 1
        
        print(f"   📀 Albums in catalog:")
        for album, count in album_counts.items():
            print(f"      {album}: {count} tracks")
        
        # Show sample linked track IDs
        if linked_response['Items']:
            print(f"   🎵 Sample Spotify IDs:")
            for item in linked_response['Items'][:3]:
                spotify_link = item.get('spotifyLink', {})
                track_id = spotify_link.get('trackId', 'No ID')
                title = item.get('Title', 'Unknown')
                print(f"      {title}: {track_id}")
        
        return linked_response['Items']
        
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return []

def test_spotify_api(token, track_id):
    """Test Spotify API with a sample track"""
    print(f"\n🧪 Testing Spotify API with track: {track_id}")
    
    headers = {'Authorization': f'Bearer {token}'}
    
    try:
        response = requests.get(
            f"https://api.spotify.com/v1/audio-features/{track_id}",
            headers=headers
        )
        
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            features = response.json()
            print(f"   ✅ Success! Energy: {features.get('energy', 'N/A')}")
            return True
        else:
            print(f"   ❌ Failed: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Run diagnostic tests"""
    print("🔍 SPOTIFY SETUP DIAGNOSTIC")
    print("=" * 40)
    
    # Test Spotify auth
    token = test_spotify_auth()
    
    # Check catalog
    linked_tracks = check_catalog_status()
    
    # Test API if we have both token and tracks
    if token and linked_tracks:
        sample_track = linked_tracks[0]
        spotify_link = sample_track.get('spotifyLink', {})
        track_id = spotify_link.get('trackId')
        
        if track_id:
            test_spotify_api(token, track_id)
    
    print(f"\n🎯 RECOMMENDATIONS:")
    if not token:
        print("   1. Check Spotify Client ID/Secret")
        print("   2. Verify Spotify app is active")
    
    if len(linked_tracks) < 40:
        print("   3. Run load-ascap-works-albums.py to load all 4 albums")
        print("   4. Run spotify-auto-linker.py to link all tracks")
    
    print("   5. Make sure all 40 tracks are loaded and linked before analysis")

if __name__ == "__main__":
    main()