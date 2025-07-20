// Authentication System
import { useAuth } from '../src/hooks/useAuth';

class AuthSystem {
    constructor() {
        this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
        this.authContext = useAuth();
    }

    async handleLogin(email, password) {
        try {
            await this.authContext.login({ email, password });
            // Redirect to dashboard
            window.location.href = '/dashboard.html';
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed: ' + error.message);
        }
    }

    async handleSignup(userData) {
        try {
            const response = await fetch(`${this.baseURL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (response.ok) {
                // Show subscription selection
                this.showSubscriptionFlow(data.userId);
            } else {
                throw new Error(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('Signup failed: ' + error.message);
        }
    }

    showSubscriptionFlow(userId) {
        const modal = document.getElementById('subscriptionModal');
        const content = document.getElementById('subscriptionContent');
        
        content.innerHTML = `
            <div class="subscription-flow">
                <h3>Complete Your Registration</h3>
                <p>Choose a plan to access your analytics dashboard:</p>
                
                <div class="subscription-plans">
                    <div class="plan-card" data-plan="basic">
                        <h4>Basic Analytics</h4>
                        <div class="plan-price">$29/month</div>
                        <button onclick="selectSubscription('${userId}', 'basic', 29)">
                            Select Basic
                        </button>
                    </div>
                    
                    <div class="plan-card featured" data-plan="pro">
                        <h4>Professional</h4>
                        <div class="plan-price">$79/month</div>
                        <button onclick="selectSubscription('${userId}', 'pro', 79)">
                            Select Professional
                        </button>
                    </div>
                    
                    <div class="plan-card" data-plan="enterprise">
                        <h4>Enterprise</h4>
                        <div class="plan-price">$199/month</div>
                        <button onclick="selectSubscription('${userId}', 'enterprise', 199)">
                            Select Enterprise
                        </button>
                    </div>
                </div>
                
                <div class="trial-option">
                    <p><strong>Or start with a 7-day free trial:</strong></p>
                    <button onclick="startFreeTrial('${userId}')" class="trial-btn">
                        Start Free Trial
                    </button>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
    }

    async selectSubscription(userId, planType, amount) {
        try {
            const response = await fetch(`${this.baseURL}/subscription/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    planType,
                    amount
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                // Redirect to payment processing
                window.location.href = data.paymentURL;
            } else {
                throw new Error(data.message || 'Subscription creation failed');
            }
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Subscription failed: ' + error.message);
        }
    }

    async startFreeTrial(userId) {
        try {
            const response = await fetch(`${this.baseURL}/subscription/trial`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('auth_token', data.token);
                this.currentUser = data.user;
                this.subscription = data.subscription;
                
                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            } else {
                throw new Error(data.message || 'Trial creation failed');
            }
        } catch (error) {
            console.error('Trial error:', error);
            alert('Trial creation failed: ' + error.message);
        }
    }

    logout() {
        this.authContext.logout();
        window.location.href = '/index.html';
    }

    requireAuth() {
        const { user } = this.authContext;
        if (!user) {
            window.location.href = '/index.html';
            return false;
        }
        return true;
    }

    requireSubscription() {
        const { user } = this.authContext;
        if (!user?.subscription?.active) {
            window.location.href = '/subscription.html';
            return false;
        }
        return true;
    }
}

export default AuthSystem;
