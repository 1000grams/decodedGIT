# Update the display_growth_dashboard function

def display_growth_dashboard():
    """Display comprehensive growth dashboard with integrated data"""
    print("🎧 RUE DE VIVRE - COMPREHENSIVE GROWTH DASHBOARD")
    print("=" * 60)
    
    # Get all data sources
    growth_history = get_growth_history(days_back=30)
    catalog_summary = get_catalog_summary()
    spotify_insights = get_latest_spotify_insights()
    
    # Catalog Overview
    print(f"\n📚 CATALOG OVERVIEW:")
    print(f"   🎵 Total Works: {catalog_summary['total_works']}")
    print(f"   🔗 Spotify Linked: {catalog_summary['spotify_linked']}")
    print(f"   📊 Link Coverage: {catalog_summary['link_percentage']:.1f}%")
    
    # Current Spotify Status
    if spotify_insights:
        profile = spotify_insights.get('profile', {})
        print(f"\n🎧 CURRENT SPOTIFY STATUS:")
        print(f"   👥 Followers: {profile.get('followers', 0):,}")
        print(f"   ⭐ Popularity: {profile.get('popularity', 0)}/100")
        print(f"   🎵 Top Tracks: {len(spotify_insights.get('top_tracks', []))}")
        print(f"   🌍 Active Markets: {len(spotify_insights.get('market_analysis', {}))}")
    
    # Growth metrics (existing code)
    if not growth_history:
        print("❌ No growth data available")
        return
    
    print(f"\n📊 GROWTH ANALYSIS ({len(growth_history)} data points from last 30 days):")
    
    # Latest metrics
    latest = growth_history[-1]
    latest_metrics = latest.get('metrics', {})
    
    print(f"\n📈 LATEST METRICS ({latest['date']}):")
    
    follower_metrics = latest_metrics.get('follower_metrics', {})
    if follower_metrics:
        print(f"   👥 Current Followers: {follower_metrics.get('current_followers', 0):,}")
        print(f"   📊 Weekly Growth: {follower_metrics.get('weekly_growth', 0):+,}")
        print(f"   📈 Growth Rate: {follower_metrics.get('weekly_growth_rate', 0):+.2f}%")
    
    popularity_metrics = latest_metrics.get('popularity_metrics', {})
    if popularity_metrics:
        print(f"   ⭐ Popularity: {popularity_metrics.get('current_popularity', 0)}/100")
        print(f"   📊 Trend: {popularity_metrics.get('popularity_trend', 'unknown')}")
    
    print(f"   🎯 Visibility Score: {latest_metrics.get('visibility_score', 0):.1f}/100")
    
    # Growth trends (existing code continues...)
    if len(growth_history) >= 3:
        print(f"\n📈 GROWTH TRENDS:")
        
        follower_counts = []
        visibility_scores = []
        
        for record in growth_history:
            metrics = record.get('metrics', {})
            follower_metrics = metrics.get('follower_metrics', {})
            followers = follower_metrics.get('current_followers', 0)
            if followers > 0:
                follower_counts.append(followers)
            
            visibility = metrics.get('visibility_score', 0)
            if visibility > 0:
                visibility_scores.append(visibility)
        
        if len(follower_counts) >= 2:
            total_growth = follower_counts[-1] - follower_counts[0]
            days_span = len(follower_counts)
            avg_daily_growth = total_growth / days_span
            
            print(f"   📊 Total Growth: {total_growth:+,} followers over {days_span} days")
            print(f"   📊 Average Daily Growth: {avg_daily_growth:+.1f} followers/day")
        
        if len(visibility_scores) >= 2:
            avg_visibility = statistics.mean(visibility_scores)
            print(f"   🎯 Average Visibility Score: {avg_visibility:.1f}/100")
    
    # Integration Health Check
    print(f"\n🔗 INTEGRATION STATUS:")
    print(f"   📊 Growth Data: {'✅' if growth_history else '❌'}")
    print(f"   📚 Catalog Data: {'✅' if catalog_summary['total_works'] > 0 else '❌'}")
    print(f"   🎧 Spotify Data: {'✅' if spotify_insights else '❌'}")
    
    # Market expansion (existing code)
    market_expansion = latest_metrics.get('market_expansion', {})
    if market_expansion:
        print(f"\n🌍 MARKET PRESENCE:")
        print(f"   📍 Active Markets: {market_expansion.get('current_markets', 0)}")
        if market_expansion.get('new_markets'):
            print(f"   🆕 New Markets: {', '.join(market_expansion['new_markets'])}")
    
    print(f"\n✅ Dashboard updated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")