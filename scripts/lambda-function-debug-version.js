// Enhanced version of your Spotify Lambda with detailed logging

const AWS = require('aws-sdk');

exports.handler = async (event) => {
    console.log('🎵 Spotify Dashboard Lambda - DEBUG VERSION');
    console.log('📥 Event:', JSON.stringify(event, null, 2));
    
    const headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    };

    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    try {
        // 1. Validate authentication
        console.log('🔐 Checking authentication...');
        const authHeader = event.headers.Authorization || event.headers.authorization;
        
        if (!authHeader) {
            console.error('❌ No Authorization header found');
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ 
                    error: 'No authorization header',
                    debug: 'Missing Authorization header in request'
                })
            };
        }
        
        console.log('✅ Authorization header present');
        
        // 2. Get Spotify credentials
        console.log('🔑 Getting Spotify credentials...');
        const secretsManager = new AWS.SecretsManager({ region: 'eu-central-1' });
        
        let spotifyCredentials;
        try {
            const secret = await secretsManager.getSecretValue({ 
                SecretId: 'prod/spotify/credentials' 
            }).promise();
            spotifyCredentials = JSON.parse(secret.SecretString);
            console.log('✅ Spotify credentials retrieved');
        } catch (error) {
            console.error('❌ Failed to get Spotify credentials:', error);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Failed to get Spotify credentials',
                    debug: error.message
                })
            };
        }
        
        // 3. Get Spotify access token
        console.log('🎵 Getting Spotify access token...');
        const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `grant_type=client_credentials&client_id=${spotifyCredentials.client_id}&client_secret=${spotifyCredentials.client_secret}`
        });
        
        if (!tokenResponse.ok) {
            console.error('❌ Spotify token request failed:', tokenResponse.status);
            const errorText = await tokenResponse.text();
            console.error('   Error details:', errorText);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Spotify authentication failed',
                    debug: `Token request failed: ${tokenResponse.status}`
                })
            };
        }
        
        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        console.log('✅ Spotify access token obtained');
        
        // 4. Search for Rue de Vivre
        console.log('🔍 Searching for Rue de Vivre...');
        const searchResponse = await fetch(
            'https://api.spotify.com/v1/search?q=Rue%20de%20Vivre&type=artist&limit=1',
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        if (!searchResponse.ok) {
            console.error('❌ Spotify search failed:', searchResponse.status);
            const errorText = await searchResponse.text();
            console.error('   Error details:', errorText);
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Spotify search failed',
                    debug: `Search request failed: ${searchResponse.status}`
                })
            };
        }
        
        const searchData = await searchResponse.json();
        console.log('✅ Spotify search completed');
        
        if (!searchData.artists?.items?.length) {
            console.warn('⚠️  No Rue de Vivre artist found on Spotify');
            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({ 
                    success: true,
                    data: { 
                        artist_found: false,
                        message: 'Rue de Vivre artist not found on Spotify'
                    }
                })
            };
        }
        
        const artist = searchData.artists.items[0];
        console.log(`✅ Found artist: ${artist.name} (${artist.followers.total} followers)`);
        
        // 5. Get top tracks
        console.log('🎵 Getting top tracks...');
        const topTracksResponse = await fetch(
            `https://api.spotify.com/v1/artists/${artist.id}/top-tracks?market=US`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            }
        );
        
        let topTracks = [];
        if (topTracksResponse.ok) {
            const topTracksData = await topTracksResponse.json();
            topTracks = topTracksData.tracks || [];
            console.log(`✅ Found ${topTracks.length} top tracks`);
        } else {
            console.warn('⚠️  Failed to get top tracks');
        }
        
        // 6. Prepare response
        const responseData = {
            success: true,
            data: {
                artist: {
                    id: artist.id,
                    name: artist.name,
                    followers: artist.followers.total,
                    popularity: artist.popularity,
                    genres: artist.genres,
                    images: artist.images,
                    external_urls: artist.external_urls
                },
                top_tracks: topTracks.map(track => ({
                    id: track.id,
                    name: track.name,
                    popularity: track.popularity,
                    preview_url: track.preview_url,
                    duration_ms: track.duration_ms
                })),
                debug_info: {
                    timestamp: new Date().toISOString(),
                    spotify_api_working: true,
                    artist_found: true,
                    tracks_count: topTracks.length
                }
            }
        };
        
        console.log('✅ Spotify dashboard data prepared successfully');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(responseData)
        };
        
    } catch (error) {
        console.error('❌ Spotify dashboard error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                success: false,
                error: error.message,
                debug: {
                    stack: error.stack,
                    timestamp: new Date().toISOString()
                }
            })
        };
    }
};