import React from 'react';
import PageLayout from '../layouts/PageLayout.js';
import logo from '../assets/logo.png'; // Adjust path if needed

const industryBuzzSummary = `This Week’s Industry Buzz: Summer Solstice

1. Regulatory Crosshairs on Mega-Deals
The music world’s consolidation spree hit a speed bump as EU regulators opened a formal probe into Universal Music Group’s proposed $775 million acquisition of Downtown Music. With competition watchdogs scrutinizing potential market dominance, labels and indie publishers alike are watching closely—this high-stakes decision could redefine global publishing power dynamics.

2. Electronic Empire Builders
Los Angeles-based Create Music Group flexed its sync muscles, dropping $50 million to scoop up the Monstercat catalog and beef up its electronic music arsenal. With over 8,000 new tracks now under CMG’s umbrella, the label is positioning itself as a go-to source for advertisers, filmmakers, and game studios hungry for cutting-edge beats.

3. Sync Summit’s Star Moment
Hollywood’s East West Studios buzzed with energy as Sync Summit LA brought together over 100 panels and thought-leaders from music supervision, advertising, and media. From headline keynotes to intimate roundtables, the conference underscored sync licensing’s ascendance—brands and creatives left armed with fresh strategies for placing music on screens worldwide.

4. Legal Heat Rises
A flurry of lawsuits signaled that rights enforcement is front and center. SoundExchange sued Sonos and Napster for $3.3 million in alleged unpaid streaming royalties, while Eight Mile Style (Eminem’s publisher) targeted Meta platforms for unlicensed use of 243 tracks—demanding $150,000 per infringement. Even indie creators threw down against AI platforms, filing class-actions against Suno and Udio for sampling without clearance. The message is clear: if you use it, you pay for it.

5. Indie Labels Forge Power Partnerships
In the indie corner, Durham’s own Merge Records inked a landmark deal, selling half its stake to Secretly Group. Retaining creative autonomy while tapping into broader distribution networks, Merge proves that independent labels can scale without losing their soul—Superchunk’s upcoming release marks the first chapter in this new partnership.

6. Artist Autonomy on the Rise
From Glaive’s high-profile exit from Interscope to a wave of contract renegotiations, artists are reclaiming control. Moves toward independence and master-ownership are accelerating, reflecting a broader shift: today’s acts demand both creative freedom and long-term revenue security.

Whether through blockbuster acquisitions, sync strategy sessions, or courtroom showdowns, this week’s headlines underscore a vibrant—and often volatile—music business. As labels and artists navigate regulatory hurdles, legal battlegrounds, and ever-evolving tech landscapes, one thing remains certain: in 2025, music’s movers and shakers are writing the playbook in real time.`;

function BuzzPage() {
  return (
    <PageLayout>
      <section style={{ background: 'linear-gradient(135deg, #111827 0%, #1e293b 100%)', color: '#fff', padding: '2rem 0 1rem 0', borderBottom: '2px solid #2563eb', boxShadow: '0 8px 32px #0004' }}>
        <div style={{ maxWidth: '44rem', margin: '0 auto', textAlign: 'center' }}>
          <img src={logo} alt="Decoded Logo" style={{ width: 100, marginBottom: 24, filter: 'drop-shadow(0 2px 12px #2563eb88)' }} />
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, marginBottom: 16, letterSpacing: '0.01em', textShadow: '0 4px 32px #2563eb55, 0 2px 0 #fff2' }}>
            Welcome to <span style={{ color: '#2563eb', textShadow: '0 2px 16px #2563eb99' }}>DECODED</span> — the no-fluff, all-fire tunnel from “I dropped a record” to “Yo, that’s on the playlist!”
          </h1>
          <p style={{ fontSize: '1.35rem', marginBottom: 16, color: '#e0e7ef', fontWeight: 500 }}>
            Every episode of DECODED breaks down what makes tracks go viral, why certain artists blow up, and how <span style={{ color: '#fff', fontWeight: 700 }}>YOU</span> can position your music to be heard, streamed, and remembered. We spotlight rising stars, dissect sync licensing wins, analyze trends in Afrobeat, Reggae, Pop, and Hip-Hop, and show how the game is really played—from algorithm to audience.
          </p>
          <div style={{ fontSize: '1.15rem', margin: '1.5rem 0', textAlign: 'left', display: 'inline-block', background: '#222b3a', borderRadius: 12, padding: '1.2rem 2rem', boxShadow: '0 2px 12px #2563eb33' }}>
            <span role="img" aria-label="headphones">🎧</span> <b>Featuring:</b>
            <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0, textAlign: 'left', color: '#e0e7ef' }}>
              <li>Exclusive interviews with artists & producers</li>
              <li>Deep dives on Spotify, TikTok, and YouTube strategies</li>
              <li>Sync placement</li>
            </ul>
          </div>
          <p style={{ fontSize: '1.15rem', marginBottom: 12, color: '#e0e7ef' }}>
            If you’re an artist, manager, or label exec looking to crack the code, subscribe and stay locked in.
          </p>
          <p style={{ fontSize: '1.15rem', color: '#60a5fa', marginBottom: 0, fontWeight: 600 }}>
            📲 Follow and Connect on <a href="https://discord.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', textDecoration: 'underline', fontWeight: 700 }}>discord</a>
          </p>
        </div>
      </section>
      <section style={{ background: 'linear-gradient(135deg, #1e293b 0%, #111827 100%)', color: '#fff', padding: '2.5rem 0' }}>
        <div style={{ maxWidth: '44rem', margin: '0 auto' }}>
          <header style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#2563eb', letterSpacing: '0.01em', textShadow: '0 2px 16px #2563eb99' }}>This Week’s Industry Buzz <span style={{ fontWeight: 400, color: '#9CA3AF' }}>[Summer Solstice]</span></h2>
            <p style={{ fontSize: '1.15rem', color: '#93c5fd', marginBottom: 0, fontWeight: 500 }}>Curated by Decoded’s Music Management Researcher</p>
          </header>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '1.25rem', background: '#222b3a', color: '#e0e7ef', padding: '2rem', borderRadius: 16, lineHeight: 1.8, boxShadow: '0 2px 16px #2563eb22', fontFamily: 'Georgia, serif', fontWeight: 500 }}>{industryBuzzSummary}</pre>
        </div>
      </section>
    </PageLayout>
  );
}

export default BuzzPage;
