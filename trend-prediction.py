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
DYNAMO_INSIGHTS_TABLE = 'prod-SpotifyInsights-decodedmusic-backend'
DYNAMO_MOOD_TABLE = 'prod-MoodContextAnalysis-decodedmusic-backend'
DYNAMO_VIRAL_TABLE = 'prod-ViralPrediction-decodedmusic-backend'
DYNAMO_TRENDS_TABLE = 'prod-TrendPrediction-decodedmusic-backend'
SPOTIFY_ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'

# --- Spotify API Configuration ---
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'

# --- AWS Client ---
dynamodb = boto3.resource('dynamodb')

def predict_market_trends():
    """Predict emerging trends and opportunities"""
    print("🔮 PREDICTING MARKET TRENDS...")
    
    try:
        # Get current catalog data
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        mood_table = dynamodb.Table(DYNAMO_MOOD_TABLE)
        
        # Get mood analysis data
        mood_response = mood_table.scan()
        tracks_data = mood_response['Items']
        
        # Audio Feature Trend Analysis
        audio_trends = analyze_audio_feature_trends(tracks_data)
        
        # Genre Evolution Tracking
        genre_evolution = track_genre_evolution(tracks_data)
        
        # Seasonal Pattern Recognition
        seasonal_patterns = recognize_seasonal_patterns()
        
        # Viral Sound Prediction Model
        viral_predictions = predict_viral_sounds(tracks_data)
        
        # Market Saturation Analysis
        market_saturation = analyze_market_saturation(tracks_data)
        
        trend_analysis = {
            'audio_feature_trends': audio_trends,
            'genre_evolution': genre_evolution,
            'seasonal_patterns': seasonal_patterns,
            'viral_predictions': viral_predictions,
            'market_saturation': market_saturation,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Save to DynamoDB
        save_trend_analysis(trend_analysis)
        
        return trend_analysis
        
    except Exception as e:
        print(f"❌ Error predicting market trends: {e}")
        return {}

def analyze_audio_feature_trends(tracks_data):
    """Analyze trends in audio features"""
    print("   📊 Analyzing audio feature trends...")
    
    feature_trends = {
        'energy_trend': [],
        'danceability_trend': [],
        'valence_trend': [],
        'tempo_trend': [],
        'popularity_correlations': {}
    }
    
    for track in tracks_data:
        audio_features = track.get('audio_features', {})
        
        if audio_features:
            feature_trends['energy_trend'].append(float(audio_features.get('energy', 0)))
            feature_trends['danceability_trend'].append(float(audio_features.get('danceability', 0)))
            feature_trends['valence_trend'].append(float(audio_features.get('valence', 0)))
            feature_trends['tempo_trend'].append(float(audio_features.get('tempo', 0)))
    
    # Calculate trend insights
    trends = {
        'average_energy': statistics.mean(feature_trends['energy_trend']) if feature_trends['energy_trend'] else 0,
        'average_danceability': statistics.mean(feature_trends['danceability_trend']) if feature_trends['danceability_trend'] else 0,
        'average_valence': statistics.mean(feature_trends['valence_trend']) if feature_trends['valence_trend'] else 0,
        'average_tempo': statistics.mean(feature_trends['tempo_trend']) if feature_trends['tempo_trend'] else 0,
        'energy_variance': statistics.stdev(feature_trends['energy_trend']) if len(feature_trends['energy_trend']) > 1 else 0,
        'optimal_ranges': {
            'energy': (0.6, 0.8),  # Sweet spot for viral potential
            'danceability': (0.7, 0.9),  # High danceability trending
            'valence': (0.5, 0.8),  # Positive emotions preferred
            'tempo': (120, 140)  # BPM range for social media
        }
    }
    
    return trends

def track_genre_evolution(tracks_data):
    """Track genre evolution and emerging sub-genres"""
    print("   🎵 Tracking genre evolution...")
    
    genre_patterns = {
        'electronic_fusion': 0,
        'ambient_electronic': 0,
        'dance_electronic': 0,
        'cinematic_electronic': 0,
        'experimental': 0
    }
    
    for track in tracks_data:
        mood_analysis = track.get('mood_analysis', {})
        compound_mood = mood_analysis.get('compound_mood', '')
        
        # Classify into emerging genres based on mood patterns
        if 'Euphoric' in compound_mood or 'Party' in compound_mood:
            genre_patterns['dance_electronic'] += 1
        elif 'Acoustic' in compound_mood or 'Chill' in compound_mood:
            genre_patterns['ambient_electronic'] += 1
        elif 'Dynamic' in compound_mood or 'Blend' in compound_mood:
            genre_patterns['experimental'] += 1
        elif 'Dancefloor' in compound_mood:
            genre_patterns['electronic_fusion'] += 1
    
    # Predict emerging trends
    total_tracks = len(tracks_data)
    genre_percentages = {k: (v/total_tracks*100) if total_tracks > 0 else 0 for k, v in genre_patterns.items()}
    
    evolution_insights = {
        'genre_distribution': genre_percentages,
        'trending_genres': sorted(genre_percentages.items(), key=lambda x: x[1], reverse=True)[:3],
        'recommendations': [
            'Focus on dance_electronic for viral potential',
            'Develop ambient_electronic for streaming playlists',
            'Experiment with genre fusion for uniqueness'
        ]
    }
    
    return evolution_insights

def recognize_seasonal_patterns():
    """Recognize seasonal streaming patterns"""
    print("   📅 Recognizing seasonal patterns...")
    
    current_month = datetime.now().month
    
    seasonal_insights = {
        'current_season': get_season(current_month),
        'seasonal_recommendations': {
            'spring': ['Upbeat', 'Fresh', 'Motivational'],
            'summer': ['High-Energy', 'Party', 'Festival'],
            'fall': ['Introspective', 'Moody', 'Atmospheric'],
            'winter': ['Cozy', 'Ambient', 'Reflective']
        },
        'optimal_release_timing': {
            'high_energy_tracks': 'May-August (Summer festival season)',
            'ambient_tracks': 'October-February (Introspective season)',
            'party_tracks': 'December-January, June-August',
            'workout_tracks': 'January (New Year), May-June (Summer prep)'
        }
    }
    
    return seasonal_insights

def get_season(month):
    """Get season from month"""
    if month in [3, 4, 5]:
        return 'spring'
    elif month in [6, 7, 8]:
        return 'summer'
    elif month in [9, 10, 11]:
        return 'fall'
    else:
        return 'winter'

def predict_viral_sounds(tracks_data):
    """Predict viral sound patterns"""
    print("   🚀 Predicting viral sounds...")
    
    viral_patterns = {
        'tiktok_ready': [],
        'instagram_ready': [],
        'youtube_ready': [],
        'playlist_ready': []
    }
    
    for track in tracks_data:
        viral_score = float(track.get('viral_potential_score', 0))
        title = track.get('title', 'Unknown')
        
        if viral_score >= 70:
            audio_features = track.get('audio_features', {})
            tempo = float(audio_features.get('tempo', 0))
            energy = float(audio_features.get('energy', 0))
            danceability = float(audio_features.get('danceability', 0))
            
            # TikTok optimal
            if 120 <= tempo <= 140 and energy >= 0.6 and danceability >= 0.7:
                viral_patterns['tiktok_ready'].append(title)
            
            # Instagram Reels
            if 100 <= tempo <= 130 and energy >= 0.5 and danceability >= 0.6:
                viral_patterns['instagram_ready'].append(title)
            
            # YouTube Shorts
            if 90 <= tempo <= 150 and energy >= 0.4:
                viral_patterns['youtube_ready'].append(title)
            
            # Playlist potential
            if 0.5 <= energy <= 0.9:
                viral_patterns['playlist_ready'].append(title)
    
    viral_insights = {
        'platform_readiness': viral_patterns,
        'viral_indicators': {
            'optimal_tempo_range': '120-140 BPM',
            'energy_sweet_spot': '0.6-0.8',
            'danceability_threshold': '0.7+',
            'duration_preference': '2-3 minutes'
        },
        'next_actions': [
            'Create 15-30 second hooks for TikTok',
            'Develop visual content for high-scoring tracks',
            'Plan influencer collaborations',
            'Schedule coordinated platform releases'
        ]
    }
    
    return viral_insights

def analyze_market_saturation(tracks_data):
    """Analyze market saturation and opportunities"""
    print("   📈 Analyzing market saturation...")
    
    mood_counts = {}
    context_counts = {}
    
    for track in tracks_data:
        mood = track.get('mood_analysis', {}).get('compound_mood', 'Unknown')
        mood_counts[mood] = mood_counts.get(mood, 0) + 1
        
        contexts = track.get('suitable_contexts', [])
        for ctx in contexts:
            context_name = ctx.get('context', 'Unknown')
            context_counts[context_name] = context_counts.get(context_name, 0) + 1
    
    total_tracks = len(tracks_data)
    
    saturation_analysis = {
        'oversaturated_moods': [mood for mood, count in mood_counts.items() if count/total_tracks > 0.3],
        'undersaturated_moods': [mood for mood, count in mood_counts.items() if count/total_tracks < 0.1],
        'market_gaps': [
            'Romantic/Acoustic blend',
            'Gaming/Cinematic crossover',
            'Meditation/Electronic fusion',
            'Corporate/Upbeat hybrid'
        ],
        'opportunity_score': calculate_opportunity_score(mood_counts, context_counts, total_tracks)
    }
    
    return saturation_analysis

def calculate_opportunity_score(mood_counts, context_counts, total_tracks):
    """Calculate market opportunity score"""
    # Higher diversity = higher opportunity
    mood_diversity = len(mood_counts) / total_tracks if total_tracks > 0 else 0
    context_diversity = len(context_counts) / total_tracks if total_tracks > 0 else 0
    
    opportunity_score = (mood_diversity + context_diversity) * 50
    return min(opportunity_score, 100)

def analyze_brand_partnerships():
    """Identify brand partnership and sponsorship opportunities"""
    print("🤝 ANALYZING BRAND PARTNERSHIP OPPORTUNITIES...")
    
    try:
        # Get mood and context data
        mood_table = dynamodb.Table(DYNAMO_MOOD_TABLE)
        mood_response = mood_table.scan()
        tracks_data = mood_response['Items']
        
        # Brand Archetype Matching
        brand_matches = match_brand_archetypes(tracks_data)
        
        # Campaign Budget Analysis
        campaign_analysis = analyze_campaign_budgets(tracks_data)
        
        # Brand Audio Identity Mapping
        audio_identity = map_brand_audio_identity(tracks_data)
        
        # Influencer Campaign Tracking
        influencer_opportunities = track_influencer_campaigns(tracks_data)
        
        # Corporate Event Opportunity Detection
        corporate_events = detect_corporate_opportunities(tracks_data)
        
        partnership_analysis = {
            'brand_matches': brand_matches,
            'campaign_analysis': campaign_analysis,
            'audio_identity_mapping': audio_identity,
            'influencer_opportunities': influencer_opportunities,
            'corporate_event_opportunities': corporate_events,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Save analysis
        save_brand_analysis(partnership_analysis)
        
        return partnership_analysis
        
    except Exception as e:
        print(f"❌ Error analyzing brand partnerships: {e}")
        return {}

def match_brand_archetypes(tracks_data):
    """Match tracks to brand archetypes"""
    print("   🎯 Matching brand archetypes...")
    
    brand_archetypes = {
        'Tech/Innovation': {'energy_min': 0.6, 'valence_min': 0.5, 'tempo_min': 120},
        'Luxury/Premium': {'energy_max': 0.7, 'acousticness_min': 0.3, 'sophistication': True},
        'Fitness/Wellness': {'energy_min': 0.7, 'danceability_min': 0.6, 'tempo_min': 120},
        'Gaming/Esports': {'energy_min': 0.6, 'loudness_min': -8, 'intensity': True},
        'Fashion/Lifestyle': {'danceability_min': 0.5, 'valence_min': 0.4, 'trendy': True},
        'Automotive': {'energy_range': (0.5, 0.8), 'driving_suitable': True},
        'Food/Beverage': {'valence_min': 0.5, 'social_contexts': True}
    }
    
    brand_matches = {}
    
    for archetype, criteria in brand_archetypes.items():
        matching_tracks = []
        
        for track in tracks_data:
            audio_features = track.get('audio_features', {})
            contexts = track.get('suitable_contexts', [])
            
            match_score = calculate_brand_match_score(audio_features, contexts, criteria)
            
            if match_score >= 0.7:  # 70% match threshold
                matching_tracks.append({
                    'title': track.get('title', 'Unknown'),
                    'match_score': match_score,
                    'sync_potential': get_sync_potential(track, archetype)
                })
        
        brand_matches[archetype] = sorted(matching_tracks, key=lambda x: x['match_score'], reverse=True)
    
    return brand_matches

def calculate_brand_match_score(audio_features, contexts, criteria):
    """Calculate how well a track matches brand criteria"""
    score = 0
    total_criteria = len(criteria)
    
    for criterion, threshold in criteria.items():
        if criterion.endswith('_min'):
            feature = criterion.replace('_min', '')
            if audio_features.get(feature, 0) >= threshold:
                score += 1
        elif criterion.endswith('_max'):
            feature = criterion.replace('_max', '')
            if audio_features.get(feature, 0) <= threshold:
                score += 1
        elif criterion.endswith('_range'):
            feature = criterion.replace('_range', '')
            min_val, max_val = threshold
            if min_val <= audio_features.get(feature, 0) <= max_val:
                score += 1
        elif criterion in ['sophistication', 'intensity', 'trendy', 'driving_suitable', 'social_contexts']:
            # Contextual criteria based on track contexts
            score += 0.5  # Partial credit for subjective criteria
    
    return score / total_criteria if total_criteria > 0 else 0

def get_sync_potential(track, brand_archetype):
    """Get sync licensing potential for brand archetype"""
    sync_rates = {
        'Tech/Innovation': '$2000-5000',
        'Luxury/Premium': '$3000-8000',
        'Fitness/Wellness': '$1500-4000',
        'Gaming/Esports': '$1000-3000',
        'Fashion/Lifestyle': '$2000-6000',
        'Automotive': '$3000-10000',
        'Food/Beverage': '$1000-3000'
    }
    
    return sync_rates.get(brand_archetype, '$1000-2000')

def analyze_campaign_budgets(tracks_data):
    """Analyze potential campaign budgets and ROI"""
    print("   💰 Analyzing campaign budgets...")
    
    high_potential_tracks = [t for t in tracks_data if float(t.get('viral_potential_score', 0)) >= 70]
    
    campaign_analysis = {
        'micro_campaigns': {
            'budget_range': '$500-2000',
            'suitable_tracks': len([t for t in high_potential_tracks if float(t.get('viral_potential_score', 0)) >= 70]),
            'expected_reach': '10K-50K impressions',
            'target_platforms': ['TikTok', 'Instagram Reels']
        },
        'standard_campaigns': {
            'budget_range': '$2000-10000',
            'suitable_tracks': len([t for t in high_potential_tracks if float(t.get('viral_potential_score', 0)) >= 80]),
            'expected_reach': '50K-200K impressions',
            'target_platforms': ['All social media', 'Streaming ads']
        },
        'premium_campaigns': {
            'budget_range': '$10000+',
            'suitable_tracks': len([t for t in high_potential_tracks if float(t.get('viral_potential_score', 0)) >= 90]),
            'expected_reach': '200K+ impressions',
            'target_platforms': ['TV commercials', 'Major brand partnerships']
        }
    }
    
    return campaign_analysis

def map_brand_audio_identity(tracks_data):
    """Map brand audio identity characteristics"""
    print("   🎵 Mapping brand audio identities...")
    
    audio_identities = {
        'Energetic/Dynamic': [],
        'Sophisticated/Premium': [],
        'Fun/Playful': [],
        'Calm/Trustworthy': [],
        'Innovative/Forward': []
    }
    
    for track in tracks_data:
        audio_features = track.get('audio_features', {})
        mood = track.get('mood_analysis', {}).get('compound_mood', '')
        
        energy = float(audio_features.get('energy', 0))
        valence = float(audio_features.get('valence', 0))
        acousticness = float(audio_features.get('acousticness', 0))
        
        track_info = {
            'title': track.get('title', 'Unknown'),
            'characteristics': get_audio_characteristics(energy, valence, acousticness)
        }
        
        # Categorize by audio identity
        if energy >= 0.7 and valence >= 0.6:
            audio_identities['Energetic/Dynamic'].append(track_info)
        elif acousticness >= 0.4 and energy <= 0.6:
            audio_identities['Sophisticated/Premium'].append(track_info)
        elif valence >= 0.7 and 'Party' in mood:
            audio_identities['Fun/Playful'].append(track_info)
        elif energy <= 0.5 and valence <= 0.7:
            audio_identities['Calm/Trustworthy'].append(track_info)
        else:
            audio_identities['Innovative/Forward'].append(track_info)
    
    return audio_identities

def get_audio_characteristics(energy, valence, acousticness):
    """Get audio characteristics description"""
    characteristics = []
    
    if energy >= 0.7:
        characteristics.append('High-energy')
    elif energy <= 0.3:
        characteristics.append('Calm')
    
    if valence >= 0.7:
        characteristics.append('Positive')
    elif valence <= 0.3:
        characteristics.append('Moody')
    
    if acousticness >= 0.5:
        characteristics.append('Organic')
    else:
        characteristics.append('Electronic')
    
    return characteristics

def track_influencer_campaigns(tracks_data):
    """Track influencer campaign opportunities"""
    print("   📱 Tracking influencer opportunities...")
    
    influencer_categories = {
        'Fitness Influencers': [],
        'Tech Reviewers': [],
        'Lifestyle Bloggers': [],
        'Gaming Streamers': [],
        'Dance Creators': []
    }
    
    for track in tracks_data:
        contexts = track.get('suitable_contexts', [])
        viral_score = float(track.get('viral_potential_score', 0))
        
        if viral_score >= 70:
            track_info = {
                'title': track.get('title', 'Unknown'),
                'viral_score': viral_score,
                'hook_potential': viral_score >= 80
            }
            
            # Match to influencer categories
            for context in contexts:
                context_name = context.get('context', '')
                
                if 'workout' in context_name:
                    influencer_categories['Fitness Influencers'].append(track_info)
                elif 'gaming' in context_name:
                    influencer_categories['Gaming Streamers'].append(track_info)
                elif context_name in ['party_club', 'driving_commute']:
                    influencer_categories['Lifestyle Bloggers'].append(track_info)
                
                # High danceability for dance creators
                audio_features = track.get('audio_features', {})
                if float(audio_features.get('danceability', 0)) >= 0.7:
                    influencer_categories['Dance Creators'].append(track_info)
    
    return influencer_categories

def detect_corporate_opportunities(tracks_data):
    """Detect corporate event opportunities"""
    print("   🏢 Detecting corporate opportunities...")
    
    corporate_events = {
        'Product Launches': [],
        'Conference/Summit': [],
        'Team Building': [],
        'Awards Ceremonies': [],
        'Trade Shows': []
    }
    
    for track in tracks_data:
        audio_features = track.get('audio_features', {})
        mood = track.get('mood_analysis', {}).get('compound_mood', '')
        
        energy = float(audio_features.get('energy', 0))
        valence = float(audio_features.get('valence', 0))
        
        track_info = {
            'title': track.get('title', 'Unknown'),
            'energy_level': energy,
            'mood': mood,
            'suitability_score': calculate_corporate_suitability(energy, valence, mood)
        }
        
        # Match to corporate event types
        if 0.6 <= energy <= 0.8 and valence >= 0.5:
            corporate_events['Product Launches'].append(track_info)
        
        if 0.4 <= energy <= 0.6 and 'Balanced' in mood:
            corporate_events['Conference/Summit'].append(track_info)
        
        if energy >= 0.6 and 'Party' in mood:
            corporate_events['Team Building'].append(track_info)
        
        if 0.5 <= energy <= 0.7 and valence >= 0.6:
            corporate_events['Awards Ceremonies'].append(track_info)
        
        if 0.5 <= energy <= 0.8:
            corporate_events['Trade Shows'].append(track_info)
    
    return corporate_events

def calculate_corporate_suitability(energy, valence, mood):
    """Calculate corporate event suitability score"""
    score = 0
    
    # Professional energy level (not too high, not too low)
    if 0.4 <= energy <= 0.8:
        score += 30
    
    # Positive but not overwhelming
    if 0.4 <= valence <= 0.8:
        score += 30
    
    # Appropriate mood
    appropriate_moods = ['Balanced', 'Focused', 'Upbeat', 'Professional']
    if any(mood_type in mood for mood_type in appropriate_moods):
        score += 40
    
    return score

def save_trend_analysis(analysis):
    """Save trend analysis to DynamoDB"""
    try:
        # Create table if it doesn't exist
        try:
            trends_table = dynamodb.Table(DYNAMO_TRENDS_TABLE)
            trends_table.load()
        except:
            trends_table = dynamodb.create_table(
                TableName=DYNAMO_TRENDS_TABLE,
                KeySchema=[
                    {'AttributeName': 'analysis_id', 'KeyType': 'HASH'}
                ],
                AttributeDefinitions=[
                    {'AttributeName': 'analysis_id', 'AttributeType': 'S'}
                ],
                BillingMode='PAY_PER_REQUEST'
            )
            trends_table.wait_until_exists()
        
        # Convert floats to Decimal
        def convert_to_decimal(obj):
            if isinstance(obj, float):
                return Decimal(str(obj))
            elif isinstance(obj, dict):
                return {k: convert_to_decimal(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_to_decimal(v) for v in obj]
            return obj
        
        analysis_item = {
            'analysis_id': f"trends_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            'analysis_data': convert_to_decimal(analysis),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        trends_table.put_item(Item=analysis_item)
        print("✅ Trend analysis saved to DynamoDB")
        
    except Exception as e:
        print(f"❌ Error saving trend analysis: {e}")

def save_brand_analysis(analysis):
    """Save brand partnership analysis"""
    try:
        # Use same trends table with different prefix
        trends_table = dynamodb.Table(DYNAMO_TRENDS_TABLE)
        
        def convert_to_decimal(obj):
            if isinstance(obj, float):
                return Decimal(str(obj))
            elif isinstance(obj, dict):
                return {k: convert_to_decimal(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_to_decimal(v) for v in obj]
            return obj
        
        analysis_item = {
            'analysis_id': f"brands_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}",
            'analysis_data': convert_to_decimal(analysis),
            'timestamp': datetime.utcnow().isoformat()
        }
        
        trends_table.put_item(Item=analysis_item)
        print("✅ Brand partnership analysis saved to DynamoDB")
        
    except Exception as e:
        print(f"❌ Error saving brand analysis: {e}")

def main():
    """Main execution function"""
    print("🔮 TREND PREDICTION & BRAND PARTNERSHIP ANALYZER")
    print("=" * 60)
    
    # Predict market trends
    trend_analysis = predict_market_trends()
    
    # Analyze brand partnerships
    brand_analysis = analyze_brand_partnerships()
    
    # Generate combined report
    if trend_analysis and brand_analysis:
        print(f"\n📊 TREND & PARTNERSHIP ANALYSIS COMPLETE!")
        print(f"✅ Market trends analyzed and predicted")
        print(f"✅ Brand partnership opportunities identified")
        print(f"✅ Data saved to: {DYNAMO_TRENDS_TABLE}")
        
        print(f"\n🎯 KEY INSIGHTS:")
        
        # Trend insights
        if 'viral_predictions' in trend_analysis:
            viral_data = trend_analysis['viral_predictions']
            tiktok_ready = viral_data.get('platform_readiness', {}).get('tiktok_ready', [])
            print(f"   🚀 TikTok-ready tracks: {len(tiktok_ready)}")
        
        # Brand insights
        if 'brand_matches' in brand_analysis:
            tech_matches = brand_analysis['brand_matches'].get('Tech/Innovation', [])
            luxury_matches = brand_analysis['brand_matches'].get('Luxury/Premium', [])
            print(f"   💼 Tech brand matches: {len(tech_matches)}")
            print(f"   💎 Luxury brand matches: {len(luxury_matches)}")
        
        print(f"\n💡 NEXT STEPS:")
        print(f"   1. Contact brands with high-matching tracks")
        print(f"   2. Create viral content for trending platforms")
        print(f"   3. Develop seasonal release strategy")
        print(f"   4. Plan influencer collaboration campaigns")
    
    else:
        print("❌ Analysis incomplete - check data availability")

if __name__ == "__main__":
    main()