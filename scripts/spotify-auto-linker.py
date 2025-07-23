import boto3
import json
import requests
import time
import base64
from datetime import datetime
from botocore.exceptions import ClientError

# --- Configuration ---
DYNAMO_CATALOG_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
ARTIST_ID = 'ruedevivre'
ARTIST_NAME = 'Rue De Vivre'

# --- Spotify API Configuration (Your actual credentials) ---
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'

# --- AWS Clients ---
dynamodb = boto3.resource('dynamodb')

def get_consolidated_works():
    """Get consolidated works with RDV IDs"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        # First try to get consolidated works
        try:
            response = catalog_table.scan(
                FilterExpression='artistId = :aid AND #type = :type AND consolidated = :consolidated',
                ExpressionAttributeNames={'#type': 'type'},
                ExpressionAttributeValues={
                    ':aid': ARTIST_ID,
                    ':type': 'work',
                    ':consolidated': True
                }
            )
            consolidated_works = response['Items']
            
            if consolidated_works:
                print(f"📊 Found {len(consolidated_works)} consolidated works")
                return consolidated_works
        except:
            pass
        
        # If no consolidated works, get all works
        print("⚠️ No consolidated works found, getting all works...")
        response = catalog_table.scan(
            FilterExpression='artistId = :aid',
            ExpressionAttributeValues={':aid': ARTIST_ID}
        )
        
        all_works = response['Items']
        print(f"📊 Found {len(all_works)} total works")
        return all_works
        
    except Exception as e:
        print(f"❌ Error getting works: {e}")
        return []

def get_spotify_token():
    """Get Spotify access token with PROPER authentication"""
    auth_url = 'https://accounts.spotify.com/api/token'
    
    # Method 1: Basic Auth (Recommended by Spotify)
    credentials = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    credentials_b64 = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        'Authorization': f'Basic {credentials_b64}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    data = {
        'grant_type': 'client_credentials'
    }
    
    try:
        print("🔐 Authenticating with Spotify...")
        print(f"🔑 Client ID: {SPOTIFY_CLIENT_ID}")
        response = requests.post(auth_url, headers=headers, data=data)
        
        if response.status_code == 200:
            print("✅ Spotify authentication successful")
            return response.json().get('access_token')
        else:
            print(f"❌ Basic auth failed: {response.status_code}")
            print(f"Response: {response.text}")
            
            # Method 2: Form data (fallback)
            print("🔄 Trying form data method...")
            auth_data = {
                'grant_type': 'client_credentials',
                'client_id': SPOTIFY_CLIENT_ID,
                'client_secret': SPOTIFY_CLIENT_SECRET
            }
            
            response2 = requests.post(auth_url, data=auth_data)
            if response2.status_code == 200:
                print("✅ Form data authentication successful")
                return response2.json().get('access_token')
            else:
                print(f"❌ Both methods failed: {response2.status_code}")
                print(f"Response: {response2.text}")
                return None
                
    except Exception as e:
        print(f"❌ Spotify auth error: {e}")
        return None

def search_spotify_for_work(work, access_token):
    """Search Spotify for a work"""
    # Try multiple field names for title
    title = work.get('title', work.get('Title', work.get('Work_Title', 'Unknown')))
    rdv_id = work.get('rdvId', 'N/A')
    work_id = work.get('id', 'N/A')
    
    if title == 'Unknown' or not title:
        print(f"   ⚠️ No title found for work {work_id}")
        return []
    
    print(f"   🔍 Searching for: '{title}'")
    
    # Try multiple search strategies with more artist variations
    search_queries = [
        f'track:"{title}" artist:"{ARTIST_NAME}"',
        f'"{title}" "{ARTIST_NAME}"',
        f'{title} {ARTIST_NAME}',
        f'artist:"{ARTIST_NAME}" {title}',
        f'track:"{title}" artist:"Rue De Vivre"',
        f'track:"{title}" artist:"Avril"',
        f'{title} Avril Hue'
    ]
    
    url = "https://api.spotify.com/v1/search"
    headers = {'Authorization': f'Bearer {access_token}'}
    
    all_results = []
    
    for query in search_queries[:4]:  # Limit to avoid rate limits
        params = {
            'q': query,
            'type': 'track',
            'limit': 10,
            'market': 'US'
        }
        
        try:
            response = requests.get(url, headers=headers, params=params)
            if response.status_code == 200:
                data = response.json()
                tracks = data.get('tracks', {}).get('items', [])
                
                for track in tracks:
                    # More flexible artist matching
                    artist_match = any(
                        'rue de vivre' in artist['name'].lower() or 
                        'avril' in artist['name'].lower() or
                        'hue' in artist['name'].lower() or
                        ARTIST_NAME.lower() in artist['name'].lower() or
                        artist['name'].lower() in ARTIST_NAME.lower()
                        for artist in track['artists']
                    )
                    
                    if artist_match:
                        # Calculate confidence
                        track_title = track['name'].lower()
                        search_title = title.lower()
                        
                        confidence = 'high'
                        if search_title not in track_title and track_title not in search_title:
                            confidence = 'medium'
                        
                        track_data = {
                            'trackId': track['id'],
                            'name': track['name'],
                            'artists': [artist['name'] for artist in track['artists']],
                            'album': track['album']['name'],
                            'url': track['external_urls']['spotify'],
                            'previewUrl': track.get('preview_url'),
                            'popularity': track['popularity'],
                            'duration_ms': track['duration_ms'],
                            'rdvId': rdv_id,
                            'workId': work_id,
                            'searchQuery': query,
                            'confidence': confidence
                        }
                        all_results.append(track_data)
                
                # If we found good matches with the first query, use them
                if all_results and query == search_queries[0]:
                    break
                    
        except Exception as e:
            print(f"   ❌ Search error for query '{query}': {e}")
            continue
    
    # Remove duplicates and return top matches
    unique_results = []
    seen_ids = set()
    for result in all_results:
        if result['trackId'] not in seen_ids:
            unique_results.append(result)
            seen_ids.add(result['trackId'])
    
    # Sort by confidence and popularity
    unique_results.sort(key=lambda x: (x['confidence'] == 'high', x['popularity']), reverse=True)
    
    return unique_results[:3]

def update_work_with_spotify(work_id, spotify_results):
    """Update work with Spotify links (simplified to avoid nested update errors)"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        if spotify_results:
            best_match = spotify_results[0]  # Use highest confidence match
            
            # Simple update to avoid nested attribute errors
            catalog_table.update_item(
                Key={'id': work_id},
                UpdateExpression='SET spotifyLink = :spotify_link, updatedAt = :updated',
                ExpressionAttributeValues={
                    ':spotify_link': {
                        'url': best_match['url'],
                        'trackId': best_match['trackId'],
                        'previewUrl': best_match.get('previewUrl'),
                        'confidence': best_match.get('confidence', 'medium'),
                        'albumName': best_match.get('album', ''),
                        'popularity': best_match.get('popularity', 0),
                        'artistsOnSpotify': best_match.get('artists', []),
                        'rdvId': best_match.get('rdvId', 'N/A'),
                        'linkedAt': datetime.utcnow().isoformat()
                    },
                    ':updated': datetime.utcnow().isoformat()
                }
            )
        else:
            # Mark as searched but not found
            catalog_table.update_item(
                Key={'id': work_id},
                UpdateExpression='SET spotifySearched = :searched, updatedAt = :updated',
                ExpressionAttributeValues={
                    ':searched': True,
                    ':updated': datetime.utcnow().isoformat()
                }
            )
        
        return True
        
    except Exception as e:
        print(f"   ❌ Error updating work: {e}")
        return False

