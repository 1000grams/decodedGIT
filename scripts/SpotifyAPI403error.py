# ...existing code...

def get_spotify_token():
    """Get Spotify access token"""
    import base64
    
    auth_url = 'https://accounts.spotify.com/api/token'
    credentials = f"{SPOTIFY_CLIENT_ID}:{SPOTIFY_CLIENT_SECRET}"
    credentials_b64 = base64.b64encode(credentials.encode()).decode()
    
    headers = {
        'Authorization': f'Basic {credentials_b64}',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    
    data = {'grant_type': 'client_credentials'}
    
    try:
        response = requests.post(auth_url, headers=headers, data=data)
        print(f"🔐 Spotify auth response: {response.status_code}")
        if response.status_code == 200:
            token = response.json().get('access_token')
            print(f"✅ Got Spotify token: {token[:20]}...")
            return token
        else:
            print(f"❌ Spotify auth failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Spotify auth error: {e}")
        return None

def get_audio_features(spotify_token, track_ids):
    """Get audio features for multiple tracks"""
    headers = {'Authorization': f'Bearer {spotify_token}'}
    
    print(f"🎵 Requesting features for {len(track_ids)} tracks")
    
    # Test with one track first
    if track_ids:
        test_response = requests.get(
            f"https://api.spotify.com/v1/audio-features/{track_ids[0]}",
            headers=headers
        )
        print(f"🧪 Test request status: {test_response.status_code}")
        if test_response.status_code != 200:
            print(f"❌ Test request failed: {test_response.text}")
            return []
    
    # Spotify API allows up to 100 tracks per request
    all_features = []
    
    for i in range(0, len(track_ids), 100):
        batch = track_ids[i:i+100]
        ids_string = ','.join(batch)
        
        try:
            response = requests.get(
                f"https://api.spotify.com/v1/audio-features?ids={ids_string}",
                headers=headers
            )
            
            print(f"📊 Batch {i//100 + 1} status: {response.status_code}")
            
            if response.status_code == 200:
                features = response.json().get('audio_features', [])
                valid_features = [f for f in features if f]  # Filter out None values
                all_features.extend(valid_features)
                print(f"   ✅ Got {len(valid_features)} valid features")
            else:
                print(f"   ❌ Error: {response.text}")
                
        except Exception as e:
            print(f"   ⚠️ Error in batch request: {e}")
    
    return all_features