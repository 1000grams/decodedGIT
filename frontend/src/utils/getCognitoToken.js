// utils/getCognitoToken.js
export function getCognitoTokenFromUrl() {
  const hash = window.location.hash;
  const token = new URLSearchParams(hash.substring(1)).get("id_token");

  if (token) {
    localStorage.setItem("cognito_id_token", token);
    window.history.replaceState(null, "", window.location.pathname); // clean URL
  }

  return token || localStorage.getItem("cognito_id_token");
}
