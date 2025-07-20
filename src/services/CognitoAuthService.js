// Simple mock authentication service for demo purposes
class CognitoAuthService {
    constructor() {
        this.currentUser = null;
        this.jwtToken = null;
    }

    async signIn(email, password) {
        try {
            // Mock authentication - accept any email/password for demo
            console.log('🔐 Mock sign-in for demo purposes');
            
            this.currentUser = { username: email };
            this.jwtToken = 'mock-jwt-token-' + Date.now();
            
            // Store in localStorage for persistence
            localStorage.setItem('mockUser', email);
            localStorage.setItem('mockToken', this.jwtToken);
            
            return {
                success: true,
                user: this.currentUser,
                token: this.jwtToken,
                username: email
            };
        } catch (error) {
            return {
                success: false,
                error: 'Authentication failed'
            };
        }
    }

    async getCurrentUser() {
        try {
            const storedUser = localStorage.getItem('mockUser');
            const storedToken = localStorage.getItem('mockToken');
            
            if (storedUser && storedToken) {
                this.currentUser = { username: storedUser };
                this.jwtToken = storedToken;
                
                return {
                    success: true,
                    user: this.currentUser,
                    token: this.jwtToken,
                    username: storedUser
                };
            }
            
            return {
                success: false,
                error: 'No current user'
            };
        } catch (error) {
            return {
                success: false,
                error: 'Session error'
            };
        }
    }

    async signOut() {
        this.currentUser = null;
        this.jwtToken = null;
        localStorage.removeItem('mockUser');
        localStorage.removeItem('mockToken');
        
        return {
            success: true
        };
    }

    async getJwtToken() {
        if (this.jwtToken) {
            return this.jwtToken;
        }
        
        const result = await this.getCurrentUser();
        return result.success ? result.token : null;
    }
}

const cognitoAuthService = new CognitoAuthService();
export default cognitoAuthService;