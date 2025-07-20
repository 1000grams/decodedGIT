# Add after get_growth_history function

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
    """Get latest Spotify insights data"""
    try:
        insights_table = dynamodb.Table('prod-SpotifyInsights-decodedmusic-backend')
        
        response = insights_table.query(
            IndexName='ArtistTimestampIndex',
            KeyConditionExpression='artistId = :aid',
            ExpressionAttributeValues={':aid': SPOTIFY_ARTIST_ID},
            ScanIndexForward=False,
            Limit=1
        )
        
        if response['Items']:
            return response['Items'][0].get('data', {})
        return {}
        
    except Exception as e:
        print(f"❌ Error getting Spotify insights: {e}")
        return {}