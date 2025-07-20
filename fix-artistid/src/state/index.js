const cognitoAuthService = require('../services/CognitoAuthService');

let artistId = "defaultArtistId"; // Replace with dynamic logic if needed

const getArtistId = () => artistId;
const setArtistId = (newId) => {
  artistId = newId;
};

const setArtistIdFromUser = async () => {
  const user = await cognitoAuthService.getCurrentUser();
  const email = user.email;
  const artistId = mapEmailToArtistId(email);
  setArtistId(artistId);
};

function mapEmailToArtistId(email) {
  const mapping = {
    'rdv@decodedmusic.com': 'rue_de_vivre',
    // Add other mappings here
  };
  return mapping[email] || 'defaultArtistId';
}

module.exports = {
  getArtistId,
  setArtistId,
  setArtistIdFromUser
};
