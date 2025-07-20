import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authorized, setAuthorized] = useState(false);
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

export { AuthContext };
