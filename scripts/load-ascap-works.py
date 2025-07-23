import boto3
import csv
import uuid
import json
from datetime import datetime
from botocore.exceptions import ClientError

# --- Configuration ---
S3_BUCKET = 'artist-rdv'
CSV_KEY = 'WorksCatalog.csv'
DYNAMO_TABLE = 'prod-DecodedCatalog-decodedmusic-backend'
ARTIST_ID = 'ruedevivre'  # Unique ID for Rue De Vivre (Avril Hue)
ARTIST_PUBLIC_NAME = 'Rue De Vivre'
ARTIST_LEGAL_NAME = 'Avril Hue'

# --- AWS Clients ---
s3 = boto3.client('s3')
dynamodb = boto3.resource('dynamodb')

def verify_s3_bucket():
    """Verify S3 bucket exists and is accessible"""
    print(f"🔍 Verifying S3 bucket: {S3_BUCKET}")
    try:
        s3.head_bucket(Bucket=S3_BUCKET)
        print(f"✅ S3 bucket '{S3_BUCKET}' exists and is accessible")
        return True
    except ClientError as e:
        print(f"❌ S3 bucket error: {e}")
        return False

def verify_csv_file():
    """Verify CSV file exists in S3 bucket"""
    print(f"🔍 Verifying CSV file: {CSV_KEY}")
    try:
        s3.head_object(Bucket=S3_BUCKET, Key=CSV_KEY)
        print(f"✅ CSV file '{CSV_KEY}' found in bucket")
        return True
    except ClientError as e:
        print(f"❌ CSV file error: {e}")
        return False

def verify_dynamodb_table():
    """Verify DynamoDB table exists and is accessible"""
    print(f"🔍 Verifying DynamoDB table: {DYNAMO_TABLE}")
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        table.load()
        print(f"✅ DynamoDB table '{DYNAMO_TABLE}' exists")
        print(f"   Table status: {table.table_status}")
        print(f"   Item count: {table.item_count}")
        return table
    except ClientError as e:
        print(f"❌ DynamoDB table error: {e}")
        return None

def preview_csv_data():
    """Preview the first few rows of CSV data"""
    print(f"🔍 Previewing CSV data from {CSV_KEY}")
    try:
        obj = s3.get_object(Bucket=S3_BUCKET, Key=CSV_KEY)
        lines = obj['Body'].read().decode('utf-8').splitlines()
        reader = csv.DictReader(lines)
        
        print("📋 CSV Headers:")
        headers = reader.fieldnames
        for i, header in enumerate(headers, 1):
            print(f"   {i}. {header}")
        
        print("\n📋 Sample data (first 3 rows):")
        sample_count = 0
        for row in reader:
            if sample_count >= 3:
                break
            print(f"   Row {sample_count + 1}: {dict(row)}")
            sample_count += 1
            
        return headers, sample_count
    except Exception as e:
        print(f"❌ Error previewing CSV: {e}")
        return None, 0

def create_artist_record():
    """Create or update artist record in DynamoDB"""
    print(f"🎤 Creating/updating artist record for {ARTIST_PUBLIC_NAME}")
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        artist_item = {
            'id': ARTIST_ID,
            'type': 'artist',
            'publicName': ARTIST_PUBLIC_NAME,
            'legalName': ARTIST_LEGAL_NAME,
            'ascapMember': True,
            'createdAt': datetime.utcnow().isoformat(),
            'updatedAt': datetime.utcnow().isoformat(),
            's3Bucket': S3_BUCKET,
            'worksSource': 'ASCAP'
        }
        
        table.put_item(Item=artist_item)
        print(f"✅ Artist record created/updated for {ARTIST_PUBLIC_NAME}")
        return True
    except Exception as e:
        print(f"❌ Error creating artist record: {e}")
        return False

