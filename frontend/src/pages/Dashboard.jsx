import React, { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton.jsx';

const Dashboard = () => {
  const [token, setToken] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);

  useEffect(() => {
    // Step 1: Parse token from URL hash
    const hash = window.location.hash;
    const idToken = new URLSearchParams(hash.substring(1)).get('id_token');

    if (idToken) {
      localStorage.setItem('cognito_id_token', idToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      setToken(idToken);
    } else {
      const stored = localStorage.getItem('cognito_id_token');
      if (stored) setToken(stored);
    }
  }, []);

  useEffect(() => {
    if (token) {
      // Step 2: Use token to call secured backend (e.g. /api/dashboard)
      fetch("https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('cognito_id_token')}`,
          'Content-Type': 'application/json'
        }
      })
        .then((res) => res.json())
        .then((data) => {
          setApiResponse(data);
          if (data.email) setUserEmail(data.email);
        })
        .catch((err) => {
          console.error("Token may be invalid", err);
        });
    }
  }, [token]);

  if (!token) return <p>Loading token...</p>;

  return (
    <div className="dashboard">
      <LogoutButton />
      <h2>Welcome to your dashboard</h2>
      {userEmail && <p>Logged in as: {userEmail}</p>}
      {apiResponse && (
        <div>
          <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
