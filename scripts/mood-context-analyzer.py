import boto3
import json
import requests
import numpy as np
from datetime import datetime
import statistics
from decimal import Decimal

# --- Configuration ---
DYNAMO_CATALOG_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
DYNAMO_INSIGHTS_TABLE = 'prod-SpotifyInsights-decodedmusic-backend'
DYNAMO_MOOD_TABLE = 'prod-MoodContextAnalysis-decodedmusic-backend'
CATALOG_ARTIST_ID = 'ruedevivre'
SPOTIFY_ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'

# --- Spotify API Configuration ---
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'

# --- AWS Client ---
dynamodb = boto3.resource('dynamodb')

# --- Mood & Context Classification Maps ---
MOOD_CLASSIFICATIONS = {
    'energy_moods': {
        (0.0, 0.3): 'Calm/Meditative',
        (0.3, 0.5): 'Relaxed/Chill',
        (0.5, 0.7): 'Moderate/Focused',
        (0.7, 0.85): 'Energetic/Upbeat',
        (0.85, 1.0): 'High-Energy/Intense'
    },
    'emotional_moods': {
        (0.0, 0.3): 'Melancholic/Introspective',
        (0.3, 0.5): 'Neutral/Balanced',
        (0.5, 0.7): 'Positive/Hopeful',
        (0.7, 0.9): 'Happy/Uplifting',
        (0.9, 1.0): 'Euphoric/Ecstatic'
    }
}

CONTEXT_CLASSIFICATIONS = {
    'workout': {
        'energy_min': 0.6, 'danceability_min': 0.5, 'tempo_min': 120,
        'valence_min': 0.4, 'loudness_min': -8
    },
    'study_focus': {
        'energy_max': 0.5, 'instrumentalness_min': 0.3, 'tempo_max': 110,
        'acousticness_min': 0.2, 'speechiness_max': 0.3
    },
    'party_club': {
        'energy_min': 0.7, 'danceability_min': 0.7, 'tempo_min': 110,
        'valence_min': 0.5, 'loudness_min': -6
    },
    'relaxation_spa': {
        'energy_max': 0.4, 'acousticness_min': 0.4, 'tempo_max': 100,
        'instrumentalness_min': 0.3, 'valence_range': (0.2, 0.7)
    },
    'driving_commute': {
        'energy_range': (0.4, 0.8), 'tempo_range': (90, 140),
        'danceability_min': 0.4, 'valence_min': 0.3
    },
    'romantic_dinner': {
        'energy_max': 0.6, 'acousticness_min': 0.3, 'tempo_max': 120,
        'valence_range': (0.3, 0.8), 'instrumentalness_min': 0.2
    },
    'gaming_esports': {
        'energy_min': 0.6, 'tempo_min': 120, 'loudness_min': -8,
        'danceability_min': 0.5, 'valence_min': 0.4
    }
}

TIME_CONTEXT_MAP = {
    'morning_motivation': {'energy_min': 0.5, 'valence_min': 0.5, 'tempo_range': (100, 140)},
    'afternoon_focus': {'energy_range': (0.3, 0.7), 'tempo_range': (90, 130)},
    'evening_unwind': {'energy_max': 0.5, 'acousticness_min': 0.3, 'valence_range': (0.2, 0.8)},
    'late_night_vibe': {'energy_range': (0.2, 0.6), 'tempo_max': 110, 'danceability_min': 0.4}
}

def get_spotify_token():
    """Get Spotify access token"""
    import base64
    
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
        return None
    except Exception as e:
        print(f"❌ Spotify auth error: {e}")
        return None

