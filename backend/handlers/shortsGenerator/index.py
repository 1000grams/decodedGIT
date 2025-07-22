import os
import json
import boto3
import tempfile
import subprocess

import cv2
import numpy as np

s3 = boto3.client('s3')
polly = boto3.client('polly')

OUTPUT_BUCKET = os.environ.get('SHORTS_BUCKET')
POLLY_VOICE = os.environ.get('POLLY_VOICE', 'Joanna')


def handler(event, context):
    """Create a short video clip with text overlay and spoken hook."""
    bucket = event['bucket']
    key = event['key']
    start = float(event.get('start', 0))
    duration = float(event.get('duration', 15))
    text = event.get('text', 'Check this out!')

    if not OUTPUT_BUCKET:
        raise Exception('SHORTS_BUCKET environment variable required')

    with tempfile.TemporaryDirectory() as tmp:
        audio_path = os.path.join(tmp, 'audio.mp3')
        trimmed = os.path.join(tmp, 'trimmed.mp3')
        overlay_audio = os.path.join(tmp, 'overlay.mp3')
        video_frames = os.path.join(tmp, 'video.mp4')
        final_out = os.path.join(tmp, 'final.mp4')

        s3.download_file(bucket, key, audio_path)
        subprocess.run([
            'ffmpeg','-y','-i',audio_path,'-ss',str(start),'-t',str(duration),trimmed
        ], check=True)

        resp = polly.synthesize_speech(Text=text, OutputFormat='mp3', VoiceId=POLLY_VOICE)
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
            'ffmpeg','-y','-i',video_frames,'-i',trimmed,'-i',overlay_audio,
            '-filter_complex','[1][2]amix=inputs=2:duration=first[a]','-map','0:v','-map','[a]','-shortest',final_out
        ], check=True)

        out_key = f"shorts/{os.path.splitext(os.path.basename(key))[0]}_{int(start)}.mp4"
        s3.upload_file(final_out, OUTPUT_BUCKET, out_key)

    return {'output_key': out_key}

