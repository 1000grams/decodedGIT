import React, { useEffect, useState } from 'react';
import { getArtistId } from '../state/ArtistManager.js';
import { runGrowthDashboard } from '../scripts/growth-dashboard-wrapper.js';

export default function AnalyticsPanel({ user }) {
  const artistId = getArtistId();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const output = await runGrowthDashboard([`--artistId=${artistId}`]);
        const data = JSON.parse(output);
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message || 'Error fetching analytics data');
      }
    }

    if (artistId) {
      fetchAnalytics();
    }
  }, [artistId]);

  if (error) {
    return <div>❌ Error: {error}</div>;
  }

  if (!analyticsData) {
    return <div>Loading analytics...</div>;
  }

  return (
    <div>
      <h2>📊 Analytics for {user?.username || 'Guest'}</h2>
      <pre>{JSON.stringify(analyticsData, null, 2)}</pre>
    </div>
  );
}