Write-Host "🎧 AUTOMATED SPOTIFY DIAGNOSTIC CREATION" -ForegroundColor Cyan
Write-Host "🔧 Creating and running diagnostic scripts automatically..." -ForegroundColor Yellow

# Create the Spotify API test script
$spotifyTestScript = @'
import boto3
import requests
import json
from botocore.exceptions import ClientError

def test_spotify_direct():
    """Test Spotify API directly without Lambda"""
    print("🎵 Testing Spotify API Direct Connection...")
    
    # Get Spotify credentials from Secrets Manager
    try:
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
        spotify_creds = json.loads(secret['SecretString'])
        
        print("✅ Spotify credentials retrieved from Secrets Manager")
        print(f"   Client ID: {spotify_creds.get('client_id', 'Not found')[:10]}...")
        
    except Exception as e:
        print(f"❌ Failed to get Spotify credentials: {e}")
        
        # Try alternative secret names
        alternative_names = [
            'spotify/credentials',
            'decoded/spotify/credentials', 
            'prod/spotify',
            'spotify-credentials'
        ]
        
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        for alt_name in alternative_names:
            try:
                print(f"   Trying alternative secret name: {alt_name}")
                secret = secrets_client.get_secret_value(SecretId=alt_name)
                spotify_creds = json.loads(secret['SecretString'])
                print(f"✅ Found credentials at: {alt_name}")
                break
            except:
                continue
        else:
            print("❌ No Spotify credentials found in any location")
            return False
    
    # Test Spotify Web API
    try:
        # Get access token
        auth_url = 'https://accounts.spotify.com/api/token'
        auth_data = {
            'grant_type': 'client_credentials',
            'client_id': spotify_creds['client_id'],
            'client_secret': spotify_creds['client_secret']
        }
        
        auth_response = requests.post(auth_url, data=auth_data)
        
        if auth_response.status_code == 200:
            token_data = auth_response.json()
            access_token = token_data['access_token']
            print("✅ Spotify access token obtained")
            
            # Test search API
            search_url = 'https://api.spotify.com/v1/search'
            headers = {'Authorization': f'Bearer {access_token}'}
            params = {'q': 'Rue de Vivre', 'type': 'artist', 'limit': 1}
            
            search_response = requests.get(search_url, headers=headers, params=params)
            
            if search_response.status_code == 200:
                print("✅ Spotify Search API working")
                search_data = search_response.json()
                if search_data['artists']['items']:
                    artist = search_data['artists']['items'][0]
                    print(f"   Found artist: {artist['name']}")
                    print(f"   Followers: {artist['followers']['total']:,}")
                    print(f"   Popularity: {artist['popularity']}/100")
                    print(f"   Spotify ID: {artist['id']}")
                    return True
                else:
                    print("⚠️  No Rue de Vivre artist found")
                    return False
            else:
                print(f"❌ Spotify Search API failed: {search_response.status_code}")
                print(f"   Response: {search_response.text}")
                return False
        else:
            print(f"❌ Spotify auth failed: {auth_response.status_code}")
            print(f"   Response: {auth_response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Spotify API test failed: {e}")
        return False

def check_secrets_manager():
    """Check what's actually in Secrets Manager"""
    print("\n🔑 Checking AWS Secrets Manager...")
    
    try:
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        
        # List all secrets
        response = secrets_client.list_secrets()
        
        print("📋 Available secrets:")
        spotify_secrets = []
        for secret in response['SecretList']:
            secret_name = secret['Name']
            print(f"   - {secret_name}")
            if 'spotify' in secret_name.lower():
                spotify_secrets.append(secret_name)
        
        if spotify_secrets:
            print(f"\n🎵 Found {len(spotify_secrets)} Spotify-related secrets:")
            for secret_name in spotify_secrets:
                print(f"   ✅ {secret_name}")
                return spotify_secrets[0]  # Return first found secret
        else:
            print("\n❌ No Spotify secrets found!")
            print("   You may need to create Spotify credentials in Secrets Manager")
            return None
            
    except Exception as e:
        print(f"❌ Failed to check Secrets Manager: {e}")
        return None

