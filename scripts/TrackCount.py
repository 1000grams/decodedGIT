# ...existing code...

def get_linked_tracks():
    """Get all tracks with Spotify links from catalog"""
    try:
        catalog_table = dynamodb.Table(DYNAMO_CATALOG_TABLE)
        
        response = catalog_table.scan(
            FilterExpression='artistId = :aid AND attribute_exists(spotifyLink)',
            ExpressionAttributeValues={':aid': CATALOG_ARTIST_ID}
        )
        
        tracks = []
        album_counts = {}
        
        for item in response['Items']:
            spotify_link = item.get('spotifyLink', {})
            if spotify_link.get('trackId'):
                album_name = item.get('albumInfo', {}).get('album', 'Unknown Album')
                album_counts[album_name] = album_counts.get(album_name, 0) + 1
                
                tracks.append({
                    'catalog_id': item['id'],
                    'title': item.get('Title', item.get('title', 'Unknown')),
                    'spotify_id': spotify_link['trackId'],
                    'album_info': item.get('albumInfo', {}),
                    'sync_categories': item.get('syncMetadata', {}).get('syncCategories', [])
                })
        
        print(f"✅ Found {len(tracks)} linked tracks for analysis")
        print(f"📊 Album breakdown:")
        for album, count in album_counts.items():
            print(f"   {album}: {count} tracks")
        
        return tracks
        
    except Exception as e:
        print(f"❌ Error getting linked tracks: {e}")
        return []