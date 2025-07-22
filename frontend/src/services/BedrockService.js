import axios from 'axios';

const bedrockApiKey = process.env.REACT_APP_BEDROCK_API_KEY || 'ABSKQmVkcm9ja0FQSUtleS1tanZsLWF0LTM5NjkxMzcwMzAyNDp5WExYTGg1cHQ1YVo2N0hWK3hiMjgwRy9hVlpJQkJJdzNaZHJPQ0QvUllpTUFRMy9YN1Q5MlozYUtubz0=';
const bedrockApiUrl = 'https://bedrock-api-endpoint.amazonaws.com'; // Replace with the actual endpoint

if (!process.env.REACT_APP_BEDROCK_API_KEY) {
  console.error('Bedrock API key is missing. Please set REACT_APP_BEDROCK_API_KEY in your environment variables.');
}

export async function generateContent(prompt) {
  try {
    const response = await axios.post(
      `${bedrockApiUrl}/generate`,
      { prompt },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${bedrockApiKey}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error('Error generating content with AWS Bedrock:', error);
    throw error;
  }
}
