import { useEffect } from 'react';

// Add this to your dashboard component to debug Spotify loading

class SpotifyDebugger {
    static async debugSpotifyLoading() {
        console.log('🎵 Debugging Spotify Loading...');
        
        // 1. Check if user is authenticated
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('❌ No access token found in localStorage');
            return false;
        }
        
        console.log('✅ Access token found');
        
        // 2. Test API endpoint
        try {
            const response = await fetch('/api/dashboard/spotify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(`📡 Spotify API response status: ${response.status}`);
            
            if (response.ok) {
                const data = await response.json();
                console.log('✅ Spotify data loaded successfully');
                console.log('📊 Data keys:', Object.keys(data));
                return data;
            } else {
                const errorText = await response.text();
                console.error('❌ Spotify API failed:', errorText);
                
                // Check for specific error types
                if (response.status === 401) {
                    console.error('🔐 Authentication error - token may be expired');
                } else if (response.status === 403) {
                    console.error('🚫 Permission error - check Spotify scopes');
                } else if (response.status === 500) {
                    console.error('🔥 Server error - check Lambda logs');
                }
                
                return false;
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            return false;
        }
    }
    
    static async testCognitoSpotifyConnection() {
        console.log('🔑 Testing Cognito-Spotify connection...');
        
        try {
            // Get user info from Cognito
            const userResponse = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            
            if (userResponse.ok) {
                const userData = await userResponse.json();
                console.log('✅ User profile loaded');
                console.log('🎵 Spotify connected:', userData.spotifyConnected || false);
                
                if (!userData.spotifyConnected) {
                    console.warn('⚠️  User has not connected Spotify account');
                    return false;
                }
                
                return true;
            } else {
                console.error('❌ Failed to load user profile');
                return false;
            }
        } catch (error) {
            console.error('❌ Cognito connection test failed:', error);
            return false;
        }
    }
}

// Add to your dashboard component
export default function ArtistDashboard() {
    useEffect(() => {
        // Add Spotify debugging
        SpotifyDebugger.debugSpotifyLoading();
        SpotifyDebugger.testCognitoSpotifyConnection();
    }, []);
    
    // Rest of your component...
}