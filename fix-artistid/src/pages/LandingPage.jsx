import React from 'react';
import MusicCatalog from '../../scripts/music-catalog';

const LandingPage = () => {
  React.useEffect(() => {
    // Initialize MusicCatalog
    window.musicCatalog = new MusicCatalog();
  }, []);

  return (
    <div>
      <h1>Welcome to the Music Catalog</h1>
      <div id="catalog-container"></div>
    </div>
  );
};

export default LandingPage;
