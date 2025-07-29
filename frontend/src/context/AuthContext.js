import React, { createContext, useContext, useEffect, useState } from 'react';
import cognitoAuthService from '../services/CognitoAuthService.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const result = await cognitoAuthService.getCurrentUser();
        if (result && result.success) {
          setUser(result.user);
          setUsername(result.username);
          setIsAuthenticated(true);
        } else if (result.error === 'Session invalid') {
          console.warn('Session expired or invalid. Logging out...');
          await cognitoAuthService.signOut();
          window.location.href = '/login';
        }
      } catch (error) {
        console.error('Error checking authentication status:', error);
      }
      setLoading(false);
    }

    checkAuthStatus();
  }, []);

  const signIn = async (email, password) => {
    const result = await cognitoAuthService.signIn(email, password);
    if (result.success) {
      setUser(result.user);
      setUsername(result.username);
      setIsAuthenticated(true);
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
