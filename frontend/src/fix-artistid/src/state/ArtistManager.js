import cognitoAuthService from '../services/CognitoAuthService';
import axios from 'axios';

let artistId = "defaultArtistId"; // Replace with dynamic logic if needed
const API_BASE_URL = 'https://0930nh8tai.execute-api.eu-central-1.amazonaws.com/prod/artistmanager';

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

export const getArtistData = async (artistId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}?artist_id=${artistId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching artist data:', error);
    throw error;
  }
};

export const setArtistData = async (artistData) => {
  try {
    const response = await axios.post(API_BASE_URL, artistData);
    return response.data;
  } catch (error) {
    console.error('Error setting artist data:', error);
    throw error;
  }
};
