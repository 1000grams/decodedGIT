import React from 'react';
import PageLayout from '../layouts/PageLayout.js';

function Admin() {
  return (
    <PageLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Admin Panel</h1>
        <p>Internal usage stats will appear here.</p>
      </div>
    </PageLayout>
  );
}

export default Admin;
