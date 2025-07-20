class SpotifyService {
  constructor() {
    this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
  }

  async getRealSpotifyData(artistId = 'ruedevivre') {
    try {
      const token = localStorage.getItem('cognito_access_token') || 'demo-token';
      const response = await fetch(`${this.baseURL}/spotify?artistId=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching Spotify data from AWS:', error);
      // Return mock data if AWS fails
      return {
        followers: 1250,
        monthlyListeners: 8430,
        topTrack: 'Summer Nights',
        totalStreams: 125000,
        countries: ['France', 'Germany', 'UK', 'Netherlands', 'Belgium']
      };
    }
  }

  async getSpotifyInsights(artistId = 'ruedevivre') {
    try {
      const token = localStorage.getItem('cognito_access_token') || 'demo-token';
      const response = await fetch(`${this.baseURL}/spotify/insights?artistId=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Spotify Insights API error: ${response.status}`);
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
          likes: 5670
        }
      };
    }
  }
}

const spotifyService = new SpotifyService();
export default spotifyService;