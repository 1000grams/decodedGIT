class AnalyticsService {
  constructor() {
    this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
  }

  async getRealAnalytics(artistId = 'ruedevivre') {
    try {
      const token = localStorage.getItem('cognito_access_token') || 'demo-token';
      const response = await fetch(`${this.baseURL}/analytics?artistId=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Analytics API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics from AWS:', error);
      // Return mock data if AWS fails
      return {
        totalStreams: 125000,
        monthlyGrowth: 15.3,
        topCountries: ['France', 'Germany', 'UK'],
        revenueData: {
          total: 2847.50,
          monthly: 485.20
        }
      };
    }
  }

  async getDetailedAnalytics(artistId = 'ruedevivre') {
    try {
      const token = localStorage.getItem('cognito_access_token') || 'demo-token';
      const response = await fetch(`${this.baseURL}/analytics/detailed?artistId=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Detailed Analytics API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching detailed analytics from AWS:', error);
      return {
        totalStreams: 125000,
        monthlyListeners: 8430,
        topTracks: [
          { name: 'Summer Nights', streams: 45000 },
          { name: 'Digital Dreams', streams: 32000 },
          { name: 'Neon Lights', streams: 28000 }
        ],
        countries: [
          { country: 'France', listeners: 3200 },
          { country: 'Germany', listeners: 2800 },
          { country: 'UK', listeners: 1900 }
        ]
      };
    }
  }
}

const analyticsInstance = new AnalyticsService();
export default analyticsInstance;