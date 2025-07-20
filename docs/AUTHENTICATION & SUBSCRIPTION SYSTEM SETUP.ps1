# AUTHENTICATION & SUBSCRIPTION SYSTEM SETUP

Write-Host "🔐 CREATING AUTHENTICATION & SUBSCRIPTION SYSTEM" -ForegroundColor Cyan
Write-Host "💳 Adding login, signup, subscription, and catalog components..." -ForegroundColor Yellow
Write-Host "=" * 60 -ForegroundColor White

# 1. Landing Page with Auth Flow
Write-Host "`n🏠 Creating Landing Page with Authentication..." -ForegroundColor Green
$landingPage = @'
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rue De Vivre - Music Analytics Platform</title>
    <link rel="stylesheet" href="styles/landing.css">
</head>
<body>
    <!-- Navigation -->
    <nav class="landing-nav">
        <div class="nav-container">
            <div class="logo">
                <h2>🎧 Rue De Vivre</h2>
            </div>
            <div class="nav-links">
                <a href="#home" class="nav-link active">Home</a>
                <a href="#about" class="nav-link">About</a>
                <a href="#buzz" class="nav-link">Weekly Buzz</a>
                <a href="#pricing" class="nav-link">Pricing</a>
                <div class="auth-buttons">
                    <button class="login-btn" onclick="showLogin()">Login</button>
                    <button class="signup-btn" onclick="showSignup()">Sign Up</button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="hero-content">
            <h1>AI-Powered Music Analytics</h1>
            <p>Professional investment-grade analytics for independent artists</p>
            <div class="hero-buttons">
                <button class="cta-primary" onclick="showSignup()">Start Free Trial</button>
                <button class="cta-secondary" onclick="showDemo()">Watch Demo</button>
            </div>
        </div>
    </section>

    <!-- About Section (Public) -->
    <section id="about" class="about">
        <div class="about-content">
            <h2>About Rue De Vivre Analytics</h2>
            <p>Banking-grade financial analytics for your music portfolio. Track performance, predict viral potential, and maximize revenue opportunities.</p>
            
            <div class="features-grid">
                <div class="feature">
                    <h3>💰 Investment Analytics</h3>
                    <p>Portfolio tracking and ROI analysis</p>
                </div>
                <div class="feature">
                    <h3>🚀 Viral Predictions</h3>
                    <p>AI-powered trend analysis</p>
                </div>
                <div class="feature">
                    <h3>🎵 Spotify Integration</h3>
                    <p>Real-time streaming data</p>
                </div>
                <div class="feature">
                    <h3>📊 Market Research</h3>
                    <p>Automated competitor analysis</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Weekly Buzz Section (Public Preview) -->
    <section id="buzz" class="weekly-buzz-preview">
        <div class="buzz-content">
            <h2>📊 Weekly Buzz - Market Intelligence</h2>
            <p>Get weekly market insights and trending opportunities</p>
            
            <div class="buzz-preview-card">
                <h3>This Week's Highlights</h3>
                <ul>
                    <li>🚀 Electronic music trending up 23%</li>
                    <li>🎵 TikTok algorithm favoring 15-30 second hooks</li>
                    <li>💰 Sync licensing opportunities in gaming +45%</li>
                </ul>
                <div class="buzz-cta">
                    <p><strong>Subscribe to access full weekly reports</strong></p>
                    <button class="subscribe-btn" onclick="showSubscription()">Subscribe Now</button>
                </div>
            </div>
        </div>
    </section>

    <!-- Pricing Section -->
    <section id="pricing" class="pricing">
        <div class="pricing-content">
            <h2>💳 Subscription Plans</h2>
            
            <div class="pricing-grid">
                <div class="pricing-card">
                    <h3>Basic Analytics</h3>
                    <div class="price">$29<span>/month</span></div>
                    <ul>
                        <li>✅ Portfolio tracking</li>
                        <li>✅ Basic Spotify integration</li>
                        <li>✅ Monthly reports</li>
                        <li>❌ Viral predictions</li>
                        <li>❌ Market research</li>
                    </ul>
                    <button class="pricing-btn" onclick="selectPlan('basic')">Choose Basic</button>
                </div>

                <div class="pricing-card featured">
                    <h3>Professional</h3>
                    <div class="price">$79<span>/month</span></div>
                    <ul>
                        <li>✅ All Basic features</li>
                        <li>✅ Viral predictions</li>
                        <li>✅ Weekly market research</li>
                        <li>✅ Pitch automation</li>
                        <li>✅ Music catalog management</li>
                    </ul>
                    <button class="pricing-btn" onclick="selectPlan('pro')">Choose Pro</button>
                </div>

                <div class="pricing-card">
                    <h3>Enterprise</h3>
                    <div class="price">$199<span>/month</span></div>
                    <ul>
                        <li>✅ All Pro features</li>
                        <li>✅ White-label dashboard</li>
                        <li>✅ API access</li>
                        <li>✅ Custom integrations</li>
                        <li>✅ Priority support</li>
                    </ul>
                    <button class="pricing-btn" onclick="selectPlan('enterprise')">Choose Enterprise</button>
                </div>
            </div>
        </div>
    </section>

    <!-- Login Modal -->
    <div id="loginModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('loginModal')">&times;</span>
            <h2>🔐 Login to Dashboard</h2>
            <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="loginEmail" required>
                </div>
                <div class="form-group">
                    <label>Password:</label>
                    <input type="password" id="loginPassword" required>
                </div>
                <button type="submit" class="auth-btn">Login</button>
                <p class="auth-switch">
                    Don't have an account? <a href="#" onclick="switchToSignup()">Sign up</a>
                </p>
            </form>
        </div>
    </div>

    <!-- Signup Modal -->
    <div id="signupModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('signupModal')">&times;</span>
            <h2>🎵 Join Rue De Vivre</h2>
            <form id="signupForm" onsubmit="handleSignup(event)">
                <div class="form-group">
                    <label>Artist/Label Name:</label>
                    <input type="text" id="signupName" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="signupEmail" required>
                </div>
                <div class="form-group">
                    <label>Password:</label>
                    <input type="password" id="signupPassword" required>
                </div>
                <div class="form-group">
                    <label>Spotify Artist URL (Optional):</label>
                    <input type="url" id="spotifyURL" placeholder="https://open.spotify.com/artist/...">
                </div>
                <button type="submit" class="auth-btn">Create Account</button>
                <p class="auth-switch">
                    Already have an account? <a href="#" onclick="switchToLogin()">Login</a>
                </p>
            </form>
        </div>
    </div>

    <!-- Subscription Modal -->
    <div id="subscriptionModal" class="modal">
        <div class="modal-content subscription-modal">
            <span class="close" onclick="closeModal('subscriptionModal')">&times;</span>
            <h2>💳 Choose Your Plan</h2>
            <div id="subscriptionContent">
                <!-- Subscription form will be populated by JavaScript -->
            </div>
        </div>
    </div>

    <script src="scripts/landing.js"></script>
    <script src="scripts/auth.js"></script>
    <script src="scripts/subscription.js"></script>
