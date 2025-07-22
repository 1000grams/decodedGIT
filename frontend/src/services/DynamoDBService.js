import { getCognitoTokenFromUrl } from '../utils/getCognitoToken';
// Removed AWS SDK usage; using API Gateway endpoints instead

class DynamoDBService {
    // No constructor needed for fetch-based service

    // Get artist portfolio data
    async getArtistPortfolio(artistId) {
        // Ensure token is captured
        getCognitoTokenFromUrl();
        const token = localStorage.getItem('cognito_id_token');
        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/artist/portfolio`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ artistId }),
        });
        const result = await response.json();
        return result;
    }

    // Get track analytics
    async getTrackAnalytics(artistId) {
        getCognitoTokenFromUrl();
        const token = localStorage.getItem('cognito_id_token');
        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/track/analytics`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ artistId }),
        });
        return await response.json();
    }

    // Get AI recommendations
    async getAIRecommendations(artistId) {
        getCognitoTokenFromUrl();
        const token = localStorage.getItem('cognito_id_token');
        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/artist/recommendations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ artistId }),
        });
        return await response.json();
    }

    // Update artist data
    async updateArtistData(artistId, data) {
        getCognitoTokenFromUrl();
        const token = localStorage.getItem('cognito_id_token');
        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/artist/update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ artistId, data }),
        });
        return await response.json();
    }

    // Save contact message
    async saveContactMessage(data) {
        const token = localStorage.getItem('cognito_id_token');
        const response = await fetch(`${process.env.REACT_APP_API_ENDPOINT}/contact/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        return await response.json();
    }
}

const dynamoDBServiceInstance = new DynamoDBService();
export default dynamoDBServiceInstance;