import React, { useEffect, useState } from 'react';
import { getArtistData } from '../state/ArtistManager';

const AnalyticsPanel = () => {
  const [artistData, setArtistData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const artistId = 'defaultArtistId'; // Replace with dynamic logic
        const data = await getArtistData(artistId);
        setArtistData(data);
      } catch (error) {
        console.error('Error fetching artist data:', error);
        setError('Error fetching artist data');
      } finally {
        setLoading(false);
      }
    };

    fetchArtistData();
  }, []);

  if (loading) {
    return <div>Loading artist data...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Analytics Panel</h1>
      <p>Artist Streams: {artistData.streams}</p>
      <p>Artist Revenue: {artistData.revenue}</p>
      {/* Add more analytics details here */}
    </div>
  );
};

export default AnalyticsPanel;