</body>
</html>
'@

# 2. Authentication JavaScript
Write-Host "`n🔐 Creating Authentication System..." -ForegroundColor Green
$authJS = @'
// Authentication System
class AuthSystem {
    constructor() {
        this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
        this.currentUser = null;
        this.subscription = null;
        this.init();
    }

    init() {
        // Check if user is already logged in
        const token = localStorage.getItem('auth_token');
        if (token) {
            this.validateToken(token);
        }
    }

    async handleLogin(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('auth_token', data.token);
                this.currentUser = data.user;
                this.subscription = data.subscription;
                
                // Redirect to dashboard
                window.location.href = '/dashboard.html';
            } else {
                throw new Error(data.message || 'Login failed');
            }
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

    async validateToken(token) {
        try {
            const response = await fetch(`${this.baseURL}/auth/validate`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                }
            });

            const data = await response.json();
            
            if (response.ok) {
                this.currentUser = data.user;
                this.subscription = data.subscription;
                return true;
            } else {
                localStorage.removeItem('auth_token');
                return false;
            }
        } catch (error) {
            console.error('Token validation error:', error);
            localStorage.removeItem('auth_token');
            return false;
        }
    }

    logout() {
        localStorage.removeItem('auth_token');
        this.currentUser = null;
        this.subscription = null;
        window.location.href = '/index.html';
    }

    requireAuth() {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            window.location.href = '/index.html';
            return false;
        }
        return true;
    }

    requireSubscription() {
        if (!this.subscription || !this.subscription.active) {
            window.location.href = '/subscription.html';
            return false;
        }
        return true;
    }
}

