import React, { createContext, useContext, useEffect, useState } from 'react';
import cognitoAuthService from '../services/CognitoAuthService.js';
import { getCognitoTokenFromUrl } from '../utils/getCognitoToken.js';
import { setArtistIdFromUser } from '../state/ArtistManager.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthStatus() {
      // Attempt to capture a token from the URL
      const urlToken = getCognitoTokenFromUrl();
      const storedToken = urlToken || localStorage.getItem('cognito_token');

      if (storedToken) {
        try {
          const payload = JSON.parse(atob(storedToken.split('.')[1]));
          setUsername(payload["cognito:username"] || payload.email || '');
        } catch {}
        setUser(storedToken);
        setIsAuthenticated(true);
        await setArtistIdFromUser();
        setLoading(false);
        return;
      }

      try {
        const result = await cognitoAuthService.getCurrentUser();
        if (result && result.success) {
          setUser(result.user);
          setUsername(result.username);
          setIsAuthenticated(true);
          await setArtistIdFromUser();
        } else {
          console.warn('Session expired or invalid. Clearing auth state.');
          await cognitoAuthService.signOut();
          localStorage.clear();
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
        await cognitoAuthService.signOut();
        localStorage.clear();
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    }

    if (!cognitoAuthService.hasCurrentUser()) {
      localStorage.clear();
    }

    checkAuthStatus();

    // Check session validity every 5 minutes instead of 30 seconds
    const interval = setInterval(checkAuthStatus, 300000);
    return () => clearInterval(interval);
  }, []);

  const signIn = async (email, password) => {
    const result = await cognitoAuthService.signIn(email, password);
    if (result.success) {
      setUser(result.user);
      setUsername(result.username);
      setIsAuthenticated(true);
      await setArtistIdFromUser();
    }
    return result;
  };

  const signOut = async () => {
    await cognitoAuthService.signOut();
    localStorage.clear();
    setUser(null);
    setUsername('');
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, username, isAuthenticated, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
