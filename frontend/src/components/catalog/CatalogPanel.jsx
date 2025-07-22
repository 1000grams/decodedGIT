import React from 'react';

export default function CatalogPanel({ user }) {
  return <div>📚 Catalog items for {user?.username || 'Guest'}</div>;
}