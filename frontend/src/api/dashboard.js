const API_BASE = process.env.REACT_APP_API_BASE || 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';

function getToken() {
  return localStorage.getItem('cognito_token') || localStorage.getItem('spotify_token');
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
    const token = window.localStorage.getItem('cognito_token');
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

  postSocial: (payload) =>
    fetchWithAuth(`${API_BASE}/social`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getSpotifyData: ({ artistId }) => {
    const base =
      process.env.REACT_APP_ENHANCED_SPOTIFY_API_URL || `${API_BASE}/spotify`;
    const url = `${base}?artist_id=${encodeURIComponent(artistId)}`;
    return fetchWithAuth(url);
  },

  getMarketingAutomation: () =>
    fetchWithAuth(`${API_BASE}/marketing-automation/subscription/report`),

  sendEmailCampaign: (payload) =>
    fetchWithAuth(`${API_BASE}/marketing-automation/email`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  upsertFanSegment: (payload) =>
    fetchWithAuth(`${API_BASE}/marketing-automation/segments`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  listFanSegments: ({ artistId }) =>
    fetchWithAuth(
      `${API_BASE}/marketing-automation/segments?artist_id=${encodeURIComponent(artistId)}`
    ),

  getDeepMarketingAnalytics: () =>
    fetchWithAuth(`${API_BASE}/marketing-automation/analytics/deep`),
};