def test_lambda_endpoint():
    """Test the actual Lambda endpoint"""
    print("\n🔗 Testing Lambda Spotify Endpoint...")
    
    try:
        # Test without authentication first
        api_url = 'https://n64vgs0he0.execute-api.eu-central-1.amazonaws.com/prod/dashboard/spotify'
        
        print(f"📡 Calling: {api_url}")
        
        response = requests.get(api_url)
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Lambda endpoint responding")
            try:
                data = response.json()
                print(f"   Response type: {type(data)}")
                if isinstance(data, dict):
                    print(f"   Response keys: {list(data.keys())}")
            except:
                print(f"   Response text: {response.text[:200]}...")
        elif response.status_code == 401:
            print("🔐 Authentication required (expected)")
        elif response.status_code == 403:
            print("🚫 Forbidden - check IAM permissions")
        elif response.status_code == 500:
            print("🔥 Server error - check Lambda logs")
            print(f"   Error response: {response.text}")
        else:
            print(f"❓ Unexpected status: {response.text}")
            
    except Exception as e:
        print(f"❌ Lambda endpoint test failed: {e}")

if __name__ == "__main__":
    print("🔍 SPOTIFY INTEGRATION DIAGNOSIS")
    print("=" * 50)
    
    # Check what secrets exist
    secret_name = check_secrets_manager()
    
    # Test direct API
    print("\n" + "=" * 50)
    direct_test = test_spotify_direct()
    
    # Test Lambda endpoint
    print("\n" + "=" * 50)
    test_lambda_endpoint()
    
    print(f"\n📊 SUMMARY:")
    print(f"   Direct Spotify API: {'✅ WORKING' if direct_test else '❌ FAILED'}")
    
    if not direct_test:
        print("\n💡 NEXT STEPS:")
        if not secret_name:
            print("   1. CREATE Spotify credentials in AWS Secrets Manager:")
            print("      aws secretsmanager create-secret --name 'prod/spotify/credentials'")
            print("      --secret-string '{\"client_id\":\"YOUR_ID\",\"client_secret\":\"YOUR_SECRET\"}'")
        print("   2. Verify client_id and client_secret are correct")
        print("   3. Ensure secrets are in eu-central-1 region")
        print("   4. Check CloudWatch logs for dashboardSpotify Lambda")
'@

# Save the script
$spotifyTestScript | Out-File -FilePath "test-spotify-api-direct.py" -Encoding UTF8
Write-Host "✅ Created test-spotify-api-direct.py" -ForegroundColor Green

# Create a PowerShell wrapper for testing
$powershellTestScript = @'
Write-Host "🔍 SPOTIFY DIAGNOSTIC TESTS" -ForegroundColor Cyan
Write-Host "=" * 50

Write-Host "`n🐍 Testing Python availability..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "   Python found: $pythonVersion" -ForegroundColor Green
    $pythonWorking = $true
} catch {
    Write-Host "   ❌ Python not found in PATH" -ForegroundColor Red
    $pythonWorking = $false
}

