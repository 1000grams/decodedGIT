// Dashboard Router with Authentication Check
class DashboardRouter {
    constructor() {
        this.init();
    }

    init() {
        // Check authentication on page load
        if (!this.checkAuth()) {
            window.location.href = '/index.html';
            return;
        }

        // Check subscription status
        if (!this.checkSubscription()) {
            window.location.href = '/subscription.html';
            return;
        }

        // Load dashboard components
        this.loadDashboard();
    }

    checkAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) return false;

        // Validate token with server
        return window.authSystem.validateToken(token);
    }

    checkSubscription() {
        const subscription = window.authSystem.subscription;
        return subscription && subscription.active;
    }

    loadDashboard() {
        // Initialize all dashboard components
        if (window.rueAnalytics) {
            window.rueAnalytics.init();
        }
        
        if (window.musicCatalog) {
            window.musicCatalog.init();
        }

        // Show user info
        this.displayUserInfo();
    }

    displayUserInfo() {
        const user = window.authSystem.currentUser;
        const subscription = window.authSystem.subscription;
        
        const userInfoContainer = document.getElementById('user-info');
        if (userInfoContainer && user) {
            userInfoContainer.innerHTML = `
                <div class="user-profile">
                    <span class="user-name">${user.name}</span>
                    <span class="subscription-status ${subscription.plan}">${subscription.plan}</span>
                    <button onclick="window.authSystem.logout()" class="logout-btn">Logout</button>
                </div>
            `;
        }
    }
}

// Initialize router on dashboard pages
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard')) {
        new DashboardRouter();
    }
});
