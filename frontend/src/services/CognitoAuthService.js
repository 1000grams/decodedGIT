import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

const cognitoConfig = {
  region: 'eu-central-1',
  userPoolId: 'eu-central-1_d9JNeVdni',
  clientId: '5pb29tja8gkqm3jb43oimd5qjt',
  domain: 'https://prod-decodedmusic-auth.auth.eu-central-1.amazoncognito.com'
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
                    localStorage.setItem('cognitoToken', token);
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
            localStorage.removeItem('cognitoToken');
        }
    }
}

export default new CognitoAuthService();