def link_consolidated_works_to_spotify():
    """Link consolidated works to Spotify"""
    print("🎧 Linking works to Spotify...")
    
    # Get Spotify token
    spotify_token = get_spotify_token()
    if not spotify_token:
        return False
    
    # Get works
    works = get_consolidated_works()
    if not works:
        return False
    
    successful_links = 0
    no_matches = 0
    errors = 0
    already_linked = 0
    
    for i, work in enumerate(works, 1):
        work_id = work['id']
        title = work.get('title', work.get('Title', work.get('Work_Title', 'Unknown')))
        rdv_id = work.get('rdvId', 'N/A')
        
        print(f"\n🎵 [{i}/{len(works)}] {rdv_id}: {title}")
        
        # Skip if already has Spotify link
        if work.get('spotifyLink'):
            print(f"   ✅ Already has Spotify link")
            already_linked += 1
            continue
        
        # Search Spotify
        spotify_results = search_spotify_for_work(work, spotify_token)
        
        if spotify_results:
            print(f"   ✅ Found {len(spotify_results)} matches")
            for j, track in enumerate(spotify_results, 1):
                artists_str = ', '.join(track['artists'])
                print(f"      {j}. {track['name']} by {artists_str} - {track['confidence']} confidence")
            
            if update_work_with_spotify(work_id, spotify_results):
                successful_links += 1
            else:
                errors += 1
        else:
            print(f"   ❌ No matches found")
            no_matches += 1
            update_work_with_spotify(work_id, [])  # Mark as searched
        
        # Rate limiting
        time.sleep(0.5)
        
        # Pause every 20 requests
        if i % 20 == 0:
            print(f"   ⏸️ Pausing for rate limiting...")
            time.sleep(2)
    
    print(f"\n✅ Spotify linking completed:")
    print(f"   🎧 Successfully linked: {successful_links}")
    print(f"   ✅ Already linked: {already_linked}")
    print(f"   ❌ No matches: {no_matches}")
    print(f"   ⚠️ Errors: {errors}")
    print(f"   📊 Total processed: {len(works)}")
    
    return True

