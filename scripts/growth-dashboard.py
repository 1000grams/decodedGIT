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

# ...existing code...

if __name__ == "__main__":
    # Check if user wants quick stats or full dashboard
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == '--quick':
        display_quick_stats()
    else:
        display_growth_dashboard()
