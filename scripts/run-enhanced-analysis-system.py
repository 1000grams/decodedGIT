import subprocess
import sys
from datetime import datetime

def run_command(command, description):
    """Run a command and display results"""
    print(f"\n{'='*60}")
    print(f"🔄 {description}")
    print(f"{'='*60}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.stdout:
            print(result.stdout)
        
        if result.stderr and result.returncode != 0:
            print(f"❌ Error: {result.stderr}")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Failed to run {command}: {e}")
        return False

def main():
    """Run the complete enhanced analysis system"""
    print("🎧 RUE DE VIVRE - ENHANCED ANALYSIS SYSTEM")
    print("🎯 Mood, Context, and Viral Prediction Intelligence")
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    commands = [
        ("python create-insights-table.py", "Setting Up DynamoDB Infrastructure"),
        ("python load-ascap-works-albums.py", "Loading 4-Album Catalog (Okina, Azita, RAVE, Trois)"),
        ("python spotify-auto-linker.py", "Auto-Linking Catalog to Spotify"),
        ("python enhanced-spotify-insights.py", "Collecting Spotify Audio Features"),
        ("python mood-context-analyzer.py", "Analyzing Mood & Context Metadata"),
        ("python viral-prediction-model.py", "Predicting Viral Potential"),
        ("python growth-dashboard.py", "Generating Master Dashboard")
    ]
    
    for command, description in commands:
        success = run_command(command, description)
        if not success:
            print(f"\n❌ System stopped due to error in: {description}")
            print(f"💡 You can run individual scripts to troubleshoot:")
            print(f"   - {command}")
            sys.exit(1)
    
    print(f"\n{'='*70}")
    print("🎉 ENHANCED ANALYSIS SYSTEM OPERATIONAL!")
    print(f"🕒 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    print("\n🎯 SYSTEM CAPABILITIES:")
    print("   📚 Complete catalog with enhanced album metadata")
    print("   🔗 Spotify tracks automatically linked")
    print("   🎭 Mood & context classification for each track")
    print("   🚀 Viral potential prediction across platforms")
    print("   📊 Comprehensive growth and performance dashboard")
    print("   🎯 Actionable recommendations for each track")
    
    print("\n📊 ANALYSIS OUTPUTS:")
    print("   🎵 40 tracks across 4 albums analyzed")
    print("   🎭 Mood classifications: Energy + Emotional + Compound")
    print("   🎯 Context matching: 7+ use cases per track")
    print("   📱 Platform viral scores: TikTok, Instagram, YouTube, Playlists")
    print("   📈 Trend alignment scoring")
    print("   ⏰ Viral timeline predictions")
    
    print("\n🚀 QUICK COMMANDS:")
    print("   📈 Full Dashboard: python growth-dashboard.py")
    print("   🎭 Mood Analysis: python mood-context-analyzer.py")
    print("   🚀 Viral Predictions: python viral-prediction-model.py")
    print("   ⚡ Quick Stats: python growth-dashboard.py --quick")
    
    print("\n💰 MONETIZATION INTELLIGENCE:")
    print("   🎯 Sync opportunities by mood & context")
    print("   📱 Platform-specific viral strategies")
    print("   📋 Playlist placement recommendations")
    print("   🔥 High-priority tracks for marketing investment")
    print("   🌍 Geographic and demographic targeting insights")

if __name__ == "__main__":
    main()