// Global auth instance
window.authSystem = new AuthSystem();

// Event handlers for forms
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    window.authSystem.handleLogin(email, password);
}

function handleSignup(event) {
    event.preventDefault();
    const userData = {
        name: document.getElementById('signupName').value,
        email: document.getElementById('signupEmail').value,
        password: document.getElementById('signupPassword').value,
        spotifyURL: document.getElementById('spotifyURL').value
    };
    window.authSystem.handleSignup(userData);
}

function selectSubscription(userId, planType, amount) {
    window.authSystem.selectSubscription(userId, planType, amount);
}

function startFreeTrial(userId) {
    window.authSystem.startFreeTrial(userId);
}
'@

# 3. Music Catalog Component
Write-Host "`n🎵 Creating Music Catalog System..." -ForegroundColor Green
$catalogJS = @'
// Music Catalog System
class MusicCatalog {
    constructor() {
        this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
        this.catalog = [];
        this.pitchTemplates = [];
        this.init();
    }

    async init() {
        await this.loadCatalog();
        await this.loadPitchTemplates();
        this.renderCatalog();
    }

    async loadCatalog() {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${this.baseURL}/catalog`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            this.catalog = data.tracks || [];
        } catch (error) {
            console.error('Error loading catalog:', error);
        }
    }

    async loadPitchTemplates() {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${this.baseURL}/pitch/templates`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const data = await response.json();
            this.pitchTemplates = data.templates || [];
        } catch (error) {
            console.error('Error loading pitch templates:', error);
        }
    }

    renderCatalog() {
        const container = document.getElementById('catalog-container');
        if (!container) return;

        container.innerHTML = `
            <div class="catalog-header">
                <h2>🎵 Music Catalog</h2>
                <div class="catalog-actions">
                    <button onclick="showAddTrack()" class="add-track-btn">Add Track</button>
                    <button onclick="showBulkPitch()" class="bulk-pitch-btn">Bulk Pitch</button>
                </div>
            </div>

            <div class="catalog-grid">
                ${this.catalog.map(track => this.renderTrackCard(track)).join('')}
            </div>

            <div class="pitch-automation">
                <h3>🚀 Pitch Automation</h3>
                <div class="pitch-templates">
                    ${this.pitchTemplates.map(template => this.renderPitchTemplate(template)).join('')}
                </div>
            </div>
        `;
    }

    renderTrackCard(track) {
        return `
            <div class="track-card" data-track-id="${track.id}">
                <div class="track-artwork">
                    <img src="${track.artwork || '/default-artwork.png'}" alt="${track.title}" />
                    <div class="track-actions">
                        <button onclick="playTrack('${track.id}')" class="play-btn">▶️</button>
                        <button onclick="showPitchModal('${track.id}')" class="pitch-btn">📧</button>
                    </div>
                </div>
                
                <div class="track-info">
                    <h4>${track.title}</h4>
                    <p class="track-artist">${track.artist || 'Rue De Vivre'}</p>
                    <p class="track-genre">${track.genre}</p>
                    
                    <div class="track-stats">
                        <span class="stat">
                            <strong>BPM:</strong> ${track.bpm || 'N/A'}
                        </span>
                        <span class="stat">
                            <strong>Key:</strong> ${track.key || 'N/A'}
                        </span>
                        <span class="stat">
                            <strong>Duration:</strong> ${this.formatDuration(track.duration)}
                        </span>
                    </div>
                    
                    <div class="track-performance">
                        <div class="performance-metric">
                            <span>Streams:</span>
                            <strong>${(track.streams || 0).toLocaleString()}</strong>
                        </div>
                        <div class="performance-metric">
                            <span>Revenue:</span>
                            <strong>$${(track.revenue || 0).toFixed(2)}</strong>
                        </div>
                        <div class="performance-metric">
                            <span>Viral Score:</span>
                            <strong>${track.viralScore || 0}/10</strong>
                        </div>
                    </div>
                    
                    <div class="track-files">
                        <div class="file-links">
                            ${track.wavFile ? `<a href="${track.wavFile}" class="file-link">🎵 WAV</a>` : ''}
                            ${track.mp3File ? `<a href="${track.mp3File}" class="file-link">🎵 MP3</a>` : ''}
                            ${track.stemsFile ? `<a href="${track.stemsFile}" class="file-link">🎛️ Stems</a>` : ''}
                        </div>
                    </div>
                    
                    <div class="sync-opportunities">
                        <h5>🎯 Sync Opportunities</h5>
                        <div class="opportunities-list">
                            ${(track.syncOpportunities || []).map(opp => `
                                <span class="opportunity-tag ${opp.priority}">${opp.type}</span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    renderPitchTemplate(template) {
        return `
            <div class="pitch-template" data-template-id="${template.id}">
                <h4>${template.name}</h4>
                <p>${template.description}</p>
                <div class="template-stats">
                    <span>Success Rate: ${template.successRate}%</span>
                    <span>Uses: ${template.uses}</span>
                </div>
                <button onclick="usePitchTemplate('${template.id}')" class="use-template-btn">
                    Use Template
                </button>
            </div>
        `;
    }

    async showPitchModal(trackId) {
        const track = this.catalog.find(t => t.id === trackId);
        if (!track) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content pitch-modal">
                <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
                <h3>📧 Pitch "${track.title}"</h3>
                
                <div class="pitch-form">
                    <div class="track-summary">
                        <h4>Track Summary</h4>
                        <div class="summary-content">
                            <p><strong>Title:</strong> ${track.title}</p>
                            <p><strong>Genre:</strong> ${track.genre}</p>
                            <p><strong>BPM:</strong> ${track.bpm}</p>
                            <p><strong>Key:</strong> ${track.key}</p>
                            <p><strong>Duration:</strong> ${this.formatDuration(track.duration)}</p>
                            <p><strong>Mood:</strong> ${track.mood || 'Energetic, Modern'}</p>
                            <p><strong>Instruments:</strong> ${track.instruments || 'Synths, Drums, Bass'}</p>
                        </div>
                    </div>
                    
                    <div class="pitch-recipients">
                        <h4>Recipients</h4>
                        <textarea id="pitchRecipients" placeholder="Enter email addresses, separated by commas"></textarea>
                    </div>
                    
                    <div class="pitch-template-selector">
                        <h4>Pitch Template</h4>
                        <select id="pitchTemplate">
                            <option value="">Select a template...</option>
                            ${this.pitchTemplates.map(template => `
                                <option value="${template.id}">${template.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="pitch-message">
                        <h4>Message</h4>
                        <textarea id="pitchMessage" rows="10" placeholder="Your pitch message will appear here..."></textarea>
                    </div>
                    
                    <div class="pitch-attachments">
                        <h4>Attachments</h4>
                        <div class="attachment-options">
                            <label>
                                <input type="checkbox" checked> WAV File
                            </label>
                            <label>
                                <input type="checkbox" checked> MP3 File
                            </label>
                            <label>
                                <input type="checkbox"> Stems Package
                            </label>
                        </div>
                    </div>
                    
                    <div class="pitch-actions">
                        <button onclick="sendPitch('${trackId}')" class="send-pitch-btn">
                            Send Pitch
                        </button>
                        <button onclick="schedulePitch('${trackId}')" class="schedule-pitch-btn">
                            Schedule Pitch
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';
    }

    async sendPitch(trackId) {
        const track = this.catalog.find(t => t.id === trackId);
        const recipients = document.getElementById('pitchRecipients').value;
        const message = document.getElementById('pitchMessage').value;
        const templateId = document.getElementById('pitchTemplate').value;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`${this.baseURL}/pitch/send`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    trackId,
                    recipients: recipients.split(',').map(email => email.trim()),
                    message,
                    templateId,
                    attachments: this.getSelectedAttachments(track)
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Pitch sent successfully!');
                document.querySelector('.pitch-modal').parentElement.remove();
            } else {
                throw new Error(data.message || 'Pitch failed');
            }
        } catch (error) {
            console.error('Pitch error:', error);
            alert('Pitch failed: ' + error.message);
        }
    }

    getSelectedAttachments(track) {
        const attachments = [];
        const checkboxes = document.querySelectorAll('.attachment-options input[type="checkbox"]:checked');
        
        checkboxes.forEach(checkbox => {
            const label = checkbox.parentElement.textContent.trim();
            if (label === 'WAV File' && track.wavFile) {
                attachments.push({ type: 'wav', url: track.wavFile });
            }
            if (label === 'MP3 File' && track.mp3File) {
                attachments.push({ type: 'mp3', url: track.mp3File });
            }
            if (label === 'Stems Package' && track.stemsFile) {
                attachments.push({ type: 'stems', url: track.stemsFile });
            }
        });
        
        return attachments;
    }

    formatDuration(seconds) {
        if (!seconds) return 'Unknown';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }
}

// Global catalog instance
window.musicCatalog = new MusicCatalog();

// Event handlers
function showPitchModal(trackId) {
    window.musicCatalog.showPitchModal(trackId);
}

function sendPitch(trackId) {
    window.musicCatalog.sendPitch(trackId);
}

function playTrack(trackId) {
    // Implement audio player functionality
    console.log('Playing track:', trackId);
}
'@

# 4. Protected Dashboard Router
Write-Host "`n🛡️ Creating Protected Dashboard Router..." -ForegroundColor Green
$dashboardRouter = @'
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
'@

# Save all files
$landingPage | Out-File -FilePath "index.html" -Encoding UTF8
$authJS | Out-File -FilePath "auth.js" -Encoding UTF8
$catalogJS | Out-File -FilePath "music-catalog.js" -Encoding UTF8
$dashboardRouter | Out-File -FilePath "dashboard-router.js" -Encoding UTF8

Write-Host "`n✅ AUTHENTICATION & SUBSCRIPTION SYSTEM CREATED!" -ForegroundColor Green

Write-Host "`n🔐 AUTHENTICATION FLOW:" -ForegroundColor Cyan
Write-Host "   1. Landing page (index.html) - Public access" -ForegroundColor White
Write-Host "   2. Login/Signup modals with authentication" -ForegroundColor White
Write-Host "   3. Subscription selection after signup" -ForegroundColor White
Write-Host "   4. Protected dashboard access" -ForegroundColor White
Write-Host "   5. Music catalog with pitch automation" -ForegroundColor White

Write-Host "`n💳 SUBSCRIPTION PLANS:" -ForegroundColor Yellow
Write-Host "   📊 Basic Analytics - $29/month" -ForegroundColor White
Write-Host "   🚀 Professional - $79/month (includes pitch automation)" -ForegroundColor White
Write-Host "   🏢 Enterprise - $199/month (white-label + API)" -ForegroundColor White

Write-Host "`n🎵 MUSIC CATALOG FEATURES:" -ForegroundColor Green
Write-Host "   📁 Complete track management" -ForegroundColor White
Write-Host "   📧 Automated pitch generation" -ForegroundColor White
Write-Host "   🎵 WAV/MP3 file links included" -ForegroundColor White
Write-Host "   🎯 Sync opportunity identification" -ForegroundColor White
Write-Host "   📊 Performance metrics" -ForegroundColor White

Write-Host "`n📁 FILES CREATED:" -ForegroundColor Yellow
Write-Host "   ✅ index.html - Landing page with auth" -ForegroundColor Gray
Write-Host "   ✅ auth.js - Authentication system" -ForegroundColor Gray
Write-Host "   ✅ music-catalog.js - Catalog & pitch automation" -ForegroundColor Gray
Write-Host "   ✅ dashboard-router.js - Protected route handler" -ForegroundColor Gray

Write-Host "`n🚀 PUBLIC SECTIONS (No Login Required):" -ForegroundColor Cyan
Write-Host "   🏠 Home page" -ForegroundColor White
Write-Host "   ℹ️ About section" -ForegroundColor White
Write-Host "   📊 Weekly Buzz preview" -ForegroundColor White

Write-Host "`n🔒 PROTECTED SECTIONS (Login Required):" -ForegroundColor Red
Write-Host "   📊 Full Analytics Dashboard" -ForegroundColor White
Write-Host "   🎵 Music Catalog Management" -ForegroundColor White
Write-Host "   📧 Pitch Automation System" -ForegroundColor White
Write-Host "   📈 Complete Weekly Buzz Reports" -ForegroundColor White

Write-Host "`n🎧 COMPLETE AUTHENTICATION SYSTEM READY!" -ForegroundColor Green