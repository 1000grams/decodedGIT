import React, { useEffect, useState } from 'react';
import { getArtistData } from '../state/ArtistManager';

const CatalogPanel = () => {
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
      <h1>Catalog Panel</h1>
      <p>Artist Name: {artistData.name}</p>
      <p>Artist Albums: {artistData.albums.join(', ')}</p>
      {/* Add more artist details here */}
    </div>
  );
};

export default CatalogPanel;
