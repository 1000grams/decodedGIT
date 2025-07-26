import React from 'react';
import PageLayout from '../layouts/PageLayout.js';
import PitchSubmissionForm from '../components/catalog/PitchSubmissionForm.jsx';

function PitchPage() {
  return (
    <PageLayout>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1rem' }}>Submit a Pitch</h1>
        <PitchSubmissionForm />
      </div>
    </PageLayout>
  );
}

export default PitchPage;
