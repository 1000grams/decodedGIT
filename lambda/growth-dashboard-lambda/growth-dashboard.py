import boto3
import json
from datetime import datetime, timedelta
import statistics
import sys

# Configuration - Updated for consistency
DYNAMO_GROWTH_TABLE = 'prod-GrowthMetrics-decodedmusic-backend'
DYNAMO_INSIGHTS_TABLE = 'prod-SpotifyInsights-decodedmusic-backend'
DYNAMO_CATALOG_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
SPOTIFY_ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'  # Spotify Artist ID
CATALOG_ARTIST_ID = 'ruedevivre'  # Programmatic identifier for DynamoDB queries
ARTIST_NAME = 'Rue De Vivre'  # Display name for UI and logs

dynamodb = boto3.resource('dynamodb')

def get_growth_history(artist_id, days_back=30):
    """Get growth metrics history for a specific artist"""
    try:
        growth_table = dynamodb.Table(DYNAMO_GROWTH_TABLE)
        
        cutoff_date = (datetime.utcnow() - timedelta(days=days_back)).strftime('%Y-%m-%d')
        
        response = growth_table.query(
            IndexName='ArtistDateIndex',
            KeyConditionExpression='artistId = :aid AND #date > :cutoff',
            ExpressionAttributeNames={'#date': 'date'},
            ExpressionAttributeValues={
                ':aid': artist_id,  # Use the dynamic artist_id
                ':cutoff': cutoff_date
            }
        )
        
        return sorted(response['Items'], key=lambda x: x['date'])
        
    except Exception as e:
        print(f"❌ Error getting growth history: {e}")
        return []

def run(artist_id):
    # Replace with your actual analytics logic
    result = {
        "artistId": artist_id,
        "streams": 1732,
        "subscribers": 258,
        "growthRate": "7.2%"
    }
    return result

if __name__ == "__main__":
    artist_id = None
    for arg in sys.argv:
        if arg.startswith("--artistId="):
            artist_id = arg.split("=")[1]

    if artist_id:
        print(json.dumps(run(artist_id)))
    else:
        print(json.dumps({"error": "Missing artistId"}))
        sys.exit(1)
