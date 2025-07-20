const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');
const { LambdaClient, InvokeCommand } = require('@aws-sdk/client-lambda');
const fs = require('fs/promises');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');
const child_process = require('child_process');
const streamPipeline = promisify(pipeline);

const REGION = process.env.AWS_REGION || 'eu-central-1';
const S3_BUCKET = process.env.S3_BUCKET;
const SHORTS_BUCKET = process.env.SHORTS_BUCKET;
const LAMBDA_NAME = process.env.SHORTS_LAMBDA || 'shortsGenerator';

const s3 = new S3Client({ region: REGION });
const lambda = new LambdaClient({ region: REGION });

async function download(key, file) {
  const res = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }));
  await streamPipeline(res.Body, fs.createWriteStream(file));
}

async function splitAudio(file, dir) {
  const { stdout } = await execAsync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 ${file}`);
  const duration = parseFloat(stdout.trim());
  const seg = duration / 3;
  const segments = [];
  for (let i = 0; i < 3; i++) {
    const start = Math.floor(seg * i);
    const out = path.join(dir, `segment${i}.mp3`);
    await execAsync(`ffmpeg -y -i ${file} -ss ${start} -t ${Math.floor(seg)} ${out}`);
    segments.push({ path: out, start });
  }
  return segments;
}

function execAsync(cmd) {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve({ stdout, stderr });
    });
  });
}

async function upload(file, key) {
  const body = await fs.readFile(file);
  await s3.send(new PutObjectCommand({ Bucket: SHORTS_BUCKET, Key: key, Body: body }));
}

async function invokeLambda(payload) {
  const command = new InvokeCommand({
    FunctionName: LAMBDA_NAME,
    Payload: Buffer.from(JSON.stringify(payload))
  });
  const res = await lambda.send(command);
  return JSON.parse(Buffer.from(res.Payload).toString());
}

async function run() {
  const key = process.argv[2];
  if (!key) {
    console.error('Usage: node scripts/youtubeShortsPipeline.js <s3-key>');
    process.exit(1);
  }
  if (!S3_BUCKET || !SHORTS_BUCKET) throw new Error('S3_BUCKET and SHORTS_BUCKET env vars required');
  const tmpDir = path.join('/tmp', `track_${Date.now()}`);
  await fs.mkdir(tmpDir, { recursive: true });
  const localFile = path.join(tmpDir, path.basename(key));
  await download(key, localFile);
  const segments = await splitAudio(localFile, tmpDir);
  for (const seg of segments) {
    const segKey = `segments/${path.basename(key, path.extname(key))}_${seg.start}.mp3`;
    await upload(seg.path, segKey);
    const result = await invokeLambda({ bucket: SHORTS_BUCKET, key: segKey, start: 0, duration: 15, text: 'New drop!' });
    console.log('Generated short at', result.output_key);
  }
  console.log('Pipeline finished');
}

run().catch(err => {
  console.error('Pipeline failed', err);
  process.exit(1);
});

