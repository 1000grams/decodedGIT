import cognitoAuthService from '../services/CognitoAuthService.js';

let artistId = "defaultArtistId"; // Replace with dynamic logic if needed

export const getArtistId = () => artistId;
export const setArtistId = (newId) => {
  artistId = newId;
};

export const setArtistIdFromUser = async () => {
  const result = await cognitoAuthService.getCurrentUser();
  const email = result.user; // currentUser.getUsername() returns the email
  const derivedId = mapEmailToArtistId(email);
  setArtistId(derivedId);
};

function mapEmailToArtistId(email) {
  const mapping = {
    'rdv@decodedmusic.com': 'rue_de_vivre',
    // Add other mappings here
  };
  return mapping[email] || 'defaultArtistId';
}