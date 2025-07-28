import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const cognitoConfig = {
  region: process.env.REACT_APP_REGION || 'eu-central-1',
  userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID || 'eu-central-1_d9JNeVdni',
  clientId: process.env.REACT_APP_COGNITO_CLIENT_ID || '5pb29tja8gkqm3jb43oimd5qjt',
  domain: process.env.REACT_APP_COGNITO_DOMAIN
    ? `https://${process.env.REACT_APP_COGNITO_DOMAIN}`
    : 'https://prod-decodedmusic-auth.auth.eu-central-1.amazoncognito.com'
};

const userPool = new CognitoUserPool({
  UserPoolId: cognitoConfig.userPoolId,
  ClientId: cognitoConfig.clientId
});

// Simple mock authentication service for demo purposes
class CognitoAuthService {
    constructor() {
        this.currentUser = null;
        this.jwtToken = null;
    }

    async signIn(email, password) {
        const authDetails = new AuthenticationDetails({
            Username: email,
            Password: password
        });

        const user = new CognitoUser({
            Username: email,
            Pool: userPool
        });

        return new Promise((resolve, reject) => {
            user.authenticateUser(authDetails, {
                onSuccess: (result) => {
                    const token = result.getIdToken().getJwtToken();
                    localStorage.setItem('cognito_token', token);
                    resolve({ success: true, user: email, token });
                },
                onFailure: (err) => {
                    reject({ success: false, error: err.message });
                }
            });
        });
    }

    async getCurrentUser() {
        const currentUser = userPool.getCurrentUser();

        if (!currentUser) {
            return { success: false, user: null };
        }

        return new Promise((resolve, reject) => {
            currentUser.getSession((err, session) => {
                if (err) {
                    reject({ success: false, error: err.message });
                } else {
                    resolve({
                        success: true,
                        user: currentUser.getUsername(),
                        token: session.getIdToken().getJwtToken()
                    });
                }
            });
        });
    }

    async signOut() {
        const currentUser = userPool.getCurrentUser();
        if (currentUser) {
            currentUser.signOut();
            localStorage.removeItem('cognito_token');
        }
    }
}

export default new CognitoAuthService();