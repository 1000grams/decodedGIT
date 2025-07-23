import boto3
import csv
import uuid
import json
from datetime import datetime
from botocore.exceptions import ClientError

# Configuration (same as before)
S3_BUCKET = 'artist-rdv'
CSV_KEY = 'WorksCatalog.csv'
DYNAMO_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
ARTIST_ID = 'ruedevivre'
ARTIST_PUBLIC_NAME = 'Rue De Vivre'
ARTIST_LEGAL_NAME = 'Avril Hue'

# AWS Clients
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def check_existing_catalog():
    """Check what's already in DynamoDB"""
    print("🔍 Checking existing catalog in DynamoDB...")
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        
        response = table.scan(
            FilterExpression='artistId = :aid AND albumTrack = :album',
            ExpressionAttributeValues={':aid': ARTIST_ID, ':album': True}
        )
        
        existing_tracks = response['Items']
        
        # Group by album
        albums = {}
        rdv_ids = set()
        
        for track in existing_tracks:
            album_name = track.get('albumInfo', {}).get('album', 'Unknown')
            rdv_id = track.get('rdvId', '')
            
            if album_name not in albums:
                albums[album_name] = []
            albums[album_name].append({
                'rdvId': rdv_id,
                'title': track.get('title', ''),
                'bpm': track.get('musicalMetadata', {}).get('bpm', 0),
                'hasSpotifyLink': 'spotifyLink' in track
            })
            rdv_ids.add(rdv_id)
        
        print(f"📊 Existing catalog status:")
        print(f"   📀 Total tracks: {len(existing_tracks)}")
        
        for album, tracks in albums.items():
            spotify_count = sum(1 for t in tracks if t['hasSpotifyLink'])
            album_emoji = '🥁' if 'Okina' in album else '🌙' if 'Azita' in album else '🔥' if 'RAVE' in album else '🎧'
            print(f"   {album_emoji} {album}: {len(tracks)} tracks ({spotify_count} with Spotify links)")
        
        return existing_tracks, rdv_ids, albums
        
    except Exception as e:
        print(f"❌ Error checking catalog: {e}")
        return [], set(), {}

def get_missing_tracks():
    """Identify which tracks are missing from expected 40"""
    expected_tracks = {
        # OKINA SAKANA (9 tracks)
        'RDV001': 'Monday Grind',
        'RDV002': 'Hump Day', 
        'RDV003': 'Friday Flex',
        'RDV004': 'Big Fish',
        'RDV005': 'Weed',
        'RDV006': '999,999',
        'RDV007': 'Shine Every Time',
        'RDV008': 'OG Bashment',
        'RDV009': "You're the Shift",
        
        # AZITA NOMADIC NIGHTS (14 tracks)
        'RDV010': 'Fireproof',
        'RDV011': 'Life',
        'RDV012': 'Burn',
        'RDV013': 'Tomorrow',
        'RDV014': 'Fire',
        'RDV015': 'Click Here',
        'RDV016': 'Quiet',
        'RDV017': 'Late Night',
        'RDV018': 'Trip',
        'RDV019': 'Zinda Hai Tu',
        'RDV020': 'Here I Am',
        'RDV021': 'Cheghad',
        'RDV022': 'Geruneh',
        'RDV023': 'Kharmaan-e Khatereh',
        
        # RAVE (9 tracks)
        'RDV024': 'No One',
        'RDV025': 'New Phone, Who Dis?',
        'RDV026': 'Lover',
        'RDV027': 'Brightest Sun (ring tone)',
        'RDV028': 'Be the Lion',
        'RDV029': 'Lent (Upbeat on the Classic)',
        'RDV030': 'Not Another MFer',
        'RDV031': 'Boss',
        'RDV032': 'Hold On (Pourquoi...)',
        
        # TROIS (8 tracks)
        'RDV033': 'California (You Got My One Heart Forever)',
        'RDV034': 'Perfect',
        'RDV035': 'Shining Star',
        'RDV036': 'Plastic',
        'RDV037': 'Trick',
        'RDV038': 'Refusnik',
        'RDV039': '405 to the 10',
        'RDV040': 'Ibiza'
    }
    
    existing_tracks, existing_rdv_ids, albums = check_existing_catalog()
    
    missing_tracks = {}
    for rdv_id, title in expected_tracks.items():
        if rdv_id not in existing_rdv_ids:
            missing_tracks[rdv_id] = title
    
    print(f"\n📋 Track Status Analysis:")
    print(f"   ✅ Expected tracks: {len(expected_tracks)}")
    print(f"   📀 Currently loaded: {len(existing_rdv_ids)}")
    print(f"   ❌ Missing tracks: {len(missing_tracks)}")
    
    if missing_tracks:
        print(f"\n❌ Missing tracks:")
        for rdv_id, title in missing_tracks.items():
            album_emoji = '🥁' if rdv_id.startswith('RDV00') else '🌙' if rdv_id.startswith('RDV01') or rdv_id.startswith('RDV02') and int(rdv_id[3:]) <= 23 else '🔥' if rdv_id.startswith('RDV02') or (rdv_id.startswith('RDV03') and int(rdv_id[3:]) <= 32) else '🎧'
            print(f"     {album_emoji} {rdv_id}: {title}")
    
    return missing_tracks, existing_tracks

