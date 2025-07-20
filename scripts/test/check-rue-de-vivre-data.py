import boto3
import json
import requests

def check_rue_de_vivre_data():
    print("🎵 CHECKING RUE DE VIVRE SPOTIFY DATA")
    print("=" * 50)
    
    try:
        # Get credentials
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
        creds = json.loads(secret['SecretString'])
        
        # Get Spotify token
        auth_url = 'https://accounts.spotify.com/api/token'
        auth_data = {
            'grant_type': 'client_credentials',
            'client_id': creds['client_id'],
            'client_secret': creds['client_secret']
        }
        
        auth_response = requests.post(auth_url, data=auth_data)
        
        if auth_response.status_code == 200:
            token = auth_response.json()['access_token']
            headers = {'Authorization': f'Bearer {token}'}
            
            # Search for Rue de Vivre
            print("\n🔍 Searching for 'Rue de Vivre' on Spotify...")
            search_url = 'https://api.spotify.com/v1/search'
            params = {
                'q': 'Rue de Vivre',
                'type': 'artist',
                'limit': 5
            }
            
            search_response = requests.get(search_url, headers=headers, params=params)
            
            if search_response.status_code == 200:
                data = search_response.json()
                artists = data['artists']['items']
                
                if artists:
                    print(f"✅ Found {len(artists)} artist(s) matching 'Rue de Vivre':")
                    
                    for i, artist in enumerate(artists, 1):
                        print(f"\n📊 Artist {i}:")
                        print(f"   Name: {artist['name']}")
                        print(f"   ID: {artist['id']}")
                        print(f"   Followers: {artist['followers']['total']:,}")
                        print(f"   Popularity: {artist['popularity']}/100")
                        print(f"   Genres: {', '.join(artist['genres']) if artist['genres'] else 'None listed'}")
                        print(f"   Spotify URL: {artist['external_urls']['spotify']}")
                        
                        # Get top tracks for the first artist
                        if i == 1:
                            print(f"\n🎵 Getting top tracks for {artist['name']}...")
                            tracks_url = f"https://api.spotify.com/v1/artists/{artist['id']}/top-tracks"
                            tracks_params = {'market': 'US'}
                            
                            tracks_response = requests.get(tracks_url, headers=headers, params=tracks_params)
                            
                            if tracks_response.status_code == 200:
                                tracks_data = tracks_response.json()
                                tracks = tracks_data.get('tracks', [])
                                
                                if tracks:
                                    print(f"   ✅ Found {len(tracks)} top tracks:")
                                    for j, track in enumerate(tracks[:5], 1):
                                        print(f"      {j}. {track['name']} (Popularity: {track['popularity']}/100)")
                                else:
                                    print("   ⚠️  No top tracks found")
                            else:
                                print(f"   ❌ Failed to get top tracks: {tracks_response.status_code}")
                else:
                    print("❌ No artists found matching 'Rue de Vivre'")
                    print("   This explains why the dashboard shows 'loading' - no data exists!")
                    
                    # Try alternative searches
                    print("\n🔍 Trying alternative searches...")
                    alt_searches = ['Rue', 'de Vivre', 'RueDeVivre']
                    
                    for alt_term in alt_searches:
                        alt_params = {'q': alt_term, 'type': 'artist', 'limit': 3}
                        alt_response = requests.get(search_url, headers=headers, params=alt_params)
                        
                        if alt_response.status_code == 200:
                            alt_data = alt_response.json()
                            alt_artists = alt_data['artists']['items']
                            
                            if alt_artists:
                                print(f"   ✅ Found {len(alt_artists)} results for '{alt_term}':")
                                for artist in alt_artists[:2]:
                                    print(f"      - {artist['name']} ({artist['followers']['total']:,} followers)")
            else:
                print(f"❌ Search failed: {search_response.status_code}")
                print(f"Response: {search_response.text}")
        else:
            print(f"❌ Authentication failed: {auth_response.status_code}")
            
    except Exception as e:
        print(f"❌ Test failed: {e}")

if __name__ == "__main__":
    check_rue_de_vivre_data()
