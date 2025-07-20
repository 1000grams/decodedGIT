import boto3
from botocore.exceptions import ClientError

def create_insights_table():
    """Create DynamoDB table for storing Spotify insights"""
    dynamodb = boto3.resource('dynamodb')
    
    table_name = 'prod-SpotifyInsights-decodedmusic-backend'
    
    try:
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {
                    'AttributeName': 'id',
                    'KeyType': 'HASH'
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'id',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'artistId',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'timestamp',
                    'AttributeType': 'S'
                }
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'ArtistTimestampIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'artistId',
                            'KeyType': 'HASH'
                        },
                        {
                            'AttributeName': 'timestamp',
                            'KeyType': 'RANGE'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    }
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        print(f"✅ Creating table {table_name}...")
        table.wait_until_exists()
        print(f"✅ Table {table_name} created successfully!")
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print(f"✅ Table {table_name} already exists")
            
            # Try to add the missing index
            try:
                dynamodb_client = boto3.client('dynamodb')
                dynamodb_client.update_table(
                    TableName=table_name,
                    AttributeDefinitions=[
                        {
                            'AttributeName': 'artistId',
                            'AttributeType': 'S'
                        },
                        {
                            'AttributeName': 'timestamp',
                            'AttributeType': 'S'
                        }
                    ],
                    GlobalSecondaryIndexUpdates=[
                        {
                            'Create': {
                                'IndexName': 'ArtistTimestampIndex',
                                'KeySchema': [
                                    {
                                        'AttributeName': 'artistId',
                                        'KeyType': 'HASH'
                                    },
                                    {
                                        'AttributeName': 'timestamp',
                                        'KeyType': 'RANGE'
                                    }
                                ],
                                'Projection': {
                                    'ProjectionType': 'ALL'
                                }
                            }
                        }
                    ]
                )
                print(f"✅ Added missing ArtistTimestampIndex to existing table")
            except ClientError as update_error:
                if 'already exists' in str(update_error):
                    print(f"✅ ArtistTimestampIndex already exists")
                else:
                    print(f"❌ Error adding index: {update_error}")
        else:
            print(f"❌ Error creating table: {e}")

def create_growth_metrics_table():
    """Create table for tracking growth metrics over time"""
    dynamodb = boto3.resource('dynamodb')
    
    table_name = 'prod-GrowthMetrics-decodedmusic-backend'
    
    try:
        table = dynamodb.create_table(
            TableName=table_name,
            KeySchema=[
                {
                    'AttributeName': 'metricId',
                    'KeyType': 'HASH'
                }
            ],
            AttributeDefinitions=[
                {
                    'AttributeName': 'metricId',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'artistId',
                    'AttributeType': 'S'
                },
                {
                    'AttributeName': 'date',
                    'AttributeType': 'S'
                }
            ],
            GlobalSecondaryIndexes=[
                {
                    'IndexName': 'ArtistDateIndex',
                    'KeySchema': [
                        {
                            'AttributeName': 'artistId',
                            'KeyType': 'HASH'
                        },
                        {
                            'AttributeName': 'date',
                            'KeyType': 'RANGE'
                        }
                    ],
                    'Projection': {
                        'ProjectionType': 'ALL'
                    }
                }
            ],
            BillingMode='PAY_PER_REQUEST'
        )
        
        print(f"✅ Creating growth metrics table {table_name}...")
        table.wait_until_exists()
        print(f"✅ Growth metrics table created successfully!")
        
    except ClientError as e:
        if e.response['Error']['Code'] == 'ResourceInUseException':
            print(f"✅ Growth metrics table {table_name} already exists")
        else:
            print(f"❌ Error creating growth metrics table: {e}")

if __name__ == "__main__":
    create_insights_table()
    create_growth_metrics_table()