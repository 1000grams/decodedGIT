import json
import subprocess

def lambda_handler(event, context):
    artist_id = event.get("queryStringParameters", {}).get("artistId", "")

    if not artist_id:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "artistId is required"})
        }

    try:
        result = subprocess.check_output([
            "python3", "growth-dashboard.py", f"--artistId={artist_id}"
        ])
        return {
            "statusCode": 200,
            "headers": {"Content-Type": "application/json"},
            "body": result.decode("utf-8")
        }
    except subprocess.CalledProcessError as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }