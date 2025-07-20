const API_BASE = process.env.REACT_APP_API_URL || 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';

function getToken() {
  return localStorage.getItem('cognito_id_token') || localStorage.getItem('spotify_token');
}

async function fetchWithAuth(url, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : '',
    'Content-Type': 'application/json',
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
      `${process.env.REACT_APP_DASHBOARD_ACCOUNTING}?artistId=${artistId}`,
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
    fetchWithAuth(`${API_BASE}/analytics`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getCampaigns: (payload) =>
    fetchWithAuth(`${API_BASE}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getTeam: (payload) =>
    fetchWithAuth(`${API_BASE}/team`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getStreams: (payload) =>
    fetchWithAuth(`${API_BASE}/streams`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getStatements: (payload) =>
    fetchWithAuth(`${API_BASE}/statements`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSpotifyData: (payload) =>
    fetchWithAuth(`${API_BASE}/spotify`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
