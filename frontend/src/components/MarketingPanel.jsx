import React, { useEffect, useState } from 'react';

export default function MarketingPanel({ user }) {
  const [buzz, setBuzz] = useState('');

  useEffect(() => {
    fetch('/industry_buzz.txt')
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
