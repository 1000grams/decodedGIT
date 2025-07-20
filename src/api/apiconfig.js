const API_BASE = process.env.REACT_APP_API_URL || 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';

const API_ENDPOINTS = {
  AUTH_BASE: 'https://y1zthsd7l0.execute-api.eu-central-1.amazonaws.com/prod',
  DASHBOARD_BASE: API_BASE,
  ARTIST_MANAGER_BASE: 'https://0930nh8tai.execute-api.eu-central-1.amazonaws.com/prod/artistmanager',
  TABLES: {
    CATALOG: 'prod-DecodedCatalog-decodedmusic-backend',
    SPOTIFY_INSIGHTS: 'prod-SpotifyInsights-decodedmusic-backend',
    USERS: 'prod-decodedmusic-users',
    SUBSCRIPTIONS: 'prod-decodedmusic-subscriptions',
  },
  ENDPOINTS: {
    login: '/auth/login',
    signup: '/auth/signup',
    subscription: '/subscription',
  },
};

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

function getToken() {
  return localStorage.getItem('cognito_id_token') || localStorage.getItem('spotify_token');
}

async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = {
    ...DEFAULT_HEADERS,
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
  };
  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return await res.json();
}

export const DashboardAPI = {
  getAccounting: async ({ artistId }) => {
    const token = window.localStorage.getItem('cognito_id_token');
    const res = await fetch(
      `${API_ENDPOINTS.DASHBOARD_BASE}/accounting?artistId=${artistId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (!res.ok) throw new Error('Failed to fetch accounting');
    return res.json();
  },

  getAnalytics: (payload) =>
    fetchWithAuth(`${API_ENDPOINTS.DASHBOARD_BASE}/analytics`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  setArtistId: async (artistId) => {
    return await fetchWithAuth(`${API_ENDPOINTS.ARTIST_MANAGER_BASE}/setArtistId`, {
      method: 'POST',
      body: JSON.stringify({ artistId }),
    });
  },

  getArtistData: async (artistId) => {
    return await fetchWithAuth(`${API_ENDPOINTS.ARTIST_MANAGER_BASE}/getArtistData?artistId=${artistId}`);
  },

  checkBackendHealth: async () => {
    const endpoints = [
      { name: 'Set Artist ID API', url: `${API_ENDPOINTS.ARTIST_MANAGER_BASE}/setArtistId` },
      { name: 'Get Artist Data API', url: `${API_ENDPOINTS.ARTIST_MANAGER_BASE}/getArtistData` },
    ];

    const results = [];
    for (const endpoint of endpoints) {
      try {
        await fetchWithAuth(endpoint.url);
        results.push({ name: endpoint.name, status: 'online' });
      } catch (error) {
        results.push({ name: endpoint.name, status: 'offline', error: error.message });
      }
    }
    return results;
  },
};

export const DynamoDBAPI = {
  getArtistPortfolio: async (artistId) => {
    const token = localStorage.getItem('cognito_id_token');
    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/artist/portfolio`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ artistId }),
    });
    return await response.json();
  },

  getTrackAnalytics: async (artistId) => {
    const token = localStorage.getItem('cognito_id_token');
    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/track/analytics`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ artistId }),
    });
    return await response.json();
  },

  getAIRecommendations: async (artistId) => {
    const token = localStorage.getItem('cognito_id_token');
    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/artist/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ artistId }),
    });
    return await response.json();
  },

  updateArtistData: async (artistId, data) => {
    const token = localStorage.getItem('cognito_id_token');
    const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/artist/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ artistId, data }),
    });
    return await response.json();
  },
};
