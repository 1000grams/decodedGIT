import React, { useEffect, useState } from 'react';
import { DashboardAPI } from '../api/dashboard.js';
import { getArtistId } from '../state/ArtistManager.js';

function SpotifyModule() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchSpotify() {
      try {
        const artistId = getArtistId();
        const res = await DashboardAPI.getSpotifyData({ artistId });
        setData(res);
      } catch (err) {
        console.error('spotify fetch error', err);
      }
    }
    fetchSpotify();
  }, []);

  if (!data) {
    return (
      <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
        Loading Spotify data...
      </div>
    );
  }

  const name = data.name || data.artist;
  const topTracks = data.top_tracks || data.topTracks || [];
  const recent = data.recentStreams;
  const trendInsights = data.trendInsights;

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>Spotify Profile</h2>
      <div>{name}</div>
      <div>Followers: {data.followers}</div>
      {data.popularity && <div>Popularity: {data.popularity}</div>}
      {data.monthlyListeners && (
        <div>Monthly Listeners: {data.monthlyListeners}</div>
      )}
      {topTracks.length > 0 && (
        <div>
          <h3>Top Tracks</h3>
          <ul>
            {topTracks.map((t, i) => (
              <li key={t.id || i}>
                {t.name}
                {t.plays && ` - ${t.plays} plays`}
              </li>
            ))}
          </ul>
        </div>
      )}
      {recent && (
        <div>
          <h3>Recent Streams</h3>
          <div>Today: {recent.today}</div>
          <div>This Week: {recent.thisWeek}</div>
          <div>This Month: {recent.thisMonth}</div>
        </div>
      )}
      {trendInsights && (
        <div>
          <h3>Trend Insights</h3>
          <div>Market Score: {trendInsights.marketScore}</div>
        </div>
      )}
    </div>
  );
}

export default SpotifyModule;
