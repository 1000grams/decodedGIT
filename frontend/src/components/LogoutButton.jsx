import React from 'react';

const LogoutButton = () => {
  const clientId = "5pb29tja8gkqm3jb43oimd5qjt";
  const logoutUri = "https://decodedmusic.com/buzz";

  const handleLogout = () => {
    window.location.href = `https://auth.decodedmusic.com/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  return (
    <button onClick={handleLogout} className="logout-button">
      Logout
    </button>
  );
};

export default LogoutButton;
