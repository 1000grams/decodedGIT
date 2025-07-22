import React, { useEffect, useState } from 'react';
import { DashboardAPI } from '../api/dashboard.js';

function SpotifyModule() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchSpotify() {
      try {
        const res = await DashboardAPI.getSpotifyData({ artistId: 'RueDeVivre' });
        setData(res);
      } catch (err) {
        console.error('spotify fetch error', err);
      }
    }
    fetchSpotify();
  }, []);

  if (!data) {
    return <div style={{ border: '1px solid #ccc', padding: '1rem' }}>Loading Spotify data...</div>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem' }}>
      <h2>Spotify Profile</h2>
      <div>{data.name}</div>
      <div>Followers: {data.followers}</div>
      <div>Popularity: {data.popularity}</div>
      {Array.isArray(data.top_tracks) && (
        <div>
          <h3>Top Tracks</h3>
          <ul>
            {data.top_tracks.map(t => (
              <li key={t.id}>{t.name}</li>
            ))}
          </ul>
        </div>
      )}
      {Array.isArray(data.trending) && (
        <div>
          <h3>Trending</h3>
          <ul>
            {data.trending.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SpotifyModule;
