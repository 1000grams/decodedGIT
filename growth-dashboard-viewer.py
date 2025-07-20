import boto3
import json
from datetime import datetime, timedelta
import statistics

# Configuration
DYNAMO_GROWTH_TABLE = 'prod-GrowthMetrics-decodedmusic-backend'
ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'

dynamodb = boto3.resource('dynamodb')

def get_growth_history(days_back=30):
    """Get growth metrics history"""
    try:
        growth_table = dynamodb.Table(DYNAMO_GROWTH_TABLE)
        
        cutoff_date = (datetime.utcnow() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        response = growth_table.query(
            IndexName='ArtistDateIndex',
            KeyConditionExpression='artistId = :aid AND #date > :cutoff',
            ExpressionAttributeNames={'#date': 'date'},
            ExpressionAttributeValues={
                ':aid': ARTIST_ID,
                ':cutoff': cutoff_date
            }
        )
        
        return sorted(response['Items'], key=lambda x: x['date'])
        
    except Exception as e:
        print(f"❌ Error getting growth history: {e}")
        return []

def display_growth_dashboard():
    """Display growth dashboard"""
    print("🎧 RUE DE VIVRE - GROWTH DASHBOARD")
    print("=" * 50)
    
    # Get recent growth data
    growth_history = get_growth_history(days_back=30)
    
    if not growth_history:
        print("❌ No growth data available")
        return
    
    print(f"📊 Analyzing {len(growth_history)} data points from last 30 days")
    
    # Latest metrics
    latest = growth_history[-1]
    latest_metrics = latest.get('metrics', {})
    
    print(f"\n📈 LATEST METRICS ({latest['date']}):")
    
    follower_metrics = latest_metrics.get('follower_metrics', {})
    if follower_metrics:
        print(f"   👥 Current Followers: {follower_metrics.get('current_followers', 0):,}")
        print(f"   📊 Weekly Growth: {follower_metrics.get('weekly_growth', 0):+,}")
        print(f"   📈 Growth Rate: {follower_metrics.get('weekly_growth_rate', 0):+.2f}%")
    
    popularity_metrics = latest_metrics.get('popularity_metrics', {})
    if popularity_metrics:
        print(f"   ⭐ Popularity: {popularity_metrics.get('current_popularity', 0)}/100")
        print(f"   📊 Trend: {popularity_metrics.get('popularity_trend', 'unknown')}")
    
    print(f"   🎯 Visibility Score: {latest_metrics.get('visibility_score', 0):.1f}/100")
    
    # Growth trends over time
    if len(growth_history) >= 3:
        print(f"\n📈 GROWTH TRENDS:")
        
        # Follower growth trend
        follower_counts = []
        visibility_scores = []
        
        for record in growth_history:
            metrics = record.get('metrics', {})
            follower_metrics = metrics.get('follower_metrics', {})
            followers = follower_metrics.get('current_followers', 0)
            if followers > 0:
                follower_counts.append(followers)
            
            visibility = metrics.get('visibility_score', 0)
            if visibility > 0:
                visibility_scores.append(visibility)
        
        if len(follower_counts) >= 2:
            total_growth = follower_counts[-1] - follower_counts[0]
            days_span = len(follower_counts)
            avg_daily_growth = total_growth / days_span
            
            print(f"   📊 Total Growth: {total_growth:+,} followers over {days_span} days")
            print(f"   📊 Average Daily Growth: {avg_daily_growth:+.1f} followers/day")
        
        if len(visibility_scores) >= 2:
            avg_visibility = statistics.mean(visibility_scores)
            print(f"   🎯 Average Visibility Score: {avg_visibility:.1f}/100")
    
    # Market expansion
    market_expansion = latest_metrics.get('market_expansion', {})
    if market_expansion:
        print(f"\n🌍 MARKET PRESENCE:")
        print(f"   📍 Active Markets: {market_expansion.get('current_markets', 0)}")
        if market_expansion.get('new_markets'):
            print(f"   🆕 New Markets: {', '.join(market_expansion['new_markets'])}")
    
    print(f"\n✅ Dashboard updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    display_growth_dashboard()