import React from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';

import LandingPage from './components/LandingPage.js';
import Dashboard from './components/Dashboard.js';
import CognitoLogin from './components/CognitoLogin.js';
import MarketingPanel from './components/MarketingPanel.jsx';
import CatalogPanel from './components/catalog/CatalogPanel.jsx';
import AnalyticsPanel from './components/AnalyticsPanel.jsx';
import SpotifyModule from './components/SpotifyModule.js';
import BuzzPage from './pages/BuzzPage.js';
import ContactForm from './components/ContactForm.jsx';
import About from './pages/About.jsx';
import MarketingHub from './pages/MarketingHub.jsx';

import { useAuth } from './context/AuthContext.js';

import './App.css';

function App() {
  const { isAuthenticated, user, username, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading DecodedMusic...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <nav className="main-nav">
        <Link to="/"><button>Home</button></Link>
        {isAuthenticated && (
          <>
            <Link to="/dashboard"><button>Dashboard</button></Link>
            <Link to="/marketing"><button>Marketing</button></Link>
            <Link to="/catalog"><button>Catalog</button></Link>
            <Link to="/analytics"><button>Analytics</button></Link>
            <Link to="/spotify"><button>Spotify</button></Link>
            <Link to="/buzz"><button>Buzz</button></Link>
            <Link to="/marketing-hub"><button>Marketing Hub</button></Link>
            <button onClick={signOut}>Sign Out</button>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <CognitoLogin />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard user={user} username={username} onSignOut={signOut} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/marketing"
          element={
            isAuthenticated ? <MarketingPanel user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/catalog"
          element={
            isAuthenticated ? <CatalogPanel user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/analytics"
          element={
            isAuthenticated ? <AnalyticsPanel user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/marketing-hub"
          element={
            isAuthenticated ? <MarketingHub user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/spotify"
          element={
            isAuthenticated ? <SpotifyModule user={user} /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/buzz" element={<BuzzPage />} />
        <Route path="/contact" element={<ContactForm />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
