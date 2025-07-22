import React from 'react';

const SignInButton = () => {
  const domain = "https://auth.decodedmusic.com"; // ✅ use Cognito custom domain once validated
  const clientId = "5pb29tja8gkqm3jb43oimd5qjt";
  const redirectUri = "https://decodedmusic.com/dashboard";

  const loginUrl = `${domain}/login?client_id=${clientId}&response_type=token&scope=email+openid+profile&redirect_uri=${encodeURIComponent(redirectUri)}`;

  const handleLogin = () => {
    window.location.href = loginUrl;
  };

  return (
    <button onClick={handleLogin} className="sign-in-button">
      Sign in with Cognito
    </button>
  );
};

export default SignInButton;
