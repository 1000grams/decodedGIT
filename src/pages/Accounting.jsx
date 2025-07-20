import React, { useEffect, useState } from 'react';
import { DashboardAPI } from '../api/dashboard';

const API_BASE = process.env.REACT_APP_API_BASE || '/api/dashboard';

function Accounting() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    async function fetchAccounting() {
      try {
        const data = await DashboardAPI.getAccounting({ artistId: 'RueDeVivre' });
        setSummary(data);
      } catch (err) {
        console.error('fetch accounting error', err);
      }
    }
    fetchAccounting();
  }, []);

  const downloadCsv = () => {
    window.location.href = `${API_BASE}/accounting/export?artist_id=RueDeVivre`;
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Accounting</h1>
      <div style={{ margin: '1rem 0' }}>
        <button
          onClick={downloadCsv}
          style={{ padding: '0.5rem 1rem', background: '#32C1ED', color: '#fff', border: 'none', borderRadius: 4 }}>
          Download CSV
        </button>
      </div>
      <div style={{ border: '1px solid #ccc', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {summary ? (
          <div>
            <div>Total Revenue: ${(summary.totalRevenue / 100).toFixed(2)}</div>
            <div>Total Expenses: ${(summary.totalExpenses / 100).toFixed(2)}</div>
            <div>Net Revenue: ${(summary.netRevenue / 100).toFixed(2)}</div>
          </div>
        ) : (
          <svg width="300" height="150">
            <rect x="10" y="50" width="40" height="80" fill="#32C1ED" />
            <rect x="70" y="30" width="40" height="100" fill="#32C1ED" />
            <rect x="130" y="70" width="40" height="60" fill="#32C1ED" />
          </svg>
        )}
      </div>
    </div>
  );
}

export default Accounting;
