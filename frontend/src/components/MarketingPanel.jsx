import React from 'react';

export default function MarketingPanel({ user }) {
  return <div>👋 Marketing data for {user?.username || 'Guest'}</div>;
}