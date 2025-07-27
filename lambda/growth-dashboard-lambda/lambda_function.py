import json
import subprocess

CORS_HEADERS = {
    "Access-Control-Allow-Origin": "https://decodedmusic.com",
    "Access-Control-Allow-Headers": "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Content-Type": "application/json"
}


def lambda_handler(event, context):
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    artist_id = event.get("queryStringParameters", {}).get("artistId", "")
    if not artist_id:
        return {
            "statusCode": 400,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": "artistId is required"})
        }

    try:
        result = subprocess.check_output([
            "python3", "growth-dashboard.py", f"--artistId={artist_id}"
        ])
        return {
            "statusCode": 200,
            "headers": CORS_HEADERS,
            "body": result.decode("utf-8")
        }
    except subprocess.CalledProcessError as e:
        return {
            "statusCode": 500,
            "headers": CORS_HEADERS,
            "body": json.dumps({"error": str(e)})
        }
