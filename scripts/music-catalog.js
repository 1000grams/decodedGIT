// Music Catalog System
class MusicCatalog {
    constructor() {
        this.baseURL = 'https://2h2oj7u446.execute-api.eu-central-1.amazonaws.com/prod';
        this.catalog = [];
        this.pitchTemplates = [];
        this.artistId = null; // Ensure artist_id is available
        this.init();
    }

    async init() {
        this.artistId = await this.fetchArtistId();
        await this.loadCatalog();
        await this.loadPitchTemplates();
        this.renderCatalog();
    }

    async fetchArtistId() {
        try {
            const response = await fetch(`${this.baseURL}/artist`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
            });
            const data = await response.json();
            return data.artist_id || null;
        } catch (error) {
            console.error('Error fetching artist ID:', error);
            return null;
        }
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
                <h2> Music Catalog</h2>
                <div class="catalog-actions">
                    <button onclick="showAddTrack()" class="add-track-btn">Add Track</button>
                    <button onclick="showBulkPitch()" class="bulk-pitch-btn">Bulk Pitch</button>
                    <a href="/pitcher" class="pitcher-link">Go to PITCHER</a>
                </div>
            </div>

            <div class="catalog-grid">
                ${this.catalog.map(track => this.renderTrackCard(track)).join('')}
            </div>

            <div class="pitch-automation">
                <h3> Pitch Automation</h3>
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
                        <button onclick="playTrack('${track.id}')" class="play-btn"></button>
                        <button onclick="showPitchModal('${track.id}')" class="pitch-btn"></button>
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
                            ${track.wavFile ? `<a href="${track.wavFile}" class="file-link"> WAV</a>` : ''}
                            ${track.mp3File ? `<a href="${track.mp3File}" class="file-link"> MP3</a>` : ''}
                            ${track.stemsFile ? `<a href="${track.stemsFile}" class="file-link"> Stems</a>` : ''}
                        </div>
                    </div>
                    
                    <div class="sync-opportunities">
                        <h5> Sync Opportunities</h5>
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
                <h3> Pitch "${track.title}"</h3>
                
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