def verify_spotify_linkage():
    """Verify Spotify linkage results"""
    print("\n🔗 Verifying Spotify linkage...")
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        # Get works with Spotify links
        response = catalog_table.scan(
            FilterExpression='artistId = :aid AND attribute_exists(spotifyLink)',
            ExpressionAttributeValues={':aid': ARTIST_ID}
        )
        
        linked_works = response['Items']
        print(f"✅ Found {len(linked_works)} works with Spotify links")
        
        # Show sample
        if linked_works:
            sample = linked_works[0]
            spotify_link = sample.get('spotifyLink', {})
            print(f"📋 Sample linked work:")
            print(f"   Title: {sample.get('Title', sample.get('title', 'N/A'))}")
            print(f"   RDV ID: {sample.get('rdvId', 'N/A')}")
            print(f"   Spotify URL: {spotify_link.get('url', 'N/A')}")
            print(f"   Confidence: {spotify_link.get('confidence', 'N/A')}")
        
        return len(linked_works)
        
    except Exception as e:
        print(f"❌ Error verifying linkage: {e}")
        return 0

def main():
    """Main execution function"""
    print("🎧 Spotify Auto-Linker for Consolidated Works")
    print("🔗 Linking RDV Catalog to Spotify")
    print("=" * 50)
    
    print(f"🔑 Using Spotify Client ID: {SPOTIFY_CLIENT_ID}")
    print(f"🔑 Client Secret: {'*' * len(SPOTIFY_CLIENT_SECRET)}")
    
    # Check current status first
    current_linked = verify_spotify_linkage()
    
    # Show what we'll do
    works = get_consolidated_works()
    if not works:
        print("❌ No works found to link")
        return
    
    unlinked = len([w for w in works if not w.get('spotifyLink')])
    print(f"\n🎯 Status:")
    print(f"   Total works: {len(works)}")
    print(f"   Already linked: {current_linked}")
    print(f"   Need linking: {unlinked}")
    
    if unlinked == 0:
        print("✅ All works already linked to Spotify!")
        return
    
    # Confirm before processing
    confirm = input("Link consolidated works to Spotify? (y/N): ").lower().strip()
    if confirm != 'y':
        print("❌ Operation cancelled")
        return
    
    # Process Spotify links
    success = link_consolidated_works_to_spotify()
    
    if success:
        # Final verification
        final_linked = verify_spotify_linkage()
        
        print("\n" + "=" * 50)
        print("✅ Spotify linking complete!")
        print(f"🔗 Total works with Spotify links: {final_linked}")
        print("📊 Ready for frontend integration")

if __name__ == "__main__":
    main()