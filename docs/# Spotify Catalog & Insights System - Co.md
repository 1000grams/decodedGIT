# Spotify Catalog & Insights System - Complete Notes

## Overview
Complete system for managing Rue de Vivre's Spotify presence, catalog linking, and growth tracking.

## System Components

### 1. Database Tables
- **prod-DecodedCatalog-decodedmusic-backend**: Main catalog with works
- **prod-SpotifyInsights-decodedmusic-backend**: Spotify data collection
- **prod-GrowthMetrics-decodedmusic-backend**: Growth tracking metrics

### 2. Core Scripts

#### `create-insights-table.py`
- Creates DynamoDB tables with proper indexes
- Handles ArtistTimestampIndex and ArtistDateIndex
- Auto-adds missing indexes to existing tables

#### `enhanced-spotify-insights.py`
- Comprehensive Spotify API data collection
- Audio features analysis (danceability, energy, valence, tempo)
- Global market analysis (13+ countries)
- Growth metrics calculation
- Historical trend analysis
- Visibility score (0-100 composite metric)

#### `growth-dashboard.py`
- Integrated dashboard showing all data sources
- Catalog overview (works, Spotify links, coverage %)
- Current Spotify status (followers, popularity, markets)
- Growth analysis with trends
- Action items and recommendations
- Quick stats mode (`--quick` flag)

#### `spotify-auto-linker.py`
- Links catalog works to Spotify tracks
- High-confidence matching algorithm
- Batch processing with verification
- Updates works with `spotifyLink` objects

#### `run-all-script.py`
- Orchestrates the complete system
- Runs all components in sequence
- Error handling and status reporting

## Artist Configuration
```python
# Spotify API Data
SPOTIFY_ARTIST_ID = '293x3NAIGPR4RCJrFkzs0P'  # Rue de Vivre Spotify ID
ARTIST_NAME = 'Rue De Vivre'

# Catalog Data
CATALOG_ARTIST_ID = 'ruedevivre'  # DynamoDB internal ID

# API Credentials
SPOTIFY_CLIENT_ID = '5866a38ab59f46b2b8ceebfa17540d32'
SPOTIFY_CLIENT_SECRET = '1b88d0111feb49adbb15521ddf9d1ac8'
```

## Current Status (As of last run)
- **📚 Catalog**: 17 total works
- **🔗 Spotify Linked**: 16 works (94.1% coverage)
- **❌ Missing Links**: 1 work needs Spotify linking

## Data Collected

### Spotify Profile Data
- Follower count and growth tracking
- Popularity score (0-100)
- Genre classifications
- External URLs

### Audio Analysis
- **Danceability**: How suitable for dancing (0.0-1.0)
- **Energy**: Intensity and power (0.0-1.0) 
- **Valence**: Musical positivity (0.0-1.0)
- **Tempo**: BPM analysis
- **Acousticness**: Acoustic vs electronic ratio
- **Speechiness**: Presence of spoken words
- **Key**: Musical key detection

### Market Intelligence
- **Active Markets**: US, GB, CA, AU, DE, FR, ES, IT, NL, SE, NO, DK, FI
- **Track Availability**: Per-market track counts
- **Popularity Metrics**: Market-specific performance
- **Top Tracks**: Best performing in each region

### Growth Metrics
- **Visibility Score**: Composite 0-100 metric
  - Follower Score (0-25 points)
  - Popularity Score (0-25 points) 
  - Market Score (0-25 points)
  - Track Performance Score (0-25 points)
- **Weekly/Monthly Growth**: Follower and popularity trends
- **Market Expansion**: New/lost market tracking

### Recommendations & Related Artists
- **Spotify Recommendations**: Tracks similar to artist style
- **Related Artists**: Artists with similar sound/audience
- **Benchmarking**: Performance vs similar artists

## Usage Commands

### Setup & Data Collection
```powershell
# Complete system setup and run
python run-all-script.py

# Individual components
python create-insights-table.py          # Setup tables
python enhanced-spotify-insights.py      # Collect Spotify data
python spotify-auto-linker.py           # Link catalog to Spotify
```

### Dashboard & Monitoring
```powershell
# Full comprehensive dashboard
python growth-dashboard.py

# Quick stats summary
python growth-dashboard.py --quick
```

### Data Verification
```powershell
# Check catalog linking status
python verify-catalog-links.py

# Manual link verification
python spotify-auto-linker.py --verify
```

## Data Storage Structure

### SpotifyLink Object (in catalog works)
```json
{
  "spotifyLink": {
    "url": "https://open.spotify.com/track/[trackId]",
    "trackId": "[spotify_track_id]", 
    "confidence": "high|medium",
    "albumName": "[album_name]"
  }
}
```

### Growth Metrics Record
```json
{
  "metricId": "293x3NAIGPR4RCJrFkzs0P_2025-06-28",
  "artistId": "293x3NAIGPR4RCJrFkzs0P",
  "date": "2025-06-28",
  "metrics": {
    "follower_metrics": { "current_followers": 1234, "weekly_growth": 56 },
    "visibility_score": 67.5,
    "market_expansion": { "current_markets": 8, "new_markets": ["DE"] }
  }
}
```

## Error Resolution

### Common Issues
1. **Missing Index Error**: Run `create-insights-table.py` to add indexes
2. **No Historical Data**: Continue running weekly to build trends
3. **API Rate Limits**: Built-in delays prevent rate limiting
4. **Missing Spotify Links**: Run `spotify-auto-linker.py` to improve coverage

### Fallback Methods
- Dashboard uses scan if indexes unavailable
- Multiple API endpoints for data redundancy
- Graceful handling of missing data sources

## Automation Schedule

### Weekly Recommended
- Run `enhanced-spotify-insights.py` for fresh data
- Monitor dashboard for growth trends
- Check for new works needing Spotify linking

### Monthly Recommended  
- Full system run with `run-all-script.py`
- Review growth metrics and trends
- Update linking for any new catalog additions

## Key Insights Available

### Artist Performance
- Current follower count and growth trajectory
- Popularity trends across all markets
- Audio profile characteristics for playlist targeting
- Market penetration and expansion opportunities

### Catalog Optimization
- Spotify linking coverage percentage
- Track performance by market
- Missing links identification
- Verification of successful linkages

### Competitive Intelligence
- Related artist benchmarking
- Spotify recommendation insights
- Genre positioning analysis
- Market comparison data

## Success Metrics
- **94.1% Spotify Link Coverage** (16/17 works linked)
- **Global Market Presence** (13+ active markets)
- **Comprehensive Audio Profiling** (all top tracks analyzed)
- **Growth Tracking System** (weekly trend analysis)
- **Integrated Dashboard** (all data sources unified)

## Next Steps
1. Complete linking of remaining 1 work
2. Continue weekly data collection for trend analysis
3. Monitor visibility score improvements
4. Track market expansion opportunities
5. Use audio profile data for playlist placement strategy

---
*System Status: ✅ Operational*  
*Last Updated: 2025-06-28*  
*Coverage: 94.1% catalog