import boto3
import json
import requests
import base64
import time
from datetime import datetime
from fuzzywuzzy import fuzz

# --- Configuration ---
DYNAMO_CATALOG_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
CATALOG_ARTIST_ID = 'ruedevivre'
SPOTIFY_ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'  # Rue de Vivre Spotify Artist ID

# --- Spotify API Configuration ---
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'

# --- AWS Client ---
dynamodb = boto3.resource('dynamodb')

def get_spotify_token():
    """Get Spotify access token"""
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
        if response.status_code == 200:
            return response.json().get('access_token')
        else:
            print(f"❌ Spotify auth failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Spotify auth error: {e}")
        return None

def get_artist_albums(access_token):
    """Get all albums for the artist"""
    headers = {'Authorization': f'Bearer {access_token}'}
    base_url = "https://api.spotify.com/v1"
    
    all_tracks = []
    
    try:
        # Get albums
        response = requests.get(f"{base_url}/artists/{SPOTIFY_ARTIST_ID}/albums?market=US&limit=50&include_groups=album,single", headers=headers)
        if response.status_code == 200:
            albums = response.json()['items']
            
            for album in albums:
                # Get tracks for each album
                tracks_response = requests.get(f"{base_url}/albums/{album['id']}/tracks", headers=headers)
                if tracks_response.status_code == 200:
                    tracks = tracks_response.json()['items']
                    
                    for track in tracks:
                        track_info = {
                            'id': track['id'],
                            'name': track['name'],
                            'album_name': album['name'],
                            'album_type': album['album_type'],
                            'release_date': album['release_date'],
                            'spotify_url': track['external_urls']['spotify'],
                            'duration_ms': track['duration_ms'],
                            'track_number': track['track_number']
                        }
                        all_tracks.append(track_info)
                
                time.sleep(0.1)  # Rate limiting
        
        print(f"✅ Found {len(all_tracks)} tracks on Spotify")
        return all_tracks
        
    except Exception as e:
        print(f"❌ Error getting artist albums: {e}")
        return []