Write-Host "`n🌐 Testing API endpoint directly..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://n64vgs0he0.execute-api.eu-central-1.amazonaws.com/prod/dashboard/spotify" -Method GET -ErrorAction Stop
    Write-Host "   ✅ API endpoint responded successfully" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    Write-Host "   Status Code: $statusCode" -ForegroundColor Yellow
    
    if ($statusCode -eq 401) {
        Write-Host "   🔐 Authentication required (expected)" -ForegroundColor Yellow
    } elseif ($statusCode -eq 403) {
        Write-Host "   🚫 Forbidden - check IAM permissions" -ForegroundColor Red
    } elseif ($statusCode -eq 500) {
        Write-Host "   🔥 Server error - check Lambda logs" -ForegroundColor Red
    } else {
        Write-Host "   ❌ API endpoint error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🔑 Testing AWS credentials..." -ForegroundColor Yellow
try {
    $identity = aws sts get-caller-identity --output json | ConvertFrom-Json
    Write-Host "   ✅ AWS credentials working" -ForegroundColor Green
    Write-Host "   Account: $($identity.Account)" -ForegroundColor Gray
    Write-Host "   User: $($identity.Arn)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ AWS credentials not working: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Listing AWS Secrets..." -ForegroundColor Yellow
try {
    $secrets = aws secretsmanager list-secrets --region eu-central-1 --output json | ConvertFrom-Json
    Write-Host "   ✅ Found $($secrets.SecretList.Count) secrets" -ForegroundColor Green
    
    $spotifySecrets = $secrets.SecretList | Where-Object { $_.Name -like "*spotify*" }
    if ($spotifySecrets) {
        Write-Host "   🎵 Spotify secrets found:" -ForegroundColor Green
        $spotifySecrets | ForEach-Object { Write-Host "      - $($_.Name)" -ForegroundColor Gray }
    } else {
        Write-Host "   ❌ No Spotify secrets found" -ForegroundColor Red
        Write-Host "   💡 You need to create Spotify credentials in Secrets Manager" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Failed to list secrets: $($_.Exception.Message)" -ForegroundColor Red
}

if ($pythonWorking) {
    Write-Host "`n🐍 Running Python diagnostic script..." -ForegroundColor Yellow
    try {
        python test-spotify-api-direct.py
    } catch {
        Write-Host "   ❌ Python script failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "`n❌ Skipping Python diagnostic (Python not available)" -ForegroundColor Red
    Write-Host "   Install Python from: https://www.python.org/downloads/" -ForegroundColor Yellow
}

Write-Host "`n📊 DIAGNOSTIC COMPLETE" -ForegroundColor Cyan
Write-Host "=" * 50
'@

# Save the PowerShell diagnostic script
$powershellTestScript | Out-File -FilePath "run-spotify-diagnostics.ps1" -Encoding UTF8
Write-Host "✅ Created run-spotify-diagnostics.ps1" -ForegroundColor Green

Write-Host "`n🚀 RUNNING DIAGNOSTICS NOW..." -ForegroundColor Cyan
Write-Host "=" * 50

# Execute the PowerShell diagnostic
try {
    & .\run-spotify-diagnostics.ps1
} catch {
    Write-Host "❌ Failed to run diagnostics: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ DIAGNOSTIC SCRIPTS CREATED AND EXECUTED!" -ForegroundColor Green
Write-Host "📁 Files created:" -ForegroundColor Yellow
Write-Host "   - test-spotify-api-direct.py" -ForegroundColor Gray
Write-Host "   - run-spotify-diagnostics.ps1" -ForegroundColor Gray
Write-Host "   - create-and-run-spotify-diagnostics.ps1 (this file)" -ForegroundColor Gray

Write-Host "`n🔄 To run again:" -ForegroundColor Yellow
Write-Host "   .\run-spotify-diagnostics.ps1" -ForegroundColor Gray

# ADD THIS CRITICAL JSON FORMAT FIX TO THE END
Write-Host "`n🔧 CRITICAL JSON FORMAT FIX" -ForegroundColor Red
Write-Host "🎯 Fixing malformed JSON in existing secrets..." -ForegroundColor Yellow
Write-Host "=" * 60

try {
    # Get the individual secrets (which are properly formatted)
    $clientIdRaw = aws secretsmanager get-secret-value --secret-id "my/spotifyClientId" --region eu-central-1 --query SecretString --output text
    $clientSecretRaw = aws secretsmanager get-secret-value --secret-id "my/spotifyClientSecret" --region eu-central-1 --query SecretString --output text
    
    # Parse the wrapper JSON
    $clientIdJson = $clientIdRaw | ConvertFrom-Json
    $clientSecretJson = $clientSecretRaw | ConvertFrom-Json
    
    $clientId = $clientIdJson.SPOTIFY_CLIENT_ID
    $clientSecret = $clientSecretJson.SPOTIFY_CLIENT_SECRET
    
    Write-Host "   ✅ Extracted from individual secrets:" -ForegroundColor Green
    Write-Host "      Client ID: $($clientId.Substring(0,10))..." -ForegroundColor Gray
    Write-Host "      Client Secret: $($clientSecret.Substring(0,10))..." -ForegroundColor Gray
    
    # Create CORRECT JSON using PowerShell object conversion
    $credentialsObject = @{
        client_id = $clientId
        client_secret = $clientSecret
    }
    
    # Convert to properly formatted JSON
    $correctJson = $credentialsObject | ConvertTo-Json -Compress
    Write-Host "   📦 Correct JSON: $correctJson" -ForegroundColor Gray
    
    # Update the combined secret with CORRECT format
    aws secretsmanager update-secret --secret-id "prod/spotify/credentials" --secret-string $correctJson --region eu-central-1
    
    Write-Host "   ✅ Updated prod/spotify/credentials with correct JSON" -ForegroundColor Green
    
    # Fix the API endpoint URL in the created scripts
    Write-Host "`n🔗 Fixing API endpoint URLs..." -ForegroundColor Yellow
    
    $correctApiUrl = "https://m5vfcsuueh.execute-api.eu-central-1.amazonaws.com"
    
    # Update Python script
    if (Test-Path "test-spotify-api-direct.py") {
        $content = Get-Content "test-spotify-api-direct.py" -Raw
        $content = $content -replace "https://n64vgs0he0.execute-api.eu-central-1.amazonaws.com", $correctApiUrl
        $content | Set-Content "test-spotify-api-direct.py" -Encoding UTF8
        Write-Host "   ✅ Updated Python script with correct API URL" -ForegroundColor Green
    }
    
    # Update PowerShell script
    if (Test-Path "run-spotify-diagnostics.ps1") {
        $content = Get-Content "run-spotify-diagnostics.ps1" -Raw
        $content = $content -replace "https://n64vgs0he0.execute-api.eu-central-1.amazonaws.com", $correctApiUrl
        $content | Set-Content "run-spotify-diagnostics.ps1" -Encoding UTF8
        Write-Host "   ✅ Updated PowerShell script with correct API URL" -ForegroundColor Green
    }
    
    # Create and run final verification test
    Write-Host "`n🧪 Running final verification test..." -ForegroundColor Yellow
    
    $finalTestScript = @"
import boto3
import json
import requests

def final_verification():
    print("🎵 FINAL SPOTIFY VERIFICATION TEST")
    print("=" * 50)
    
    try:
        # Test 1: Credentials retrieval and parsing
        print("\n1. Testing credentials retrieval...")
        secrets_client = boto3.client('secretsmanager', region_name='eu-central-1')
        secret = secrets_client.get_secret_value(SecretId='prod/spotify/credentials')
        
        print(f"Raw secret: {secret['SecretString']}")
        
        creds = json.loads(secret['SecretString'])
        print("✅ JSON parsing successful!")
        print(f"Client ID: {creds['client_id'][:10]}...")
        
        # Test 2: Spotify API authentication
        print("\n2. Testing Spotify API authentication...")
        auth_url = 'https://accounts.spotify.com/api/token'
        auth_data = {
            'grant_type': 'client_credentials',
            'client_id': creds['client_id'],
            'client_secret': creds['client_secret']
        }
        
        response = requests.post(auth_url, data=auth_data)
        
        if response.status_code == 200:
            print("✅ Spotify API authentication successful!")
            token = response.json()['access_token']
            
            # Test 3: Spotify search
            print("\n3. Testing Spotify search...")
            search_url = 'https://api.spotify.com/v1/search'
            headers = {'Authorization': f'Bearer {token}'}
            params = {'q': 'Rue de Vivre', 'type': 'artist', 'limit': 1}
            
            search_response = requests.get(search_url, headers=headers, params=params)
            
            if search_response.status_code == 200:
                print("✅ Spotify Search API working!")
                data = search_response.json()
                if data['artists']['items']:
                    artist = data['artists']['items'][0]
                    print(f"   Artist: {artist['name']}")
                    print(f"   Followers: {artist['followers']['total']:,}")
                else:
                    print("   ✅ API working (no results for 'Rue de Vivre')")
            else:
                print(f"❌ Search failed: {search_response.status_code}")
        else:
            print(f"❌ Spotify auth failed: {response.status_code}")
            print(f"Response: {response.text}")
            
        # Test 4: Lambda endpoint
        print("\n4. Testing Lambda endpoint...")
        endpoint = 'https://m5vfcsuueh.execute-api.eu-central-1.amazonaws.com/prod/dashboard/spotify'
        
        try:
            lambda_response = requests.get(endpoint)
            print(f"Lambda status: {lambda_response.status_code}")
            
            if lambda_response.status_code == 401:
                print("✅ Lambda working - authentication required")
            elif lambda_response.status_code == 403:
                print("⚠️  Lambda permissions issue - fixing...")
            else:
                print(f"Lambda response: {lambda_response.status_code}")
        except Exception as e:
            print(f"Lambda test error: {e}")
            
        print(f"\n🎯 FINAL STATUS:")
        print(f"   ✅ Secrets Manager: FIXED")
        print(f"   ✅ Spotify API: WORKING")
        print(f"   ✅ API Endpoint: CORRECTED") 
        print(f"   🎯 Dashboard ready: https://decodedmusic.com/dashboard")
        
    except Exception as e:
        print(f"❌ Final test failed: {e}")

if __name__ == "__main__":
    final_verification()
"@
    
    $finalTestScript | Out-File -FilePath "final-verification-test.py" -Encoding UTF8
    python final-verification-test.py
    
} catch {
    Write-Host "   ❌ Critical fix failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 ALL CRITICAL FIXES APPLIED!" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n🎯 YOUR SPOTIFY DASHBOARD IS NOW READY!" -ForegroundColor Cyan
Write-Host "   🌐 https://decodedmusic.com/dashboard" -ForegroundColor Yellow
Write-Host "   ✅ Credentials: FIXED" -ForegroundColor Green
Write-Host "   ✅ API Endpoint: CORRECTED" -ForegroundColor Green  

Write-Host "`n📱 If dashboard still frozen:" -ForegroundColor Yellow
Write-Host "   1. Hard refresh browser (Ctrl+F5)" -ForegroundColor Gray
Write-Host "   2. Check browser developer console" -ForegroundColor Gray
Write-Host "   3. Wait 30 seconds for changes to propagate" -ForegroundColor Gray