def load_works_to_dynamodb():
    """Load ASCAP works from CSV to DynamoDB"""
    print(f"📥 Loading ASCAP works to DynamoDB...")
    
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        
        # Download and parse CSV
        obj = s3.get_object(Bucket=S3_BUCKET, Key=CSV_KEY)
        lines = obj['Body'].read().decode('utf-8').splitlines()
        reader = csv.DictReader(lines)
        
        works_loaded = 0
        errors = 0
        
        for row in reader:
            try:
                # Create work item
                work_item = {
                    'id': str(uuid.uuid4()),
                    'type': 'work',
                    'artistId': ARTIST_ID,
                    'artistName': ARTIST_PUBLIC_NAME,
                    'source': 'ASCAP',
                    'createdAt': datetime.utcnow().isoformat(),
                    'updatedAt': datetime.utcnow().isoformat(),
                }
                
                # Add all CSV fields
                for key, value in row.items():
                    if value and value.strip():  # Only add non-empty values
                        work_item[key.replace(' ', '_').replace('-', '_')] = value.strip()
                
                # Put item in DynamoDB
                table.put_item(Item=work_item)
                works_loaded += 1
                
                if works_loaded % 10 == 0:
                    print(f"   Loaded {works_loaded} works...")
                    
            except Exception as e:
                print(f"⚠️  Error loading row: {e}")
                errors += 1
                continue
        
        print(f"✅ Successfully loaded {works_loaded} works")
        if errors > 0:
            print(f"⚠️  {errors} errors occurred during loading")
            
        return works_loaded, errors
        
    except Exception as e:
        print(f"❌ Error loading works: {e}")
        return 0, 1

def verify_artist_linkage():
    """Verify that works are properly linked to artist"""
    print(f"🔗 Verifying artist linkage for {ARTIST_ID}")
    try:
        table = dynamodb.Table(DYNAMO_TABLE)
        
        # Query works for this artist
        response = table.scan(
            FilterExpression='artistId = :aid',
            ExpressionAttributeValues={':aid': ARTIST_ID}
        )
        
        work_count = len(response['Items'])
        print(f"✅ Found {work_count} works linked to {ARTIST_PUBLIC_NAME}")
        
        # Show sample work
        if work_count > 0:
            sample_work = response['Items'][0]
            print(f"📋 Sample work: {sample_work.get('Title', 'N/A')} (ID: {sample_work['id']})")
        
        return work_count
        
    except Exception as e:
        print(f"❌ Error verifying linkage: {e}")
        return 0

def main():
    """Main execution function"""
    print("🚀 ASCAP Works Loader for Rue De Vivre (Avril Hue)")
    print("=" * 50)
    
    # Step 1: Verify S3 setup
    if not verify_s3_bucket():
        return
    
    if not verify_csv_file():
        return
    
    # Step 2: Verify DynamoDB
    table = verify_dynamodb_table()
    if not table:
        return
    
    # Step 3: Preview data
    headers, row_count = preview_csv_data()
    if not headers:
        return
    
    # Step 4: Confirm before loading
    print(f"\n🎯 Ready to load ASCAP works:")
    print(f"   Artist: {ARTIST_PUBLIC_NAME} ({ARTIST_LEGAL_NAME})")
    print(f"   Artist ID: {ARTIST_ID}")
    print(f"   Source: S3://{S3_BUCKET}/{CSV_KEY}")
    print(f"   Target: DynamoDB table '{DYNAMO_TABLE}'")
    
    confirm = input("\nProceed with loading? (y/N): ").lower().strip()
    if confirm != 'y':
        print("❌ Operation cancelled")
        return
    
    # Step 5: Create artist record
    if not create_artist_record():
        return
    
    # Step 6: Load works
    works_loaded, errors = load_works_to_dynamodb()
    if works_loaded == 0:
        return
    
    # Step 7: Verify linkage
    linked_count = verify_artist_linkage()
    
    print("\n" + "=" * 50)
    print("✅ ASCAP Works Loading Complete!")
    print(f"   Works loaded: {works_loaded}")
    print(f"   Errors: {errors}")
    print(f"   Artist: {ARTIST_PUBLIC_NAME} (ID: {ARTIST_ID})")
    print(f"   Linked works: {linked_count}")

if __name__ == "__main__":
    main()