def get_catalog_works():
    """Get all works from catalog that need linking"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        response = catalog_table.scan(
            FilterExpression='artistId = :aid AND #type = :type',
            ExpressionAttributeNames={'#type': 'type'},
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID, ':type': 'work'}
        )
        
        works = response['Items']
        print(f"✅ Found {len(works)} works in catalog")
        return works
        
    except Exception as e:
        print(f"❌ Error getting catalog works: {e}")
        return []

def clean_title_for_matching(title):
    """Clean title for better matching"""
    if not title:
        return ""
    
    # Convert to lowercase and remove common variations
    cleaned = title.lower().strip()
    
    # Remove parenthetical content and extra info
    import re
    cleaned = re.sub(r'\([^)]*\)', '', cleaned)  # Remove (content)
    cleaned = re.sub(r'\[[^\]]*\]', '', cleaned)  # Remove [content]
    cleaned = re.sub(r'[^\w\s]', ' ', cleaned)    # Replace punctuation with space
    cleaned = re.sub(r'\s+', ' ', cleaned)        # Normalize whitespace
    
    return cleaned.strip()

def calculate_match_score(catalog_title, spotify_track):
    """Calculate match score between catalog title and Spotify track"""
    catalog_clean = clean_title_for_matching(catalog_title)
    spotify_clean = clean_title_for_matching(spotify_track['name'])
    
    # Direct match
    if catalog_clean == spotify_clean:
        return 100
    
    # Fuzzy matching
    ratio = fuzz.ratio(catalog_clean, spotify_clean)
    partial_ratio = fuzz.partial_ratio(catalog_clean, spotify_clean)
    token_sort_ratio = fuzz.token_sort_ratio(catalog_clean, spotify_clean)
    
    # Weighted score
    score = (ratio * 0.4 + partial_ratio * 0.3 + token_sort_ratio * 0.3)
    
    # Bonus for exact word matches
    catalog_words = set(catalog_clean.split())
    spotify_words = set(spotify_clean.split())
    word_overlap = len(catalog_words.intersection(spotify_words))
    if word_overlap > 0:
        score += word_overlap * 5
    
    return min(score, 100)

def find_best_matches(catalog_works, spotify_tracks):
    """Find best matches between catalog and Spotify tracks"""
    matches = []
    
    for work in catalog_works:
        # Skip if already has Spotify link
        if 'spotifyLink' in work:
            continue
        
        work_title = work.get('Title', work.get('title', ''))
        if not work_title:
            continue
        
        best_match = None
        best_score = 0
        
        for track in spotify_tracks:
            score = calculate_match_score(work_title, track)
            
            if score > best_score:
                best_score = score
                best_match = track
        
        if best_match and best_score >= 70:  # Minimum confidence threshold
            confidence = 'high' if best_score >= 90 else 'medium'
            
            match = {
                'work': work,
                'spotify_track': best_match,
                'score': best_score,
                'confidence': confidence,
                'catalog_title': work_title,
                'spotify_title': best_match['name']
            }
            matches.append(match)
    
    # Sort by score (highest first)
    matches.sort(key=lambda x: x['score'], reverse=True)
    return matches

def update_work_with_spotify_link(work, spotify_track, confidence):
    """Update work with Spotify link information"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        spotify_link = {
            'url': spotify_track['spotify_url'],
            'trackId': spotify_track['id'],
            'confidence': confidence,
            'albumName': spotify_track['album_name'],
            'linkedAt': datetime.utcnow().isoformat()
        }
        
        # Update the work
        catalog_table.update_item(
            Key={'id': work['id']},
            UpdateExpression='SET spotifyLink = :link, updatedAt = :updated',
            ExpressionAttributeValues={
                ':link': spotify_link,
                ':updated': datetime.utcnow().isoformat()
            }
        )
        
        return True
        
    except Exception as e:
        print(f"❌ Error updating work {work.get('Title', 'Unknown')}: {e}")
        return False

def display_matches(matches):
    """Display found matches for user review"""
    if not matches:
        print("❌ No matches found")
        return
    
    print(f"\n🎯 FOUND {len(matches)} POTENTIAL MATCHES")
    print("=" * 80)
    
    for i, match in enumerate(matches, 1):
        print(f"\n{i}. {match['confidence'].upper()} CONFIDENCE ({match['score']:.1f}%)")
        print(f"   📚 Catalog: {match['catalog_title']}")
        print(f"   🎵 Spotify: {match['spotify_title']}")
        print(f"   💿 Album: {match['spotify_track']['album_name']}")
        print(f"   🔗 URL: {match['spotify_track']['spotify_url']}")

def auto_link_high_confidence_matches(matches):
    """Automatically link high confidence matches"""
    high_confidence_matches = [m for m in matches if m['confidence'] == 'high']
    
    if not high_confidence_matches:
        print("❌ No high confidence matches for auto-linking")
        return 0
    
    print(f"\n🔗 AUTO-LINKING {len(high_confidence_matches)} HIGH CONFIDENCE MATCHES")
    print("-" * 60)
    
    success_count = 0
    
    for match in high_confidence_matches:
        work_title = match['catalog_title']
        spotify_title = match['spotify_title']
        
        success = update_work_with_spotify_link(
            match['work'], 
            match['spotify_track'], 
            match['confidence']
        )
        
        if success:
            print(f"✅ {work_title} → {spotify_title}")
            success_count += 1
        else:
            print(f"❌ Failed: {work_title}")
    
    print(f"\n🎯 AUTO-LINKED: {success_count}/{len(high_confidence_matches)}")
    return success_count