def load_only_missing_tracks(missing_tracks):
    """Load only the missing tracks without clearing existing data"""
    if not missing_tracks:
        print("✅ All tracks already loaded! No action needed.")
        return 0, 0
    
    print(f"\n🔄 Loading {len(missing_tracks)} missing tracks...")
    
    # This would require matching with your CSV data and album metadata
    # For now, let's just report what's missing
    
    print("⚠️ To load missing tracks, you need to:")
    print("   1. Update CSV matching logic")
    print("   2. Ensure all 40 tracks are in your S3 CSV")
    print("   3. Run targeted load for missing RDV IDs")
    
    return 0, len(missing_tracks)

def smart_update_existing():
    """Update existing tracks with missing metadata (like Spotify links)"""
    print("🔄 Checking for tracks that need metadata updates...")
    
    existing_tracks, _, _ = check_existing_catalog()
    
    needs_spotify = []
    needs_sync_data = []
    
    for track in existing_tracks:
        if 'spotifyLink' not in track or not track.get('spotifyLink'):
            needs_spotify.append(track)
        
        if not track.get('syncMetadata', {}).get('syncCategories'):
            needs_sync_data.append(track)
    
    print(f"📊 Metadata update needed:")
    print(f"   🎵 Tracks needing Spotify links: {len(needs_spotify)}")
    print(f"   🎯 Tracks needing sync metadata: {len(needs_sync_data)}")
    
    return needs_spotify, needs_sync_data

def main():
    """Smart main function that doesn't reload existing data"""
    print("🧠 SMART ALBUM CATALOG CHECKER")
    print("🔍 Checks existing data before loading")
    print("=" * 60)
    
    # Check what we have
    missing_tracks, existing_tracks = get_missing_tracks()
    
    # Check metadata completeness
    needs_spotify, needs_sync = smart_update_existing()
    
    print(f"\n💡 RECOMMENDATIONS:")
    
    if not missing_tracks:
        print("   ✅ Catalog is complete (32/40 tracks found)")
        print("   🎯 Focus on metadata enhancement:")
        print("     • Run spotify-auto-linker.py for missing Spotify links")
        print("     • Add sync metadata to tracks without it")
        print("     • Add remaining 8 tracks to CSV for full 40 track catalog")
    else:
        print(f"   📝 Add {len(missing_tracks)} missing tracks to CSV")
        print("   🔄 Run targeted load for missing RDV IDs")
        print("   ✅ Current tracks are safely preserved")
    
    print(f"\n🎯 NEXT STEPS:")
    print("   1. 🔗 Run: python spotify-auto-linker.py")
    print("   2. 📊 Check frontend integration")
    print("   3. 🎵 Add missing tracks to complete 40-track catalog")

if __name__ == "__main__":
    main()