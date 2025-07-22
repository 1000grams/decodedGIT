import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCognitoTokenFromUrl } from '../utils/getCognitoToken';
import { useAuth } from '../hooks/useAuth';
import './LandingPage.css';

const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const username = user?.username || 'Artist';

  useEffect(() => {
    try {
      getCognitoTokenFromUrl();
    } catch (err) {
      console.error('Token parsing failed:', err);
    }
  }, []);

  useEffect(() => {
    // Google Analytics
    window.dataLayer = window.dataLayer || [];
    function gtag() { window.dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-11CHYW3K6Z');

    // Meta Pixel
    if (!window.fbq) {
      window.fbq = function () {
        window.fbq.callMethod
          ? window.fbq.callMethod.apply(window.fbq, arguments)
          : window.fbq.queue.push(arguments);
      };
      window.fbq.queue = [];
      window.fbq.loaded = true;
      window.fbq.version = '2.0';
      const fbqScript = document.createElement('script');
      fbqScript.async = true;
      fbqScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.getElementsByTagName('head')[0].appendChild(fbqScript);
    }
    window.fbq('init', '727105113056303');
    window.fbq('track', 'PageView');

    // Snap Pixel
    if (!window.snaptr) {
      window.snaptr = function () {
        window.snaptr.handleRequest
          ? window.snaptr.handleRequest.apply(window.snaptr, arguments)
          : window.snaptr.queue.push(arguments);
      };
      window.snaptr.queue = [];
      const snaptrScript = document.createElement('script');
      snaptrScript.async = true;
      snaptrScript.src = 'https://sc-static.net/scevent.min.js';
      document.getElementsByTagName('head')[0].appendChild(snaptrScript);
    }
    window.snaptr('init', '0e29f2de-37c1-4e4f-8274-c4d2f40d4bd7');
    window.snaptr('track', 'PAGE_VIEW');
  }, []);

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="navbar dark-bg green-border">
        <div className="nav-container">
          <div className="logo">
            <img src="/logo.svg" alt="Decoded Music Logo" className="logo-img" />
            <span className="logo-text red-accent">decoded music</span>
          </div>
          <nav className="nav-links">
            <a href="#features" className="green-text">Why Artists Choose Us</a>
            <a href="#pricing" className="green-text">Join the Movement</a>
            <Link to="/buzz" className="green-text">Buzz</Link>
            {isAuthenticated ? (
              <Link to="/dashboard" className="artist-login-btn green-text">Go to Dashboard</Link>
            ) : (
              <Link to="/login" className="artist-login-btn green-text">Artist Login</Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <video autoPlay loop muted playsInline className="hero-video">
          <source src="/p1.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        <div className="hero-overlay">
          <h1 className="hero-title">decoded music</h1>
          <p className="hero-subtitle">empowering artists to own their journey</p>
          <p className="hero-description">
            <strong>We’re artists who broke free from the system.</strong> No more begging playlist curators.
            No more gambling on algorithms. No more gatekeepers deciding your worth.
            <br /><br />
            This is <strong>your platform</strong>. Built by independent artists who understand the grind,
            the late nights, and the dream. Get insights that help you thrive, not just survive.
          </p>
          <div className="hero-cta">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="cta-btn cta-red"
              >
                Welcome Back, {username}
              </Link>
            ) : (
              <Link
                to="/login"
                className="cta-btn cta-red"
              >
                Access Your Artist Dashboard
              </Link>
            )}
            <a
              href="#features"
              className="cta-btn cta-white"
            >
              See What Artists Are Saying
            </a>
            <a
              href="#pricing"
              className="cta-btn cta-outline"
            >
              Join the Movement
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features dark-bg white-text">
        <div className="container">
          <h2 className="section-title green-text">Why Independent Artists Trust Us</h2>
          <p className="section-subtitle">
            We’ve been where you are. We know what it’s like to create amazing music and watch it get buried.
            That’s why we built this.
          </p>

          <div className="features-grid">
            <div className="feature-card card-dark green-border">
              <h3 className="white-text">Real Artist Insights</h3>
              <p>Get insights that actually help you grow your fanbase and income.</p>
            </div>
            <div className="feature-card card-dark green-border">
              <h3 className="white-text">Multiple Revenue Streams</h3>
              <p>Discover sync, brand, fan monetization, and merch opportunities that work for indie artists.</p>
            </div>
            <div className="feature-card card-dark green-border">
              <h3 className="white-text">Viral Potential Tracking</h3>
              <p>Know which tracks are ready for TikTok, Instagram, and YouTube based on real data.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Section */}
      <section id="pricing" className="pricing black-bg white-text">
        <div className="container">
          <h2 className="section-title red-accent">Join the Independent Artist Revolution</h2>
          <p className="section-subtitle">
            Connect with fellow artists who are taking control of their careers.
            Follow our journey and be part of the movement that’s changing the game.
          </p>

          <div className="pricing-cta">
            <a
              href="https://open.spotify.com/playlist/7sU1PGsAAmF5y7bW6tAPsY"
              target="_blank"
              rel="noopener noreferrer"
              className="hoodie-peeps-btn green-bg dark-text"
            >
              Follow Our Artist Journey
            </a>
            <Link
              to="/login"
              className="get-started-btn red-bg white-text"
            >
              Start Your Artist Dashboard
            </Link>
          </div>

          <div className="artist-testimonial">
            <p>"Finally, a platform that gets it. Built by artists who actually understand the struggle." – Independent Artist</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer dark-bg white-text">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <span className="footer-logo green-text">decoded music</span>
              <span className="footer-tagline">created by artists, for artists</span>
            </div>
            <div className="footer-links">
              <a href="/policies.html#privacy" target="_blank" rel="noopener noreferrer">Privacy</a>
              <a href="/policies.html#terms" target="_blank" rel="noopener noreferrer">Terms</a>
              <Link to="/contact">Contact Us</Link>
              <Link to="/about">About</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2025 Decoded Music. empowering independent artists worldwide.</p>
            <p className="footer-motto">By artist, for artists.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
