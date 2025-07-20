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
        else:
            print(f"❌ Error creating table: {e}")

if __name__ == "__main__":
    create_insights_table()