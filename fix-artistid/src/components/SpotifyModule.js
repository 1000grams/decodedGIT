import React, { useEffect, useState } from 'react';
import { getArtistData } from '../state/ArtistManager';

const SpotifyModule = () => {
  const [artistData, setArtistData] = useState(null);

  useEffect(() => {
    const fetchArtistData = async () => {
      try {
        const artistId = 'defaultArtistId'; // Replace with dynamic logic
        const data = await getArtistData(artistId);
        setArtistData(data);
      } catch (error) {
        console.error('Error fetching artist data:', error);
      }
    };

    fetchArtistData();
  }, []);

  if (!artistData) {
    return <div>Loading artist data...</div>;
  }

  return (
    <div>
      <h1>Spotify Module</h1>
      <p>Artist Playlists: {artistData.playlists.join(', ')}</p>
      {/* Add more Spotify-related details here */}
    </div>
  );
};

export default SpotifyModule;
