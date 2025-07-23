import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('decodedmusic_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Error parsing stored user:', err);
        localStorage.removeItem('decodedmusic_user');
      }
    }
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      // Mock successful login for demo
      const mockUser = {
        email: email,
        name: email.split('@')[0],
        id: 'mock-user-' + Date.now()
      };

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      localStorage.setItem('decodedmusic_user', JSON.stringify(mockUser));
      setUser(mockUser);
      return mockUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('decodedmusic_user');
    setUser(null);
  };

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };
};