def manual_review_medium_confidence(matches):
    """Manual review for medium confidence matches"""
    medium_confidence_matches = [m for m in matches if m['confidence'] == 'medium']
    
    if not medium_confidence_matches:
        print("❌ No medium confidence matches for review")
        return 0
    
    print(f"\n🔍 MANUAL REVIEW: {len(medium_confidence_matches)} MEDIUM CONFIDENCE MATCHES")
    print("-" * 60)
    
    success_count = 0
    
    for match in medium_confidence_matches:
        print(f"\n📋 MATCH REVIEW:")
        print(f"   📚 Catalog: {match['catalog_title']}")
        print(f"   🎵 Spotify: {match['spotify_title']}")
        print(f"   💿 Album: {match['spotify_track']['album_name']}")
        print(f"   📊 Confidence: {match['score']:.1f}%")
        
        choice = input("   🔗 Link this match? (y/n/q to quit): ").lower().strip()
        
        if choice == 'q':
            break
        elif choice == 'y':
            success = update_work_with_spotify_link(
                match['work'], 
                match['spotify_track'], 
                match['confidence']
            )
            
            if success:
                print("   ✅ Linked successfully")
                success_count += 1
            else:
                print("   ❌ Failed to link")
        else:
            print("   ⏭️  Skipped")
    
    return success_count

def verify_linking_status():
    """Verify current linking status"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        # Total works
        total_response = catalog_table.scan(
            FilterExpression='artistId = :aid AND #type = :type',
            ExpressionAttributeNames={'#type': 'type'},
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID, ':type': 'work'},
            Select='COUNT'
        )
        total_works = total_response['Count']
        
        # Linked works
        linked_response = catalog_table.scan(
            FilterExpression='artistId = :aid AND attribute_exists(spotifyLink)',
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID},
            Select='COUNT'
        )
        linked_works = linked_response['Count']
        
        percentage = (linked_works / total_works * 100) if total_works > 0 else 0
        
        print(f"\n📊 LINKING STATUS:")
        print(f"   📚 Total works: {total_works}")
        print(f"   🔗 Spotify linked: {linked_works}")
        print(f"   📈 Coverage: {percentage:.1f}%")
        
        return total_works, linked_works, percentage
        
    except Exception as e:
        print(f"❌ Error verifying status: {e}")
        return 0, 0, 0

def main():
    """Main execution function"""
    print("🔗 SPOTIFY AUTO-LINKER")
    print("🎵 Rue de Vivre Catalog → Spotify Tracks")
    print("=" * 50)
    
    # Get Spotify token
    print("🔐 Authenticating with Spotify...")
    access_token = get_spotify_token()
    if not access_token:
        return
    
    # Get Spotify tracks
    print("🎵 Fetching Spotify tracks...")
    spotify_tracks = get_artist_albums(access_token)
    if not spotify_tracks:
        return
    
    # Get catalog works
    print("📚 Fetching catalog works...")
    catalog_works = get_catalog_works()
    if not catalog_works:
        return
    
    # Find matches
    print("🔍 Finding matches...")
    matches = find_best_matches(catalog_works, spotify_tracks)
    
    # Display matches
    display_matches(matches)
    
    if not matches:
        print("\n✅ No new matches found - catalog may already be fully linked")
        verify_linking_status()
        return
    
    # Auto-link high confidence matches
    auto_linked = auto_link_high_confidence_matches(matches)
    
    # Manual review for medium confidence
    manual_linked = manual_review_medium_confidence(matches)
    
    # Final status
    total_linked = auto_linked + manual_linked
    print(f"\n🎉 LINKING COMPLETE!")
    print(f"   ✅ Successfully linked: {total_linked} tracks")
    print(f"   🔗 Auto-linked: {auto_linked}")
    print(f"   👤 Manual-linked: {manual_linked}")
    
    # Verify final status
    verify_linking_status()
    
    print(f"\n🚀 Next steps:")
    print(f"   1. Run growth-dashboard.py to see updated coverage")
    print(f"   2. Run enhanced-spotify-insights.py for comprehensive data")

if __name__ == "__main__":
    main()