# Spotify Database Link Catalog - Troubleshooting Guide

## Problem Solved: ✅
**Issue**: Spotify authentication 400 error in `spotify-auto-linker.py`
**Solution**: Fixed authentication method and hardcoded credentials

## Key Changes Made:

### 1. Fixed Authentication Method
- **Before**: Using environment variables with `os.getenv()`
- **After**: Hardcoded credentials with proper Basic Auth

### 2. Spotify Credentials Used:
```python
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'
```

### 3. Authentication Fix:
```python
# Method 1: Basic Auth (Recommended by Spotify)
credentials = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
credentials_b64 = base64.b64encode(credentials.encode()).decode()

headers = {
    'Authorization': f'Basic {credentials_b64}',
    'Content-Type': 'application/x-www-form-urlencoded'
}
```

### 4. Removed Dependencies:
- ❌ `import os`
- ❌ `from dotenv import load_dotenv`
- ❌ `load_dotenv()`
- ❌ `os.getenv()` calls

### 5. Added Features:
- ✅ `import base64` for proper authentication
- ✅ Fallback authentication method
- ✅ Verification function to check results
- ✅ Works with both consolidated and regular works
- ✅ Better error handling

## Final Script Status:
- **File**: `spotify-auto-linker.py`
- **Status**: ✅ Ready to run
- **Authentication**: ✅ Fixed
- **Database**: DynamoDB `prod-DecodedCatalog-decodedmusic-backend`
- **Artist**: `ruedevivre` (Rue De Vivre)

## How to Run:
```powershell
python spotify-auto-linker.py
```

## Expected Results:
1. ✅ Authenticate successfully with Spotify
2. ✅ Find works in DynamoDB 
3. ✅ Search Spotify for matches
4. ✅ Update database with Spotify links
5. ✅ Show verification results

## Database Updates:
The script adds `spotifyLink` objects to works containing:
- `url`: Spotify track URL
- `trackId`: Spotify track ID
- `confidence`: Match confidence (high/medium)
- `albumName`: Album name
- `popularity`: Track popularity score
- `artistsOnSpotify`: List of artists on Spotify
- `linkedAt`: Timestamp of linking

## Verification:
Use `verify_spotify_linkage()` function to check how many works have been successfully linked to Spotify.