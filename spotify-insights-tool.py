import boto3
import json
import requests
import base64
from datetime import datetime, timedelta
import statistics
from decimal import Decimal

# --- Configuration ---
DYNAMO_INSIGHTS_TABLE = 'prod-SpotifyInsights-decodedmusic-backend'
DYNAMO_GROWTH_TABLE = 'prod-GrowthMetrics-decodedmusic-backend'
ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'  # Rue de Vivre Spotify Artist ID
ARTIST_NAME = 'Rue De Vivre'

# --- Spotify API Configuration ---
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'

# --- AWS Clients ---
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
            print("✅ Spotify authentication successful")
            return response.json().get('access_token')
        else:
            print(f"❌ Spotify auth failed: {response.status_code}")
            return None
    except Exception as e:
        print(f"❌ Spotify auth error: {e}")
        return None

def get_comprehensive_artist_data(access_token):
    """Get comprehensive artist data including enhanced insights"""
    headers = {'Authorization': f'Bearer {access_token}'}
    base_url = "https://api.spotify.com/v1"
    
    artist_data = {}
    
    try:
        # 1. Basic Artist Info
        print("📊 Fetching artist profile data...")
        response = requests.get(f"{base_url}/artists/{ARTIST_ID}", headers=headers)
        if response.status_code == 200:
            artist_info = response.json()
            artist_data['profile'] = {
                'name': artist_info['name'],
                'followers': artist_info['followers']['total'],
                'popularity': artist_info['popularity'],
                'genres': artist_info['genres'],
                'external_urls': artist_info['external_urls'],
                'spotify_url': artist_info['external_urls'].get('spotify', '')
            }
            print(f"   👤 Artist: {artist_info['name']}")
            print(f"   👥 Followers: {artist_info['followers']['total']:,}")
            print(f"   ⭐ Popularity: {artist_info['popularity']}/100")
        
        # 2. Top Tracks with Audio Features
        print("\n🎵 Fetching top tracks with audio analysis...")
        response = requests.get(f"{base_url}/artists/{ARTIST_ID}/top-tracks?market=US", headers=headers)
        if response.status_code == 200:
            top_tracks = response.json()['tracks']
            artist_data['top_tracks'] = []
            track_ids = []
            
            for track in top_tracks:
                track_data = {
                    'name': track['name'],
                    'popularity': track['popularity'],
                    'duration_ms': track['duration_ms'],
                    'explicit': track['explicit'],
                    'preview_url': track.get('preview_url'),
                    'external_urls': track['external_urls'],
                    'album': {
                        'name': track['album']['name'],
                        'release_date': track['album']['release_date'],
                        'total_tracks': track['album']['total_tracks']
                    }
                }
                artist_data['top_tracks'].append(track_data)
                track_ids.append(track['id'])
            
            # Get audio features for top tracks
            if track_ids:
                print("   🎼 Analyzing audio features...")
                features_response = requests.get(
                    f"{base_url}/audio-features?ids={','.join(track_ids[:10])}", 
                    headers=headers
                )
                if features_response.status_code == 200:
                    audio_features = features_response.json()['audio_features']
                    valid_features = [f for f in audio_features if f]
                    
                    if valid_features:
                        artist_data['audio_profile'] = {
                            'avg_danceability': statistics.mean(f['danceability'] for f in valid_features),
                            'avg_energy': statistics.mean(f['energy'] for f in valid_features),
                            'avg_valence': statistics.mean(f['valence'] for f in valid_features),
                            'avg_tempo': statistics.mean(f['tempo'] for f in valid_features),
                            'avg_acousticness': statistics.mean(f['acousticness'] for f in valid_features),
                            'avg_instrumentalness': statistics.mean(f['instrumentalness'] for f in valid_features),
                            'avg_speechiness': statistics.mean(f['speechiness'] for f in valid_features),
                            'most_common_key': statistics.mode(f['key'] for f in valid_features),
                            'tracks_analyzed': len(valid_features)
                        }
        
        # 3. Global Market Analysis
        print("\n🌍 Analyzing global market presence...")
        markets = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'ES', 'IT', 'NL', 'SE', 'NO', 'DK', 'FI']
        market_data = {}
        
        for market in markets:
            try:
                market_response = requests.get(f"{base_url}/artists/{ARTIST_ID}/top-tracks?market={market}", headers=headers)
                if market_response.status_code == 200:
                    market_tracks = market_response.json()['tracks']
                    if market_tracks:
                        market_data[market] = {
                            'total_tracks': len(market_tracks),
                            'top_track': market_tracks[0]['name'],
                            'avg_popularity': statistics.mean(t['popularity'] for t in market_tracks),
                            'max_popularity': max(t['popularity'] for t in market_tracks)
                        }
                time.sleep(0.1)  # Rate limiting
            except:
                continue
        
        artist_data['market_analysis'] = market_data
        
        # 4. Related Artists Analysis
        print("\n👥 Analyzing related artists...")
        response = requests.get(f"{base_url}/artists/{ARTIST_ID}/related-artists", headers=headers)
        if response.status_code == 200:
            related_artists = response.json()['artists']
            artist_data['related_artists'] = []
            
            for artist in related_artists[:15]:
                artist_info = {
                    'name': artist['name'],
                    'followers': artist['followers']['total'],
                    'popularity': artist['popularity'],
                    'genres': artist['genres']
                }
                artist_data['related_artists'].append(artist_info)
        
        # 5. Spotify Recommendations
        print("\n🎯 Getting Spotify recommendations...")
        rec_response = requests.get(
            f"{base_url}/recommendations?seed_artists={ARTIST_ID}&limit=20", 
            headers=headers
        )
        if rec_response.status_code == 200:
            recommendations = rec_response.json()['tracks']
            artist_data['recommendations'] = [
                {
                    'name': track['name'],
                    'artist': track['artists'][0]['name'],
                    'popularity': track['popularity'],
                    'preview_url': track.get('preview_url')
                }
                for track in recommendations
            ]
        
        # 6. Albums with Release Timeline
        print("\n💿 Analyzing release history...")
        response = requests.get(f"{base_url}/artists/{ARTIST_ID}/albums?market=US&limit=50&include_groups=album,single", headers=headers)
        if response.status_code == 200:
            albums = response.json()['items']
            artist_data['albums'] = []
            
            for album in albums:
                album_data = {
                    'name': album['name'],
                    'album_type': album['album_type'],
                    'release_date': album['release_date'],
                    'total_tracks': album['total_tracks'],
                    'external_urls': album['external_urls']
                }
                artist_data['albums'].append(album_data)
        
        return artist_data
        
    except Exception as e:
        print(f"❌ Error fetching comprehensive data: {e}")
        return None

