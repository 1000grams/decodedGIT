import axios from 'axios';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api.example.com';

/**
 * Fetch artist data by artist ID.
 * @param {string} artistId - The ID of the artist.
 * @returns {Promise<Object>} - A promise that resolves to the artist data.
 */
export async function fetchArtistData(artistId) {
  try {
    const response = await axios.get(`${apiBaseUrl}/artists/${artistId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching artist data:', error);
    throw error;
  }
}
