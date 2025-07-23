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
    """Run the complete Spotify insights system"""
    print("🎧 RUE DE VIVRE - COMPLETE SPOTIFY INSIGHTS SYSTEM")
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    commands = [
        ("python create-insights-table.py", "Creating DynamoDB Tables"),
        ("python load-ascap-works-albums.py", "Loading Album Catalog with Enhanced Metadata"),
        ("python spotify-auto-linker.py", "Auto-Linking Catalog to Spotify Tracks"),
        ("python enhanced-spotify-insights.py", "Collecting Enhanced Spotify Insights"),
        ("python growth-dashboard.py", "Generating Comprehensive Growth Dashboard")
    ]
    
    for command, description in commands:
        success = run_command(command, description)
        if not success:
            print(f"\n❌ System stopped due to error in: {description}")
            print(f"💡 You can run individual scripts to troubleshoot:")
            print(f"   - {command}")
            sys.exit(1)
    
    print(f"\n{'='*70}")
    print("✅ COMPLETE SPOTIFY INSIGHTS SYSTEM OPERATIONAL!")
    print(f"🕒 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    print("\n🎯 SYSTEM OVERVIEW:")
    print("   📚 Album catalog loaded (4 albums: Okina Sakana, Azita, RAVE, Trois)")
    print("   🔗 Spotify tracks auto-linked to catalog")
    print("   📊 Enhanced Spotify insights collected")
    print("   📈 Growth metrics calculated and stored")
    print("   🎯 Comprehensive dashboard generated")
    
    print("\n📊 QUICK COMMANDS:")
    print("   📈 Full Dashboard: python growth-dashboard.py")
    print("   ⚡ Quick Stats: python growth-dashboard.py --quick")
    print("   🔄 Update Data: python enhanced-spotify-insights.py")
    print("   🔗 Re-link Tracks: python spotify-auto-linker.py")
    print("   📚 Reload Catalog: python load-ascap-works-albums.py")
    
    print("\n🚀 NEXT STEPS:")
    print("   1. Set up weekly cron job for enhanced-spotify-insights.py")
    print("   2. Monitor growth dashboard for trends")
    print("   3. Use sync metadata for playlist placement")
    print("   4. Add YouTube and Apple Music linking")

if __name__ == "__main__":
    main()