def calculate_growth_metrics(current_data, historical_data):
    """Calculate comprehensive growth metrics"""
    growth_metrics = {
        'follower_metrics': {},
        'popularity_metrics': {},
        'market_expansion': {},
        'audio_evolution': {},
        'visibility_score': 0
    }
    
    if not historical_data:
        print("📊 No historical data for growth comparison")
        return growth_metrics
    
    # Sort historical data by timestamp
    historical_data.sort(key=lambda x: x.get('timestamp', ''))
    
    # Calculate follower growth trends
    if len(historical_data) >= 1:
        last_week = historical_data[-1]
        last_data = last_week.get('data', {})
        
        current_followers = current_data.get('profile', {}).get('followers', 0)
        last_followers = last_data.get('profile', {}).get('followers', 0)
        
        # Weekly growth
        weekly_growth = current_followers - last_followers
        weekly_growth_rate = (weekly_growth / last_followers * 100) if last_followers > 0 else 0
        
        growth_metrics['follower_metrics'] = {
            'current_followers': current_followers,
            'weekly_growth': weekly_growth,
            'weekly_growth_rate': weekly_growth_rate
        }
        
        # If we have more historical data, calculate longer trends
        if len(historical_data) >= 4:
            month_ago = historical_data[-4]
            month_ago_followers = month_ago.get('data', {}).get('profile', {}).get('followers', 0)
            monthly_growth = current_followers - month_ago_followers
            monthly_growth_rate = (monthly_growth / month_ago_followers * 100) if month_ago_followers > 0 else 0
            
            growth_metrics['follower_metrics'].update({
                'monthly_growth': monthly_growth,
                'monthly_growth_rate': monthly_growth_rate
            })
        
        # Popularity metrics
        current_popularity = current_data.get('profile', {}).get('popularity', 0)
        last_popularity = last_data.get('profile', {}).get('popularity', 0)
        
        growth_metrics['popularity_metrics'] = {
            'current_popularity': current_popularity,
            'popularity_change': current_popularity - last_popularity,
            'popularity_trend': 'increasing' if current_popularity > last_popularity else 'decreasing' if current_popularity < last_popularity else 'stable'
        }
        
        # Market expansion analysis
        current_markets = set(current_data.get('market_analysis', {}).keys())
        last_markets = set(last_data.get('market_analysis', {}).keys())
        
        growth_metrics['market_expansion'] = {
            'current_markets': len(current_markets),
            'new_markets': list(current_markets - last_markets),
            'lost_markets': list(last_markets - current_markets),
            'market_growth': len(current_markets) - len(last_markets)
        }
    
    # Calculate visibility score (composite metric)
    visibility_components = []
    
    # Follower component (0-25 points)
    follower_score = min(current_data.get('profile', {}).get('followers', 0) / 10000 * 25, 25)
    visibility_components.append(follower_score)
    
    # Popularity component (0-25 points)
    popularity_score = current_data.get('profile', {}).get('popularity', 0) / 100 * 25
    visibility_components.append(popularity_score)
    
    # Market reach component (0-25 points)
    market_score = len(current_data.get('market_analysis', {})) / 15 * 25
    visibility_components.append(market_score)
    
    # Track performance component (0-25 points)
    top_tracks = current_data.get('top_tracks', [])
    if top_tracks:
        avg_track_popularity = statistics.mean(track['popularity'] for track in top_tracks[:5])
        track_score = avg_track_popularity / 100 * 25
    else:
        track_score = 0
    visibility_components.append(track_score)
    
    growth_metrics['visibility_score'] = sum(visibility_components)
    growth_metrics['visibility_components'] = {
        'follower_score': follower_score,
        'popularity_score': popularity_score,
        'market_score': market_score,
        'track_score': track_score
    }
    
    return growth_metrics

def store_growth_metrics(growth_metrics, timestamp):
    """Store growth metrics in dedicated table"""
    try:
        growth_table = dynamodb.Table(DYNAMO_GROWTH_TABLE)
        
        date_str = datetime.utcnow().strftime('%Y-%m-%d')
        
        # Convert float values to Decimal for DynamoDB
        def convert_floats(obj):
            if isinstance(obj, float):
                return Decimal(str(obj))
            elif isinstance(obj, dict):
                return {k: convert_floats(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_floats(v) for v in obj]
            return obj
        
        converted_metrics = convert_floats(growth_metrics)
        
        record = {
            'metricId': f"{ARTIST_ID}_{date_str}",
            'artistId': ARTIST_ID,
            'artistName': ARTIST_NAME,
            'date': date_str,
            'timestamp': timestamp,
            'metrics': converted_metrics
        }
        
        growth_table.put_item(Item=record)
        print(f"✅ Stored growth metrics for {date_str}")
        return True
        
    except Exception as e:
        print(f"❌ Error storing growth metrics: {e}")
        return False

def get_historical_insights_data(weeks_back=8):
    """Get historical insights data for growth analysis"""
    try:
        insights_table = dynamodb.Table(DYNAMO_INSIGHTS_TABLE)
        
        cutoff_date = (datetime.utcnow() - timedelta(weeks=weeks_back)).isoformat()
        
        response = insights_table.query(
            IndexName='ArtistTimestampIndex',
            KeyConditionExpression='artistId = :aid AND #ts > :cutoff',
            ExpressionAttributeNames={'#ts': 'timestamp'},
            ExpressionAttributeValues={
                ':aid': ARTIST_ID,
                ':cutoff': cutoff_date
            }
        )
        
        historical_data = sorted(response['Items'], key=lambda x: x['timestamp'])
        print(f"📈 Found {len(historical_data)} historical data points")
        return historical_data
        
    except Exception as e:
        print(f"❌ Error getting historical data: {e}")
        return []

def store_enhanced_insights_data(artist_data):
    """Store enhanced insights data in DynamoDB"""
    try:
        insights_table = dynamodb.Table(DYNAMO_INSIGHTS_TABLE)
        
        timestamp = datetime.utcnow().isoformat()
        week_start = (datetime.utcnow() - timedelta(days=datetime.utcnow().weekday())).strftime('%Y-%m-%d')
        
        # Convert float values to Decimal for DynamoDB
        def convert_floats(obj):
            if isinstance(obj, float):
                return Decimal(str(obj))
            elif isinstance(obj, dict):
                return {k: convert_floats(v) for k, v in obj.items()}
            elif isinstance(obj, list):
                return [convert_floats(v) for v in obj]
            return obj
        
        converted_data = convert_floats(artist_data)
        
        record = {
            'id': f"{ARTIST_ID}_{timestamp}",
            'artistId': ARTIST_ID,
            'artistName': ARTIST_NAME,
            'weekStart': week_start,
            'timestamp': timestamp,
            'data': converted_data,
            'type': 'enhanced_insights'
        }
        
        insights_table.put_item(Item=record)
        print(f"✅ Stored enhanced insights data for {timestamp}")
        return True
        
    except Exception as e:
        print(f"❌ Error storing enhanced insights: {e}")
        return False

def generate_growth_report(current_data, growth_metrics, historical_data):
    """Generate comprehensive growth and insights report"""
    print("\n" + "=" * 80)
    print("🎧 RUE DE VIVRE - ENHANCED SPOTIFY GROWTH INSIGHTS")
    print("=" * 80)
    
    # Current Status
    profile = current_data.get('profile', {})
    print(f"\n📊 CURRENT STATUS:")
    print(f"   👥 Followers: {profile.get('followers', 0):,}")
    print(f"   ⭐ Popularity: {profile.get('popularity', 0)}/100")
    print(f"   🌍 Markets: {len(current_data.get('market_analysis', {}))}")
    print(f"   🎵 Top Tracks: {len(current_data.get('top_tracks', []))}")
    
    # Growth Metrics
    follower_metrics = growth_metrics.get('follower_metrics', {})
    if follower_metrics:
        print(f"\n📈 GROWTH METRICS:")
        print(f"   📊 Weekly Growth: {follower_metrics.get('weekly_growth', 0):+,} followers ({follower_metrics.get('weekly_growth_rate', 0):+.2f}%)")
        if 'monthly_growth' in follower_metrics:
            print(f"   📊 Monthly Growth: {follower_metrics.get('monthly_growth', 0):+,} followers ({follower_metrics.get('monthly_growth_rate', 0):+.2f}%)")
    
    # Visibility Score
    visibility_score = growth_metrics.get('visibility_score', 0)
    print(f"\n🎯 VISIBILITY SCORE: {visibility_score:.1f}/100")
    
    components = growth_metrics.get('visibility_components', {})
    if components:
        print(f"   👥 Follower Score: {components.get('follower_score', 0):.1f}/25")
        print(f"   ⭐ Popularity Score: {components.get('popularity_score', 0):.1f}/25")
        print(f"   🌍 Market Score: {components.get('market_score', 0):.1f}/25")
        print(f"   🎵 Track Score: {components.get('track_score', 0):.1f}/25")
    
    # Audio Profile
    audio_profile = current_data.get('audio_profile', {})
    if audio_profile:
        print(f"\n🎵 AUDIO PROFILE:")
        print(f"   🕺 Danceability: {audio_profile.get('avg_danceability', 0):.2f}/1.0")
        print(f"   ⚡ Energy: {audio_profile.get('avg_energy', 0):.2f}/1.0")
        print(f"   😊 Valence (Mood): {audio_profile.get('avg_valence', 0):.2f}/1.0")
        print(f"   🎼 Tempo: {audio_profile.get('avg_tempo', 0):.0f} BPM")
        print(f"   🎹 Acousticness: {audio_profile.get('avg_acousticness', 0):.2f}/1.0")
    
    # Market Analysis
    market_data = current_data.get('market_analysis', {})
    if market_data:
        print(f"\n🌍 GLOBAL MARKET PRESENCE:")
        sorted_markets = sorted(market_data.items(), key=lambda x: x[1]['avg_popularity'], reverse=True)
        for market, data in sorted_markets[:8]:
            print(f"   {market}: {data['total_tracks']} tracks, avg popularity: {data['avg_popularity']:.1f}")
    
    # Market Expansion
    market_expansion = growth_metrics.get('market_expansion', {})
    if market_expansion.get('new_markets'):
        print(f"\n🆕 NEW MARKETS THIS WEEK: {', '.join(market_expansion['new_markets'])}")
    
    # Top Tracks
    top_tracks = current_data.get('top_tracks', [])
    if top_tracks:
        print(f"\n🎯 TOP PERFORMING TRACKS:")
        for i, track in enumerate(top_tracks[:5], 1):
            print(f"   {i}. {track['name']} (Popularity: {track['popularity']})")
    
    # Related Artists Benchmarking
    related_artists = current_data.get('related_artists', [])
    if related_artists:
        print(f"\n👥 RELATED ARTISTS BENCHMARK:")
        avg_related_followers = statistics.mean(a['followers'] for a in related_artists)
        avg_related_popularity = statistics.mean(a['popularity'] for a in related_artists)
        
        current_followers = profile.get('followers', 0)
        current_popularity = profile.get('popularity', 0)
        
        print(f"   📊 Your Position vs Average:")
        print(f"     Followers: {current_followers:,} vs {avg_related_followers:,.0f} (avg)")
        print(f"     Popularity: {current_popularity} vs {avg_related_popularity:.1f} (avg)")
    
    # Recommendations
    recommendations = current_data.get('recommendations', [])
    if recommendations:
        print(f"\n🎯 SPOTIFY RECOMMENDATIONS (Similar Style):")
        for i, rec in enumerate(recommendations[:3], 1):
            print(f"   {i}. {rec['name']} by {rec['artist']} (Popularity: {rec['popularity']})")
    
    # Growth Trend Analysis
    if len(historical_data) >= 3:
        print(f"\n📈 GROWTH TREND ANALYSIS:")
        recent_followers = [d.get('data', {}).get('profile', {}).get('followers', 0) for d in historical_data[-3:]]
        recent_popularity = [d.get('data', {}).get('profile', {}).get('popularity', 0) for d in historical_data[-3:]]
        
        if len(recent_followers) >= 2:
            follower_trend = "📈 Increasing" if recent_followers[-1] > recent_followers[0] else "📉 Decreasing" if recent_followers[-1] < recent_followers[0] else "➡️ Stable"
            popularity_trend = "📈 Increasing" if recent_popularity[-1] > recent_popularity[0] else "📉 Decreasing" if recent_popularity[-1] < recent_popularity[0] else "➡️ Stable"
            
            print(f"   Follower Trend: {follower_trend}")
            print(f"   Popularity Trend: {popularity_trend}")
    
    print("\n" + "=" * 80)

def main():
    """Main execution function for enhanced insights with growth tracking"""
    print("🎧 Enhanced Spotify Insights with Growth Tracking")
    print("🔗 Artist: Rue de Vivre")
    print("=" * 60)
    
    # Get Spotify token
    print("\n🔐 Authenticating with Spotify...")
    access_token = get_spotify_token()
    if not access_token:
        print("❌ Failed to authenticate with Spotify")
        return
    
    # Get comprehensive artist data
    print("\n📊 Collecting comprehensive artist data...")
    current_data = get_comprehensive_artist_data(access_token)
    if not current_data:
        print("❌ Failed to fetch artist data")
        return
    
    # Get historical data for growth analysis
    print("\n📈 Analyzing growth trends...")
    historical_data = get_historical_insights_data(weeks_back=8)
    
    # Calculate growth metrics
    print("\n🔍 Calculating growth metrics...")
    growth_metrics = calculate_growth_metrics(current_data, historical_data)
    
    # Store current data
    print("\n💾 Storing insights data...")
    store_enhanced_insights_data(current_data)
    
    # Store growth metrics
    timestamp = datetime.utcnow().isoformat()
    store_growth_metrics(growth_metrics, timestamp)
    
    # Generate comprehensive report
    generate_growth_report(current_data, growth_metrics, historical_data)
    
    # Save detailed report to JSON
    report_data = {
        'timestamp': timestamp,
        'current_data': current_data,
        'growth_metrics': growth_metrics,
        'historical_data_points': len(historical_data)
    }
    
    report_filename = f"rue_de_vivre_growth_insights_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_filename, 'w') as f:
        json.dump(report_data, f, indent=2, default=str)
    
    print(f"\n📄 Detailed report saved: {report_filename}")
    print("✅ Enhanced insights with growth tracking complete!")
    
    return report_data

if __name__ == "__main__":
    main()