import boto3
import json
import requests
import numpy as np
from datetime import datetime, timedelta
import statistics
from decimal import Decimal
import time

# --- Configuration ---
DYNAMO_CATALOG_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
DYNAMO_MOOD_TABLE = 'prod-MoodContextAnalysis-decodedmusic-backend'
DYNAMO_VIRAL_TABLE = 'prod-ViralPrediction-decodedmusic-backend'
SPOTIFY_ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'

# --- Spotify API Configuration ---
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'

# --- AWS Client ---
dynamodb = boto3.resource('dynamodb')

# --- Viral Prediction Models ---
VIRAL_INDICATORS = {
    'tiktok_optimal': {
        'tempo_range': (120, 140),
        'energy_min': 0.6,
        'danceability_min': 0.7,
        'valence_min': 0.5,
        'duration_max': 180000,  # 3 minutes in ms
        'weight': 0.35
    },
    'instagram_reels': {
        'tempo_range': (100, 130),
        'energy_min': 0.5,
        'danceability_min': 0.6,
        'valence_min': 0.4,
        'duration_max': 90000,  # 1.5 minutes in ms
        'weight': 0.25
    },
    'youtube_shorts': {
        'tempo_range': (90, 150),
        'energy_min': 0.4,
        'catchiness_factor': True,
        'duration_max': 60000,  # 1 minute in ms
        'weight': 0.20
    },
    'playlist_viral': {
        'energy_range': (0.5, 0.9),
        'popularity_potential': True,
        'mainstream_appeal': True,
        'weight': 0.20
    }
}

TREND_INDICATORS = {
    'rising_genres': ['afrobeats', 'reggaeton', 'hyperpop', 'drill', 'amapiano'],
    'viral_features': {
        'short_hook': {'importance': 0.3},
        'vocal_chops': {'importance': 0.2},
        'drop_intensity': {'importance': 0.25},
        'cultural_relevance': {'importance': 0.25}
    }
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

def get_mood_context_data():
    """Get mood and context analysis data"""
    try:
        mood_table = dynamodb.Table(DYNAMO_MOOD_TABLE)
        
        response = mood_table.scan()
        analyses = response['Items']
        
        print(f"✅ Found {len(analyses)} mood/context analyses")
        return analyses
        
    except Exception as e:
        print(f"❌ Error getting mood data: {e}")
        return []

def get_trending_benchmarks(spotify_token):
    """Get current trending benchmarks from Spotify"""
    headers = {'Authorization': f'Bearer {spotify_token}'}
    
    try:
        # Get viral/trending playlists for benchmarking
        trending_playlists = [
            '37i9dQZF1DX0XUsuxWHRQd',  # RapCaviar
            '37i9dQZF1DX4JAvHpjipBk',  # New Music Friday
            '37i9dQZF1DX4SBhb3fqCJd',  # Are & Be
            '37i9dQZF1DXcBWIGoYBM5M'   # Today's Top Hits
        ]
        
        all_trending_features = []
        
        for playlist_id in trending_playlists:
            # Get playlist tracks
            response = requests.get(
                f"https://api.spotify.com/v1/playlists/{playlist_id}/tracks?limit=50",
                headers=headers
            )
            
            if response.status_code == 200:
                tracks = response.json()['items']
                track_ids = [track['track']['id'] for track in tracks if track['track']]
                
                # Get audio features
                if track_ids:
                    features_response = requests.get(
                        f"https://api.spotify.com/v1/audio-features?ids={','.join(track_ids[:50])}",
                        headers=headers
                    )
                    
                    if features_response.status_code == 200:
                        features = features_response.json()['audio_features']
                        all_trending_features.extend([f for f in features if f])
            
            time.sleep(0.1)  # Rate limiting
        
        # Calculate trending benchmarks
        if all_trending_features:
            benchmarks = {
                'avg_energy': statistics.mean([f['energy'] for f in all_trending_features]),
                'avg_danceability': statistics.mean([f['danceability'] for f in all_trending_features]),
                'avg_valence': statistics.mean([f['valence'] for f in all_trending_features]),
                'avg_tempo': statistics.mean([f['tempo'] for f in all_trending_features]),
                'avg_loudness': statistics.mean([f['loudness'] for f in all_trending_features]),
                'sample_size': len(all_trending_features)
            }
            
            print(f"✅ Calculated benchmarks from {len(all_trending_features)} trending tracks")
            return benchmarks
        
        return None
        
    except Exception as e:
        print(f"❌ Error getting trending benchmarks: {e}")
        return None

def calculate_platform_viral_scores(audio_features):
    """Calculate viral scores for different platforms"""
    platform_scores = {}
    
    for platform, criteria in VIRAL_INDICATORS.items():
        score = 0
        max_score = 0
        
        # Tempo check
        if 'tempo_range' in criteria:
            tempo = audio_features.get('tempo', 0)
            if criteria['tempo_range'][0] <= tempo <= criteria['tempo_range'][1]:
                score += 20
            max_score += 20
        
        # Energy check
        if 'energy_min' in criteria:
            energy = audio_features.get('energy', 0)
            if energy >= criteria['energy_min']:
                score += 20
            max_score += 20
        
        if 'energy_range' in criteria:
            energy = audio_features.get('energy', 0)
            if criteria['energy_range'][0] <= energy <= criteria['energy_range'][1]:
                score += 20
            max_score += 20
        
        # Danceability check
        if 'danceability_min' in criteria:
            danceability = audio_features.get('danceability', 0)
            if danceability >= criteria['danceability_min']:
                score += 25
            max_score += 25
        
        # Valence check
        if 'valence_min' in criteria:
            valence = audio_features.get('valence', 0)
            if valence >= criteria['valence_min']:
                score += 20
            max_score += 20
        
        # Duration check
        if 'duration_max' in criteria:
            duration = audio_features.get('duration_ms', 300000)
            if duration <= criteria['duration_max']:
                score += 15
            max_score += 15
        
        # Special factors
        if criteria.get('catchiness_factor'):
            # Higher speechiness can indicate catchiness
            speechiness = audio_features.get('speechiness', 0)
            if speechiness > 0.1:
                score += 10
            max_score += 10
        
        if criteria.get('mainstream_appeal'):
            # Balanced features for mainstream appeal
            energy = audio_features.get('energy', 0)
            valence = audio_features.get('valence', 0)
            if 0.4 <= energy <= 0.8 and 0.3 <= valence <= 0.8:
                score += 15
            max_score += 15
        
        # Calculate percentage score
        platform_score = (score / max_score * 100) if max_score > 0 else 0
        platform_scores[platform] = {
            'score': platform_score,
            'weight': criteria['weight'],
            'raw_score': score,
            'max_score': max_score
        }
    
    return platform_scores

def calculate_trend_alignment_score(audio_features, track_metadata):
    """Calculate how well track aligns with current trends"""
    trend_score = 0
    
    # Genre trend alignment
    album = track_metadata.get('album_info', {}).get('album', '').lower()
    sync_categories = track_metadata.get('sync_categories', [])
    
    # Check for rising genre indicators
    for genre in TREND_INDICATORS['rising_genres']:
        if genre in album or any(genre in cat.lower() for cat in sync_categories):
            trend_score += 15
            break
    
    # Audio feature trends (2024/2025)
    energy = audio_features.get('energy', 0)
    danceability = audio_features.get('danceability', 0)
    tempo = audio_features.get('tempo', 0)
    loudness = audio_features.get('loudness', -20)
    
    # High energy is trending
    if energy >= 0.7:
        trend_score += 20
    elif energy >= 0.5:
        trend_score += 10
    
    # Danceability for social media
    if danceability >= 0.7:
        trend_score += 25
    elif danceability >= 0.5:
        trend_score += 15
    
    # Optimal tempo for viral content
    if 120 <= tempo <= 140:
        trend_score += 20
    elif 100 <= tempo <= 160:
        trend_score += 10
    
    # Loudness for social media consumption
    if loudness >= -6:
        trend_score += 15
    elif loudness >= -10:
        trend_score += 10
    
    return min(trend_score, 100)

def calculate_composite_viral_score(platform_scores, trend_score, benchmarks=None):
    """Calculate composite viral prediction score"""
    # Weighted platform scores
    weighted_score = 0
    total_weight = 0
    
    for platform, data in platform_scores.items():
        weighted_score += data['score'] * data['weight']
        total_weight += data['weight']
    
    platform_score = weighted_score / total_weight if total_weight > 0 else 0
    
    # Combine with trend alignment (70% platform, 30% trend)
    composite_score = (platform_score * 0.7) + (trend_score * 0.3)
    
    # Benchmark adjustment
    if benchmarks:
        # Bonus for being above trending averages
        # This would require more sophisticated analysis
        pass
    
    return min(composite_score, 100)

def predict_viral_timeline(viral_score, platform_scores):
    """Predict viral potential timeline"""
    timeline = {}
    
    # Immediate viral potential (0-2 weeks)
    immediate_platforms = ['tiktok_optimal', 'instagram_reels']
    immediate_score = statistics.mean([
        platform_scores[p]['score'] for p in immediate_platforms 
        if p in platform_scores
    ])
    
    if immediate_score >= 80:
        timeline['immediate'] = 'High - Could go viral within days'
    elif immediate_score >= 60:
        timeline['immediate'] = 'Medium - Viral potential within 1-2 weeks'
    else:
        timeline['immediate'] = 'Low - Limited immediate viral potential'
    
    # Medium-term potential (2-8 weeks)
    if viral_score >= 70:
        timeline['medium_term'] = 'Strong playlist placement potential'
    elif viral_score >= 50:
        timeline['medium_term'] = 'Moderate growth potential with promotion'
    else:
        timeline['medium_term'] = 'Requires strategic positioning'
    
    # Long-term potential (2+ months)
    playlist_score = platform_scores.get('playlist_viral', {}).get('score', 0)
    if playlist_score >= 70:
        timeline['long_term'] = 'Strong evergreen potential'
    elif playlist_score >= 50:
        timeline['long_term'] = 'Solid catalog value'
    else:
        timeline['long_term'] = 'Niche appeal'
    
    return timeline

def generate_viral_recommendations(viral_score, platform_scores, trend_score):
    """Generate actionable recommendations for viral success"""
    recommendations = []
    
    # Platform-specific recommendations
    best_platforms = sorted(
        platform_scores.items(), 
        key=lambda x: x[1]['score'], 
        reverse=True
    )[:2]
    
    for platform, data in best_platforms:
        if data['score'] >= 60:
            if platform == 'tiktok_optimal':
                recommendations.append("🎵 Focus TikTok promotion - strong viral potential")
            elif platform == 'instagram_reels':
                recommendations.append("📸 Create Instagram Reels content")
            elif platform == 'youtube_shorts':
                recommendations.append("🎬 Develop YouTube Shorts strategy")
            elif platform == 'playlist_viral':
                recommendations.append("📋 Target major playlist placements")
    
    # Score-based recommendations
    if viral_score >= 80:
        recommendations.append("🚀 HIGH PRIORITY: Allocate maximum marketing budget")
        recommendations.append("🎯 Consider paid social media promotion")
    elif viral_score >= 60:
        recommendations.append("⭐ MEDIUM PRIORITY: Focus on organic growth strategies")
    else:
        recommendations.append("💡 BUILD STRATEGY: Use for sync/licensing opportunities")
    
    # Trend-based recommendations
    if trend_score >= 70:
        recommendations.append("🔥 TRENDING: Capitalize on current market trends")
    elif trend_score < 40:
        recommendations.append("🎨 DIFFERENTIATE: Unique positioning required")
    
    return recommendations

def save_viral_prediction(track_data, viral_analysis):
    """Save viral prediction to DynamoDB"""
    try:
        # Create table if it doesn't exist
        try:
            viral_table = dynamodb.Table(DYNAMO_VIRAL_TABLE)
            viral_table.load()
        except:
            viral_table = dynamodb.create_table(
                TableName=DYNAMO_VIRAL_TABLE,
                KeySchema=[
                    {'AttributeName': 'track_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'track_id', 'AttributeType': 'S'}
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            viral_table.wait_until_exists()
        
        # Convert float values to Decimal
        def convert_to_decimal(obj):
            if isinstance(obj, float):
                return Decimal(str(obj))
            elif isinstance(obj, dict):
                return {k: convert_to_decimal(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_to_decimal(v) for v in obj]
            return obj
        
        prediction_item = {
            'track_id': track_data['track_id'],
            'title': track_data['title'],
            'timestamp': datetime.utcnow().isoformat(),
            'viral_analysis': convert_to_decimal(viral_analysis),
            'prediction_version': '1.0'
        }
        
        viral_table.put_item(Item=prediction_item)
        return True
        
    except Exception as e:
        print(f"❌ Error saving viral prediction: {e}")
        return False

def generate_viral_report(all_predictions):
    """Generate comprehensive viral prediction report"""
    print(f"\n🚀 VIRAL PREDICTION REPORT")
    print("=" * 60)
    
    # Sort by composite viral score
    sorted_predictions = sorted(
        all_predictions, 
        key=lambda x: x['viral_analysis']['composite_viral_score'], 
        reverse=True
    )
    
    print(f"\n🔥 TOP VIRAL CANDIDATES:")
    for i, pred in enumerate(sorted_predictions[:5], 1):
        analysis = pred['viral_analysis']
        score = analysis['composite_viral_score']
        best_platform = max(
            analysis['platform_scores'].items(), 
            key=lambda x: x[1]['score']
        )
        
        print(f"{i}. {pred['title']}")
        print(f"   🎯 Viral Score: {score:.1f}/100")
        print(f"   📱 Best Platform: {best_platform[0]} ({best_platform[1]['score']:.1f})")
        print(f"   📈 Trend Alignment: {analysis['trend_alignment_score']:.1f}/100")
        print()
    
    # Platform analysis
    platform_averages = {}
    for pred in all_predictions:
        for platform, data in pred['viral_analysis']['platform_scores'].items():
            if platform not in platform_averages:
                platform_averages[platform] = []
            platform_averages[platform].append(data['score'])
    
    print(f"📊 PLATFORM VIRAL POTENTIAL AVERAGES:")
    for platform, scores in platform_averages.items():
        avg_score = statistics.mean(scores)
        print(f"   {platform}: {avg_score:.1f}/100")
    
    # Priority recommendations
    high_potential = [p for p in sorted_predictions if p['viral_analysis']['composite_viral_score'] >= 70]
    medium_potential = [p for p in sorted_predictions if 50 <= p['viral_analysis']['composite_viral_score'] < 70]
    
    print(f"\n🎯 PRIORITY BREAKDOWN:")
    print(f"   🔥 High Viral Potential: {len(high_potential)} tracks")
    print(f"   ⭐ Medium Viral Potential: {len(medium_potential)} tracks")
    print(f"   💡 Strategic Positioning: {len(sorted_predictions) - len(high_potential) - len(medium_potential)} tracks")

def main():
    """Main execution function"""
    print("🚀 VIRAL SOUND PREDICTION MODEL")
    print("🎯 AI-Powered Viral Potential Analysis")
    print("=" * 50)
    
    # Get Spotify token
    print("🔐 Authenticating with Spotify...")
    spotify_token = get_spotify_token()
    if not spotify_token:
        return
    
    # Get mood/context data
    print("🎭 Loading mood & context analysis data...")
    mood_data = get_mood_context_data()
    if not mood_data:
        print("❌ No mood data found. Run mood-context-analyzer.py first.")
        return
    
    # Get trending benchmarks
    print("📈 Analyzing current viral trends...")
    benchmarks = get_trending_benchmarks(spotify_token)
    
    # Analyze each track
    print("🔮 Predicting viral potential...")
    all_predictions = []
    
    for track_data in mood_data:
        try:
            audio_features = track_data['audio_features']
            
            # Calculate platform viral scores
            platform_scores = calculate_platform_viral_scores(audio_features)
            
            # Calculate trend alignment
            track_metadata = {
                'album_info': track_data.get('album_info', {}),
                'sync_categories': track_data.get('sync_categories', [])
            }
            trend_score = calculate_trend_alignment_score(audio_features, track_metadata)
            
            # Calculate composite viral score
            composite_score = calculate_composite_viral_score(
                platform_scores, trend_score, benchmarks
            )
            
            # Predict timeline
            timeline = predict_viral_timeline(composite_score, platform_scores)
            
            # Generate recommendations
            recommendations = generate_viral_recommendations(
                composite_score, platform_scores, trend_score
            )
            
            viral_analysis = {
                'composite_viral_score': composite_score,
                'platform_scores': platform_scores,
                'trend_alignment_score': trend_score,
                'viral_timeline': timeline,
                'recommendations': recommendations,
                'benchmarks_used': benchmarks is not None
            }
            
            # Save prediction
            prediction_data = {
                'track_id': track_data['track_id'],
                'title': track_data['title']
            }
            
            success = save_viral_prediction(prediction_data, viral_analysis)
            
            if success:
                prediction_data['viral_analysis'] = viral_analysis
                all_predictions.append(prediction_data)
                
                print(f"✅ {track_data['title']}: {composite_score:.1f}/100 viral score")
            
        except Exception as e:
            print(f"❌ Error analyzing {track_data.get('title', 'Unknown')}: {e}")
    
    # Generate comprehensive report
    if all_predictions:
        generate_viral_report(all_predictions)
    
    print(f"\n🎉 VIRAL PREDICTION COMPLETE!")
    print(f"   ✅ Analyzed: {len(all_predictions)} tracks")
    print(f"   📊 Data saved to: {DYNAMO_VIRAL_TABLE}")
    print(f"\n🚀 Next steps:")
    print(f"   1. Focus marketing on high-potential tracks")
    print(f"   2. Create platform-specific content strategies")
    print(f"   3. Monitor viral performance against predictions")

if __name__ == "__main__":
    main()