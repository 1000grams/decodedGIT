import React, { useEffect, useState } from 'react';

const API_BASE =
  process.env.REACT_APP_API_URL ||
  'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';

export default function MarketingPanel({ user }) {
  const [buzz, setBuzz] = useState('');

  useEffect(() => {
    fetch(`${API_BASE}/industry_buzz.txt`)
      .then(async (res) => {
        if (!res.ok) {
          return '';
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('text')) {
          // Likely an HTML fallback page – don't display it
          return '';
        }
        return await res.text();
      })
      .then((text) => setBuzz(text.trim()))
      .catch(() => {
        // ignore fetch errors in local development
      });
  }, []);

  return (
    <div>
      <p>👋 Marketing data for {user?.username || 'Guest'}</p>
      {buzz && <pre style={{ whiteSpace: 'pre-wrap' }}>{buzz}</pre>}
    </div>
  );
}