def get_linked_tracks():
    """Get all tracks with Spotify links from catalog"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        response = catalog_table.scan(
            FilterExpression='artistId = :aid AND attribute_exists(spotifyLink)',
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID}
        )
        
        tracks = []
        for item in response['Items']:
            spotify_link = item.get('spotifyLink', {})
            if spotify_link.get('trackId'):
                tracks.append({
                    'catalog_id': item['id'],
                    'title': item.get('Title', item.get('title', 'Unknown')),
                    'spotify_id': spotify_link['trackId'],
                    'album_info': item.get('albumInfo', {}),
                    'sync_categories': item.get('syncMetadata', {}).get('syncCategories', [])
                })
        
        print(f"✅ Found {len(tracks)} linked tracks for analysis")
        return tracks
        
    except Exception as e:
        print(f"❌ Error getting linked tracks: {e}")
        return []

def get_audio_features(spotify_token, track_ids):
    """Get audio features for multiple tracks"""
    headers = {'Authorization': f'Bearer {spotify_token}'}
    
    # Spotify API allows up to 100 tracks per request
    all_features = []
    
    for i in range(0, len(track_ids), 100):
        batch = track_ids[i:i+100]
        ids_string = ','.join(batch)
        
        try:
            response = requests.get(
                f"https://api.spotify.com/v1/audio-features?ids={ids_string}",
                headers=headers
            )
            
            if response.status_code == 200:
                features = response.json().get('audio_features', [])
                all_features.extend([f for f in features if f])  # Filter out None values
            else:
                print(f"⚠️ Error getting audio features batch: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Error in batch request: {e}")
    
    return all_features

def classify_mood(audio_features):
    """Classify mood based on audio features"""
    energy = audio_features.get('energy', 0)
    valence = audio_features.get('valence', 0)
    danceability = audio_features.get('danceability', 0)
    acousticness = audio_features.get('acousticness', 0)
    
    # Energy-based mood
    energy_mood = 'Unknown'
    for (min_val, max_val), mood in MOOD_CLASSIFICATIONS['energy_moods'].items():
        if min_val <= energy < max_val:
            energy_mood = mood
            break
    
    # Emotional mood based on valence
    emotional_mood = 'Unknown'
    for (min_val, max_val), mood in MOOD_CLASSIFICATIONS['emotional_moods'].items():
        if min_val <= valence < max_val:
            emotional_mood = mood
            break
    
    # Compound mood analysis
    if energy > 0.7 and valence > 0.7:
        compound_mood = 'Euphoric Party'
    elif energy > 0.6 and danceability > 0.7:
        compound_mood = 'Dancefloor Energy'
    elif energy < 0.4 and acousticness > 0.5:
        compound_mood = 'Acoustic Chill'
    elif valence < 0.3 and energy < 0.5:
        compound_mood = 'Melancholic Introspection'
    elif 0.4 <= energy <= 0.7 and 0.4 <= valence <= 0.7:
        compound_mood = 'Balanced Versatile'
    else:
        compound_mood = 'Dynamic Blend'
    
    return {
        'energy_mood': energy_mood,
        'emotional_mood': emotional_mood,
        'compound_mood': compound_mood,
        'mood_confidence': min(abs(energy - 0.5) * 2, abs(valence - 0.5) * 2) + 0.5
    }

def classify_contexts(audio_features):
    """Classify suitable contexts for the track"""
    suitable_contexts = []
    
    for context, criteria in CONTEXT_CLASSIFICATIONS.items():
        score = 0
        max_score = len(criteria)
        
        for feature, threshold in criteria.items():
            feature_value = audio_features.get(feature.split('_')[0], 0)
            
            if feature.endswith('_min') and feature_value >= threshold:
                score += 1
            elif feature.endswith('_max') and feature_value <= threshold:
                score += 1
            elif feature.endswith('_range') and threshold[0] <= feature_value <= threshold[1]:
                score += 1
        
        confidence = score / max_score
        if confidence >= 0.6:  # 60% criteria match
            suitable_contexts.append({
                'context': context,
                'confidence': confidence,
                'match_score': score,
                'max_score': max_score
            })
    
    return suitable_contexts

def classify_time_contexts(audio_features):
    """Classify time-of-day contexts"""
    suitable_times = []
    
    for time_context, criteria in TIME_CONTEXT_MAP.items():
        score = 0
        max_score = len(criteria)
        
        for feature, threshold in criteria.items():
            feature_value = audio_features.get(feature.split('_')[0], 0)
            
            if feature.endswith('_min') and feature_value >= threshold:
                score += 1
            elif feature.endswith('_max') and feature_value <= threshold:
                score += 1
            elif feature.endswith('_range') and threshold[0] <= feature_value <= threshold[1]:
                score += 1
        
        confidence = score / max_score
        if confidence >= 0.5:  # 50% criteria match for time contexts
            suitable_times.append({
                'time_context': time_context,
                'confidence': confidence
            })
    
    return suitable_times

def calculate_viral_potential(audio_features, track_info):
    """Calculate viral potential score based on audio features and metadata"""
    # Base viral factors
    energy = audio_features.get('energy', 0)
    danceability = audio_features.get('danceability', 0)
    valence = audio_features.get('valence', 0)
    tempo = audio_features.get('tempo', 0)
    loudness = audio_features.get('loudness', -20)
    
    # Viral potential scoring
    viral_score = 0
    
    # Energy sweet spot (0.6-0.9)
    if 0.6 <= energy <= 0.9:
        viral_score += 20
    elif 0.4 <= energy < 0.6:
        viral_score += 10
    
    # Danceability (higher is better for viral)
    if danceability >= 0.7:
        viral_score += 25
    elif danceability >= 0.5:
        viral_score += 15
    
    # Valence (positive emotions)
    if valence >= 0.6:
        viral_score += 20
    elif valence >= 0.4:
        viral_score += 10
    
    # Tempo (good for TikTok/social)
    if 120 <= tempo <= 140:
        viral_score += 15
    elif 100 <= tempo <= 160:
        viral_score += 10
    
    # Loudness (not too quiet)
    if loudness >= -8:
        viral_score += 10
    elif loudness >= -12:
        viral_score += 5
    
    # Album/genre bonus
    album = track_info.get('album_info', {}).get('album', '')
    if 'RAVE' in album or 'club' in album.lower():
        viral_score += 10
    
    # Sync category bonus
    viral_categories = ['gaming', 'fitness', 'party', 'social media', 'dance']
    sync_cats = track_info.get('sync_categories', [])
    for cat in sync_cats:
        if any(viral_cat in cat.lower() for viral_cat in viral_categories):
            viral_score += 5
    
    return min(viral_score, 100)  # Cap at 100

def save_mood_context_analysis(track_info, audio_features, mood_analysis, contexts, time_contexts, viral_score):
    """Save analysis to DynamoDB"""
    try:
        # Create table if it doesn't exist
        try:
            mood_table = dynamodb.Table(DYNAMO_MOOD_TABLE)
            mood_table.load()
        except:
            # Create table
            mood_table = dynamodb.create_table(
                TableName=DYNAMO_MOOD_TABLE,
                KeySchema=[
                    {'AttributeName': 'track_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'track_id', 'AttributeType': 'S'}
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            mood_table.wait_until_exists()
        
        # Convert float values to Decimal for DynamoDB
        def convert_to_decimal(obj):
            if isinstance(obj, float):
                return Decimal(str(obj))
            elif isinstance(obj, dict):
                return {k: convert_to_decimal(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_to_decimal(v) for v in obj]
            return obj
        
        analysis_item = {
            'track_id': track_info['catalog_id'],
            'spotify_id': track_info['spotify_id'],
            'title': track_info['title'],
            'timestamp': datetime.utcnow().isoformat(),
            'audio_features': convert_to_decimal(audio_features),
            'mood_analysis': convert_to_decimal(mood_analysis),
            'suitable_contexts': convert_to_decimal(contexts),
            'time_contexts': convert_to_decimal(time_contexts),
            'viral_potential_score': Decimal(str(viral_score)),
            'analysis_version': '1.0'
        }
        
        mood_table.put_item(Item=analysis_item)
        return True
        
    except Exception as e:
        print(f"❌ Error saving analysis for {track_info['title']}: {e}")
        return False

def generate_mood_context_report(all_analyses):
    """Generate comprehensive mood and context report"""
    print(f"\n📊 MOOD & CONTEXT ANALYSIS REPORT")
    print("=" * 60)
    
    # Mood distribution
    mood_distribution = {}
    context_popularity = {}
    viral_scores = []
    
    for analysis in all_analyses:
        compound_mood = analysis['mood_analysis']['compound_mood']
        mood_distribution[compound_mood] = mood_distribution.get(compound_mood, 0) + 1
        
        for context in analysis['suitable_contexts']:
            ctx_name = context['context']
            context_popularity[ctx_name] = context_popularity.get(ctx_name, 0) + 1
        
        viral_scores.append(float(analysis['viral_potential_score']))
    
    print(f"\n🎭 MOOD DISTRIBUTION:")
    for mood, count in sorted(mood_distribution.items(), key=lambda x: x[1], reverse=True):
        percentage = (count / len(all_analyses)) * 100
        print(f"   {mood}: {count} tracks ({percentage:.1f}%)")
    
    print(f"\n🎯 MOST SUITABLE CONTEXTS:")
    for context, count in sorted(context_popularity.items(), key=lambda x: x[1], reverse=True)[:10]:
        percentage = (count / len(all_analyses)) * 100
        print(f"   {context}: {count} tracks ({percentage:.1f}%)")
    
    print(f"\n🚀 VIRAL POTENTIAL ANALYSIS:")
    if viral_scores:
        avg_viral = statistics.mean(viral_scores)
        max_viral = max(viral_scores)
        high_viral_tracks = [a for a in all_analyses if float(a['viral_potential_score']) >= 70]
        
        print(f"   Average Viral Score: {avg_viral:.1f}/100")
        print(f"   Highest Viral Score: {max_viral:.1f}/100")
        print(f"   High Viral Potential: {len(high_viral_tracks)} tracks (≥70 score)")
        
        if high_viral_tracks:
            print(f"\n🔥 TOP VIRAL CANDIDATES:")
            for track in sorted(high_viral_tracks, key=lambda x: float(x['viral_potential_score']), reverse=True)[:5]:
                print(f"   {track['title']}: {track['viral_potential_score']}/100")

def main():
    """Main execution function"""
    print("🎭 MOOD & CONTEXT ANALYZER")
    print("🎯 Enhanced Metadata + Viral Prediction")
    print("=" * 50)
    
    # Get Spotify token
    print("🔐 Authenticating with Spotify...")
    spotify_token = get_spotify_token()
    if not spotify_token:
        return
    
    # Get linked tracks
    print("📚 Getting linked tracks from catalog...")
    tracks = get_linked_tracks()
    if not tracks:
        print("❌ No linked tracks found. Run spotify-auto-linker.py first.")
        return
    
    # Get audio features
    print("🎵 Analyzing audio features...")
    track_ids = [track['spotify_id'] for track in tracks]
    audio_features = get_audio_features(spotify_token, track_ids)
    
    if len(audio_features) != len(tracks):
        print(f"⚠️ Warning: Got features for {len(audio_features)}/{len(tracks)} tracks")
    
    # Analyze each track
    print("🎭 Performing mood & context analysis...")
    all_analyses = []
    
    for i, track in enumerate(tracks):
        if i < len(audio_features) and audio_features[i]:
            features = audio_features[i]
            
            # Perform analyses
            mood_analysis = classify_mood(features)
            contexts = classify_contexts(features)
            time_contexts = classify_time_contexts(features)
            viral_score = calculate_viral_potential(features, track)
            
            # Save analysis
            success = save_mood_context_analysis(
                track, features, mood_analysis, contexts, time_contexts, viral_score
            )
            
            if success:
                analysis_data = {
                    'title': track['title'],
                    'mood_analysis': mood_analysis,
                    'suitable_contexts': contexts,
                    'time_contexts': time_contexts,
                    'viral_potential_score': viral_score
                }
                all_analyses.append(analysis_data)
                
                print(f"✅ {track['title']}: {mood_analysis['compound_mood']} | Viral: {viral_score}/100")
            else:
                print(f"❌ Failed to analyze: {track['title']}")
    
    # Generate report
    if all_analyses:
        generate_mood_context_report(all_analyses)
    
    print(f"\n🎉 ANALYSIS COMPLETE!")
    print(f"   ✅ Analyzed: {len(all_analyses)} tracks")
    print(f"   📊 Data saved to: {DYNAMO_MOOD_TABLE}")
    print(f"\n🚀 Next steps:")
    print(f"   1. Use mood data for playlist targeting")
    print(f"   2. Focus on high viral potential tracks")
    print(f"   3. Match contexts to sync opportunities")

if __name__ == "__main__":
    main()