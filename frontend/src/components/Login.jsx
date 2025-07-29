import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.js';

const loginUrl =
  "https://auth.decodedmusic.com/login?client_id=5pb29tja8gkqm3jb43oimd5qjt&response_type=token&scope=openid+email+profile&redirect_uri=https://decodedmusic.com/dashboard";

const Login = () => {
  const { user } = useAuth();

  const redirectToCognito = () => {
    window.location.href = loginUrl;
  };

  if (user) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="login-container">
      <button className="sign-in-button" onClick={redirectToCognito}>
        Sign In with Cognito
      </button>
    </div>
  );
};

export default Login;
