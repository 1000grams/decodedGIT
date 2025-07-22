import cognitoAuthService from '../services/CognitoAuthService';

let artistId = "defaultArtistId"; // Replace with dynamic logic if needed

export const getArtistId = () => artistId;
export const setArtistId = (newId) => {
  artistId = newId;
};

export const setArtistIdFromUser = async () => {
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
