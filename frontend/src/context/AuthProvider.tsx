import React, { createContext, useContext, useState, useEffect } from 'react';

// Create context
const AuthContext = createContext(null);

// Custom hook for consuming
export const useAuth = () => useContext(AuthContext);

// API call to check group membership
const checkArtistGroup = async (email) => {
  try {
    const res = await fetch("https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/auth/groupcheck", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    return data.authorized === true;
  } catch (err) {
    console.error("❌ Failed to check artist group:", err);
    return false;
  }
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);        // Basic user info
  const [authorized, setAuthorized] = useState(false); // Artist group check
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        checkArtistGroup(parsed.email).then(setAuthorized);
      }
    } catch (error) {
      console.error("Error retrieving user from localStorage:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (userObj) => {
    localStorage.setItem("user", JSON.stringify(userObj));
    setUser(userObj);
    checkArtistGroup(userObj.email).then(setAuthorized);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setAuthorized(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authorized, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
