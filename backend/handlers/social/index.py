import os
import json
import random
import tempfile
import subprocess

import boto3
import requests
import cv2
import numpy as np

REGION = os.environ.get('AWS_REGION', 'eu-central-1')
MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'OPTIONS,POST',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
}

bedrock = boto3.client('bedrock-runtime', region_name=REGION)
s3 = boto3.client('s3')
polly = boto3.client('polly')
secrets = boto3.client('secretsmanager')
ssm = boto3.client('ssm')

FACEBOOK_LINKS = [
    'https://music.apple.com/us/artist/rue-de-vivre/1802574638',
    'https://www.youtube.com/@ruedevivre',
    'https://open.spotify.com/artist/293x3NAIGPR4RCJrFkzs0P'
]
INSTAGRAM_LINKS = [
    'https://open.spotify.com/artist/293x3NAIGPR4RCJrFkzs0P',
    'https://www.youtube.com/@ruedevivre',
    'https://www.instagram.com/kaiserinstreetwear/'
]


def _pick_link(links):
    return random.choice(links)


def _invoke_bedrock(prompt, max_tokens):
    body = json.dumps({'prompt': prompt, 'max_tokens': max_tokens})
    resp = bedrock.invoke_model(
        modelId=MODEL_ID,
        contentType='application/json',
        accept='application/json',
        body=body
    )
    payload = json.loads(resp['body'].read())
    return payload.get('completion', '').strip()


def _load_facebook_config():
    token = os.environ.get('FACEBOOK_TOKEN')
    if not token and os.environ.get('FACEBOOK_TOKEN_SECRET'):
        sec = secrets.get_secret_value(SecretId=os.environ['FACEBOOK_TOKEN_SECRET'])
        try:
            token = json.loads(sec['SecretString']).get('token')
        except Exception:
            token = sec['SecretString']
    page_ids = os.environ.get('FACEBOOK_PAGE_IDS')
    if not page_ids and os.environ.get('FACEBOOK_PAGE_IDS_PARAM'):
        param = ssm.get_parameter(Name=os.environ['FACEBOOK_PAGE_IDS_PARAM'])
        page_ids = param['Parameter']['Value']
    ids = [p.strip() for p in (page_ids or '').split(',') if p.strip()]
    return token, ids


def _post_facebook(event):
    token, page_ids = _load_facebook_config()
    if not token:
        raise Exception('FACEBOOK_TOKEN not set')
    if not page_ids:
        raise Exception('FACEBOOK_PAGE_IDS not configured')
    topic = event.get('topic', 'latest news')
    link = _pick_link(FACEBOOK_LINKS)
    prompt = f"Write a short Facebook post about {topic}. Include a playful call to action and end with this link: {link}"
    message = _invoke_bedrock(prompt, 120) + f"\n{link}"
    for pid in page_ids:
        url = f"https://graph.facebook.com/v19.0/{pid}/feed"
        requests.post(url, params={'access_token': token, 'message': message})
    return {'posted': len(page_ids), 'message': message}


def _get_trending_topic():
    try:
        url = 'https://trends.google.com/trends/api/dailytrends?hl=en-US&tz=0&geo=US&ns=15'
        res = requests.get(url, timeout=10)
        data = json.loads(res.text.lstrip(")]}'"))
        day = data['default']['trendingSearchesDays'][0]
        trend = day['trendingSearches'][0]['title']['query']
        return trend or 'music news'
    except Exception:
        return 'music news'


def _post_trending(event):
    token = os.environ.get('INSTAGRAM_TOKEN')
    user_id = os.environ.get('INSTAGRAM_USER_ID')
    if not token or not user_id:
        raise Exception('Instagram credentials missing')
    topic = _get_trending_topic()
    link = _pick_link(INSTAGRAM_LINKS)
    prompt = (
        f"Topic: {topic} is trending. Write a humorous social caption in Carol Leifer's stand-up style. "
        f"Make a self-deprecating joke then plug Rue de Vivre's music with this link: {link}"
    )
    caption = _invoke_bedrock(prompt, 150)
    image_url = os.environ.get('POST_IMAGE_URL', 'https://decodedmusic.com/logo.png')
    url = f"https://graph.facebook.com/v19.0/{user_id}/media"
    requests.post(url, params={'access_token': token, 'caption': caption, 'image_url': image_url})
    return {'message': 'post queued', 'topic': topic, 'link': link}


def _generate_short(event):
    bucket = event['bucket']
    key = event['key']
    start = float(event.get('start', 0))
    duration = float(event.get('duration', 15))
    text = event.get('text', 'Check this out!')
    output_bucket = os.environ.get('SHORTS_BUCKET')
    if not output_bucket:
        raise Exception('SHORTS_BUCKET environment variable required')

    with tempfile.TemporaryDirectory() as tmp:
        audio_path = os.path.join(tmp, 'audio.mp3')
        trimmed = os.path.join(tmp, 'trimmed.mp3')
        overlay_audio = os.path.join(tmp, 'overlay.mp3')
        video_frames = os.path.join(tmp, 'video.mp4')
        final_out = os.path.join(tmp, 'final.mp4')

        s3.download_file(bucket, key, audio_path)
        subprocess.run(['ffmpeg', '-y', '-i', audio_path, '-ss', str(start), '-t', str(duration), trimmed], check=True)

        resp = polly.synthesize_speech(Text=text, OutputFormat='mp3', VoiceId=os.environ.get('POLLY_VOICE', 'Joanna'))
        with open(overlay_audio, 'wb') as f:
            f.write(resp['AudioStream'].read())

        width, height = 720, 1280
        fps = 30
        out = cv2.VideoWriter(video_frames, cv2.VideoWriter_fourcc(*'mp4v'), fps, (width, height))
        for _ in range(int(duration * fps)):
            img = np.zeros((height, width, 3), dtype=np.uint8)
            cv2.putText(img, text, (40, height // 2), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            out.write(img)
        out.release()

        subprocess.run([
            'ffmpeg', '-y', '-i', video_frames, '-i', trimmed, '-i', overlay_audio,
            '-filter_complex', '[1][2]amix=inputs=2:duration=first[a]',
            '-map', '0:v', '-map', '[a]', '-shortest', final_out
        ], check=True)

        out_key = f"shorts/{os.path.splitext(os.path.basename(key))[0]}_{int(start)}.mp4"
        s3.upload_file(final_out, output_bucket, out_key)
    return {'output_key': out_key}


def handler(event, context):
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': HEADERS, 'body': ''}
    action = event.get('action')
    if action == 'facebook':
        body = _post_facebook(event)
    elif action == 'trending':
        body = _post_trending(event)
    elif action == 'shorts':
        body = _generate_short(event)
    else:
        return {'statusCode': 400, 'headers': HEADERS, 'body': json.dumps({'error': 'unknown action'})}
    return {'statusCode': 200, 'headers': HEADERS, 'body': json.dumps(body)}
