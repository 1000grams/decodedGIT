const AWS = require('aws-sdk');
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();
const USER_POOL_ID = 'eu-central-1_d9JNeVdni';
const ARTIST_GROUP = 'artist';

exports.handler = async (event) => {
    console.log('Auth Login - DecodedMusic Platform');
    console.log('Event:', JSON.stringify(event, null, 2));

    // Handle CORS preflight
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            body: ''
        };
    }

    try {
        const body = event.body ? JSON.parse(event.body) : {};
        const { email, password } = body;

        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Authenticate user with Cognito
        const authParams = {
            AuthFlow: 'USER_PASSWORD_AUTH',
            ClientId: process.env.COGNITO_CLIENT_ID,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };

        const authResult = await cognitoIdentityServiceProvider.initiateAuth(authParams).promise();
        const idToken = authResult.AuthenticationResult.IdToken;

        // Decode token and check group membership
        const decodedToken = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString('utf-8'));
        const username = decodedToken['cognito:username'];

        const groupParams = {
            UserPoolId: USER_POOL_ID,
            Username: username
        };

        const userGroups = await cognitoIdentityServiceProvider.adminListGroupsForUser(groupParams).promise();
        const isArtist = userGroups.Groups.some(group => group.GroupName === ARTIST_GROUP);

        if (!isArtist) {
            throw new Error('User is not in the artist group');
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: true,
                token: idToken,
                user: {
                    email,
                    username,
                    groups: userGroups.Groups.map(group => group.GroupName)
                },
                message: 'Login successful - Welcome to DecodedMusic!'
            })
        };
    } catch (error) {
        console.error('Login error:', error.message);
        return {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                success: false,
                message: error.message
            })
        };
    }
};
