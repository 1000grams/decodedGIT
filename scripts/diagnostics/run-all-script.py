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
    print("🎧 RUE DE VIVRE - SPOTIFY INSIGHTS SYSTEM")
    print(f"🕒 Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    commands = [
        ("python create-insights-table.py", "Creating DynamoDB Tables"),
        ("python enhanced-spotify-insights.py", "Collecting Enhanced Spotify Insights"),
        ("python growth-dashboard.py", "Generating Growth Dashboard")
    ]
    
    for command, description in commands:
        success = run_command(command, description)
        if not success:
            print(f"\n❌ System stopped due to error in: {description}")
            sys.exit(1)
    
    print(f"\n{'='*70}")
    print("✅ SPOTIFY INSIGHTS SYSTEM COMPLETE!")
    print(f"🕒 Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*70)
    
    print("\n📊 Quick Commands:")
    print("   📈 Full Dashboard: python growth-dashboard.py")
    print("   ⚡ Quick Stats: python growth-dashboard.py --quick")
    print("   🔄 Update Data: python enhanced-spotify-insights.py")
    print("   🔗 Link Tracks: python spotify-auto-linker.py")

if __name__ == "__main__":
    main()