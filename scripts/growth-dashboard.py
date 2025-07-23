import boto3
import json
from datetime import datetime, timedelta
import statistics

# Configuration - Updated for consistency
DYNAMO_GROWTH_TABLE = 'prod-GrowthMetrics-decodedmusic-backend'
DYNAMO_INSIGHTS_TABLE = 'prod-SpotifyInsights-decodedmusic-backend'
DYNAMO_CATALOG_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
SPOTIFY_ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'  # Spotify Artist ID
CATALOG_ARTIST_ID = 'ruedevivre'  # DynamoDB Catalog Artist ID
ARTIST_NAME = 'Rue De Vivre'

dynamodb = boto3.resource('dynamodb')

def get_growth_history(days_back=30):
    """Get growth metrics history"""
    try:
        growth_table = dynamodb.Table(DYNAMO_GROWTH_TABLE)
        
        cutoff_date = (datetime.utcnow() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        # Use SPOTIFY_ARTIST_ID for growth metrics (matches spotify-insights-tool.py)
        response = growth_table.query(
            IndexName='ArtistDateIndex',
            KeyConditionExpression='artistId = :aid AND #date > :cutoff',
            ExpressionAttributeNames={'#date': 'date'},
            ExpressionAttributeValues={
                ':aid': SPOTIFY_ARTIST_ID,  # Updated to use Spotify ID
                ':cutoff': cutoff_date
            }
        )
        
        return sorted(response['Items'], key=lambda x: x['date'])
        
    except Exception as e:
        print(f"❌ Error getting growth history: {e}")
        return []

def get_catalog_summary():
    """Get catalog summary from main catalog table"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        # Get works count
        response = catalog_table.scan(
            FilterExpression='artistId = :aid',
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID},
            Select='COUNT'
        )
        
        works_count = response['Count']
        
        # Get works with Spotify links
        spotify_linked_response = catalog_table.scan(
            FilterExpression='artistId = :aid AND attribute_exists(spotifyLink)',
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID},
            Select='COUNT'
        )
        
        linked_count = spotify_linked_response['Count']
        
        return {
            'total_works': works_count,
            'spotify_linked': linked_count,
            'link_percentage': (linked_count / works_count * 100) if works_count > 0 else 0
        }
        
    except Exception as e:
        print(f"❌ Error getting catalog summary: {e}")
        return {'total_works': 0, 'spotify_linked': 0, 'link_percentage': 0}

def get_latest_spotify_insights():
    """Get latest Spotify insights data with fallback methods"""
    try:
        insights_table = dynamodb.Table(DYNAMO_INSIGHTS_TABLE)
        
        # Try to use the index first
        try:
            response = insights_table.query(
                IndexName='ArtistTimestampIndex',
                KeyConditionExpression='artistId = :aid',
                ExpressionAttributeValues={':aid': SPOTIFY_ARTIST_ID},
                ScanIndexForward=False,
                Limit=1
            )
            
            if response['Items']:
                return response['Items'][0].get('data', {})
        
        except Exception as index_error:
            print(f"⚠️ Index not available, using scan fallback...")
            
            # Fallback: scan the table
            response = insights_table.scan(
                FilterExpression='artistId = :aid',
                ExpressionAttributeValues={':aid': SPOTIFY_ARTIST_ID}
            )
            
            if response['Items']:
                # Sort by timestamp and get the latest
                sorted_items = sorted(response['Items'], key=lambda x: x.get('timestamp', ''), reverse=True)
                return sorted_items[0].get('data', {})
        
        return {}
        
    except Exception as e:
        print(f"❌ Error getting Spotify insights: {e}")
        return {}

def get_recent_works():
    """Get recent works from catalog"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        # Get recent works (last 30 days)
        cutoff_date = (datetime.utcnow() - timedelta(days=30)).isoformat()
        
        response = catalog_table.scan(
            FilterExpression='artistId = :aid AND #ts > :cutoff',
            ExpressionAttributeNames={'#ts': 'timestamp'},
            ExpressionAttributeValues={
                ':aid': CATALOG_ARTIST_ID,
                ':cutoff': cutoff_date
            }
        )
        
        return response['Items']
        
    except Exception as e:
        print(f"❌ Error getting recent works: {e}")
        return []

def display_growth_dashboard():
    """Display comprehensive growth dashboard with integrated data"""
    print("🎧 RUE DE VIVRE - COMPREHENSIVE GROWTH DASHBOARD")
    print("=" * 70)
    
    # Get all data sources
    print("📊 Loading dashboard data...")
    growth_history = get_growth_history(days_back=30)
    catalog_summary = get_catalog_summary()
    spotify_insights = get_latest_spotify_insights()
    recent_works = get_recent_works()
    
    # Catalog Overview
    print(f"\n📚 CATALOG OVERVIEW:")
    print(f"   🎵 Total Works: {catalog_summary['total_works']}")
    print(f"   🔗 Spotify Linked: {catalog_summary['spotify_linked']}")
    print(f"   📊 Link Coverage: {catalog_summary['link_percentage']:.1f}%")
    print(f"   🆕 Recent Works (30 days): {len(recent_works)}")
    
    # Current Spotify Status
    if spotify_insights:
        profile = spotify_insights.get('profile', {})
        print(f"\n🎧 CURRENT SPOTIFY STATUS:")
        print(f"   👥 Followers: {profile.get('followers', 0):,}")
        print(f"   ⭐ Popularity: {profile.get('popularity', 0)}/100")
        print(f"   🎵 Top Tracks: {len(spotify_insights.get('top_tracks', []))}")
        print(f"   🌍 Active Markets: {len(spotify_insights.get('market_analysis', {}))}")
        
        # Audio profile summary
        audio_profile = spotify_insights.get('audio_profile', {})
        if audio_profile:
            print(f"\n🎵 AUDIO PROFILE:")
            print(f"   🕺 Danceability: {audio_profile.get('avg_danceability', 0):.2f}/1.0")
            print(f"   ⚡ Energy: {audio_profile.get('avg_energy', 0):.2f}/1.0")
            print(f"   😊 Valence: {audio_profile.get('avg_valence', 0):.2f}/1.0")
            print(f"   🎼 Avg Tempo: {audio_profile.get('avg_tempo', 0):.0f} BPM")
    else:
        print(f"\n🎧 SPOTIFY STATUS: No recent data available")
        print("   💡 Run 'python enhanced-spotify-insights.py' to collect Spotify data")
    
    # Growth Analysis
    if not growth_history:
        print(f"\n📊 GROWTH ANALYSIS: No growth data available")
        print("   💡 Run 'python enhanced-spotify-insights.py' to start collecting data")
    else:
        print(f"\n📊 GROWTH ANALYSIS ({len(growth_history)} data points from last 30 days):")
        
        # Latest metrics
        latest = growth_history[-1]
        latest_metrics = latest.get('metrics', {})
        
        print(f"\n📈 LATEST METRICS ({latest['date']}):")
        
        follower_metrics = latest_metrics.get('follower_metrics', {})
        if follower_metrics:
            print(f"   👥 Current Followers: {follower_metrics.get('current_followers', 0):,}")
            print(f"   📊 Weekly Growth: {follower_metrics.get('weekly_growth', 0):+,}")
            print(f"   📈 Growth Rate: {follower_metrics.get('weekly_growth_rate', 0):+.2f}%")
            
            if 'monthly_growth' in follower_metrics:
                print(f"   📊 Monthly Growth: {follower_metrics.get('monthly_growth', 0):+,}")
                print(f"   📈 Monthly Rate: {follower_metrics.get('monthly_growth_rate', 0):+.2f}%")
        
        popularity_metrics = latest_metrics.get('popularity_metrics', {})
        if popularity_metrics:
            print(f"   ⭐ Popularity: {popularity_metrics.get('current_popularity', 0)}/100")
            print(f"   📊 Trend: {popularity_metrics.get('popularity_trend', 'unknown')}")
        
        print(f"   🎯 Visibility Score: {latest_metrics.get('visibility_score', 0):.1f}/100")
    
    # Integration Health Check
    print(f"\n🔗 INTEGRATION STATUS:")
    print(f"   📊 Growth Data: {'✅ Connected' if growth_history else '❌ No Data'}")
    print(f"   📚 Catalog Data: {'✅ Connected' if catalog_summary['total_works'] > 0 else '❌ No Data'}")
    print(f"   🎧 Spotify Data: {'✅ Connected' if spotify_insights else '❌ No Data'}")
    print(f"   🆕 Recent Activity: {'✅ Active' if recent_works else '❌ No Recent Works'}")
    
    # Action Items
    print(f"\n💡 ACTION ITEMS:")
    
    action_items = []
    
    # Catalog linking
    if catalog_summary['link_percentage'] < 100:
        missing_links = catalog_summary['total_works'] - catalog_summary['spotify_linked']
        action_items.append(f"🔗 Link {missing_links} more work(s) to Spotify using spotify-auto-linker.py")
    
    # Growth data
    if not growth_history:
        action_items.append("📊 Start collecting growth data: python enhanced-spotify-insights.py")
    
    # Spotify insights
    if not spotify_insights:
        action_items.append("🎧 Collect current Spotify data: python enhanced-spotify-insights.py")
    
    if not action_items:
        action_items.append("✅ All systems operational - continue monitoring")
    
    for i, item in enumerate(action_items, 1):
        print(f"   {i}. {item}")
    
    print(f"\n✅ Dashboard updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)

def display_quick_stats():
    """Display quick stats summary"""
    catalog_summary = get_catalog_summary()
    spotify_insights = get_latest_spotify_insights()
    
    print(f"🎧 {ARTIST_NAME} - Quick Stats")
    print(f"📚 Works: {catalog_summary['total_works']} ({catalog_summary['spotify_linked']} linked)")
    
    if spotify_insights:
        profile = spotify_insights.get('profile', {})
        print(f"👥 Followers: {profile.get('followers', 0):,}")
        print(f"⭐ Popularity: {profile.get('popularity', 0)}/100")
    else:
        print("🎧 No recent Spotify data - run enhanced-spotify-insights.py")

if __name__ == "__main__":
    # Check if user wants quick stats or full dashboard
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--quick':
        display_quick_stats()
    else:
        display_growth_dashboard()