import React from 'react';

export default function CatalogPanel({ user }) {
  return (
    <div>
      <h1>Catalog Panel</h1>
      <p>Welcome, {user?.username || user?.name || 'Guest'}!</p>
      <p>Here you can view your catalog data.</p>
    </div>
  );
}