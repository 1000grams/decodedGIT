import React, { useState } from 'react';
import SuggestionTile from '../components/SuggestionTile.jsx';
import { FaChartPie, FaBullhorn, FaCalendarAlt, FaFire } from 'react-icons/fa';

function MarketingHub() {
  const [contentPlan] = useState(null); // Removed 'setContentPlan' as it is unused

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)',
        fontFamily: "Georgia, 'Times New Roman', Times, serif",
        color: '#fff',
        padding: '0',
      }}
    >
      <section
        style={{
          padding: '4rem 0 2rem 0',
          textAlign: 'center',
          background: 'linear-gradient(120deg, #1e293b 60%, #2563eb 100%)',
          boxShadow: '0 8px 32px #0002',
        }}
      >
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 900,
            letterSpacing: '0.01em',
            marginBottom: 24,
            color: '#fff',
            textShadow: '0 4px 32px #2563eb55, 0 2px 0 #fff2',
          }}
        >
          Marketing Hub
        </h1>
        <p
          style={{
            fontSize: '1.3rem',
            color: '#e0e7ef',
            maxWidth: 700,
            margin: '0 auto 2.5rem auto',
            fontWeight: 500,
          }}
        >
          All your campaign data, tools, and insights—decoded for growth.
        </p>
      </section>
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '2rem',
          margin: '3rem 0 2rem 0',
        }}
      >
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            boxShadow: '0 8px 32px #0002',
            padding: '2rem 1.5rem',
            minWidth: 220,
            maxWidth: 260,
            flex: '1 1 220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            border: '1.5px solid #e0e7ef',
            position: 'relative',
          }}
        >
          <h2 style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>Ad Spend Summary</h2>
          <p style={{ color: '#222', fontSize: '1rem' }}>Track every dollar, maximize every campaign.</p>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            boxShadow: '0 8px 32px #0002',
            padding: '2rem 1.5rem',
            minWidth: 220,
            maxWidth: 260,
            flex: '1 1 220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            border: '1.5px solid #e0e7ef',
            position: 'relative',
          }}
        >
          <h2 style={{ color: '#1db954', fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>ROI & Attribution</h2>
          <p style={{ color: '#222', fontSize: '1rem' }}>See what works, prove your impact, scale your reach.</p>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            boxShadow: '0 8px 32px #0002',
            padding: '2rem 1.5rem',
            minWidth: 220,
            maxWidth: 260,
            flex: '1 1 220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            border: '1.5px solid #e0e7ef',
            position: 'relative',
          }}
        >
          <h2 style={{ color: '#2563eb', fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>Post Scheduler</h2>
          <p style={{ color: '#222', fontSize: '1rem' }}>Plan, automate, and optimize your content calendar.</p>
        </div>
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: 24,
            boxShadow: '0 8px 32px #0002',
            padding: '2rem 1.5rem',
            minWidth: 220,
            maxWidth: 260,
            flex: '1 1 220px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            border: '1.5px solid #e0e7ef',
            position: 'relative',
          }}
        >
          <h2 style={{ color: '#1db954', fontWeight: 700, fontSize: '1.2rem', marginBottom: 8 }}>Trending-Based Auto-Reposts</h2>
          <p style={{ color: '#222', fontSize: '1rem' }}>Ride the wave—automatically boost what’s hot.</p>
        </div>
      </section>
      <div style={{ display: 'flex', gap: '1.2rem', margin: '2.5rem 0 0 0', flexWrap: 'wrap', justifyContent: 'center' }}>
        <SuggestionTile icon={<FaChartPie />}>
          Unified campaign analytics
        </SuggestionTile>
        <SuggestionTile icon={<FaBullhorn />}>
          Multi-channel marketing
        </SuggestionTile>
        <SuggestionTile icon={<FaCalendarAlt />}>
          Automated scheduling
        </SuggestionTile>
        <SuggestionTile icon={<FaFire />}>
          Real-time trend insights
        </SuggestionTile>
      </div>
    </div>
  );
}

export default MarketingHub;
