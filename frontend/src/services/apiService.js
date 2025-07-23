const API_BASE = process.env.REACT_APP_API_BASE || 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';

const apiService = {
  getDashboardData: async () => {
    const token = localStorage.getItem('cognito_id_token');
    if (!token) {
      throw new Error('No Cognito token found. Please log in.');
    }

    const response = await fetch(`${API_BASE}/api/dashboard`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    return response.json();
  },

  getSpotifyData: async () => {
    const token = localStorage.getItem('cognito_id_token');
    if (!token) {
      throw new Error('No Cognito token found. Please log in.');
    }

    const response = await fetch(`${API_BASE}/api/spotify`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error ${response.status}: ${errorText}`);
    }

    return response.json();
  },
};

export default apiService;