from datetime import datetime
from spotify_insights_tool import main

def run_weekly_insights():
    """Run weekly insights manually or via scheduler"""
    print(f"🕒 Running weekly insights at {datetime.now()}")
    try:
        report = main()
        print("✅ Weekly insights completed successfully")
        return report
    except Exception as e:
        print(f"❌ Weekly insights failed: {e}")
        return None

if __name__ == "__main__":
    run_weekly_insights()