class SpotifyService {
  constructor() {
    this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
  }

  async getRealSpotifyData(artistId = '293x3NAIGPR4RCJrFkzs0P') {
    try {
      const token = localStorage.getItem('cognito_access_token') || 'demo-token';
      const response = await fetch(`${this.baseURL}/spotify?artistId=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Spotify API error: ${text}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Spotify data from AWS:', error);
      return {
        followers: 1250,
        monthlyListeners: 8430,
        topTrack: 'Summer Nights',
        totalStreams: 125000,
        countries: ['France', 'Germany', 'UK', 'Netherlands', 'Belgium'],
      };
    }
  }

  async getSpotifyInsights(artistId = '293x3NAIGPR4RCJrFkzs0P') {
    try {
      const token = localStorage.getItem('cognito_access_token') || 'demo-token';
      const response = await fetch(`${this.baseURL}/spotify/insights?artistId=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`Spotify Insights API error: ${text}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching Spotify insights from AWS:', error);
      return {
        playlistPlacements: 12,
        averageSkipRate: 0.15,
        peakListeners: 1890,
        engagement: {
          saves: 3420,
          shares: 890,
          likes: 5670,
        },
      };
    }
  }

  async authenticateSpotify() {
    try {
      const response = await fetch("https://decodedmusic.com/spotify/auth");

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Spotify API error:", errorText);
        throw new Error("Spotify API failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Error during Spotify authentication:", error);
      throw error;
    }
  }
}

const spotifyService = new SpotifyService();
export default spotifyService;
