import React from 'react';

const CatalogPanel = ({ user }) => {
  return (
    <div>
      <h1>Catalog Panel</h1>
      <p>Welcome, {user ? user.name : 'Guest'}!</p>
      <p>Here you can view your catalog data.</p>
    </div>
  );
};

export default CatalogPanel;
