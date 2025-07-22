import React from 'react';

const loginUrl = "https://auth.decodedmusic.com/login?client_id=5pb29tja8gkqm3jb43oimd5qjt&response_type=code&scope=openid+email+profile&redirect_uri=https://decodedmusic.com/dashboard";

const Login = () => {
  const redirectToCognito = () => {
    window.location.href = loginUrl;
  };

  return (
    <div className="login-container">
      <button className="sign-in-button" onClick={redirectToCognito}>
        Sign In with Cognito
      </button>
    </div>
  );
};

export default Login;