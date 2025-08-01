import axios from 'axios';

// Use backend endpoint instead of direct Bedrock access to avoid exposing API keys
const API_BASE =
  process.env.REACT_APP_API_BASE ||
  'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
const bedrockApiUrl =
  process.env.REACT_APP_BEDROCK_API_URL || `${API_BASE}/bedrock-insights`;

export async function generateContent(prompt) {
  try {
    const response = await axios.post(
      bedrockApiUrl,
      { prompt },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error generating content with AWS Bedrock:', error);
    throw error;
  }
}
