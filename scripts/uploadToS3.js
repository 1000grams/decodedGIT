const fs = require('fs');
const AWS = require('aws-sdk');
const path = require('path');

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'your-s3-bucket-name';
const FILE_NAME = process.argv[2]; // passed in CLI, like: node uploadToS3.js authSignup.zip

if (!FILE_NAME) {
  console.error('❌ Please provide the zip file name, e.g., node uploadToS3.js authSignup.zip');
  process.exit(1);
}

// Dynamically resolve the project root and build paths
const PROJECT_ROOT = path.resolve(__dirname, '../..'); // Adjusted to locate the root of the consolidated project
const filePath = path.join(PROJECT_ROOT, 'lambda', FILE_NAME); // Updated to reflect the new lambda folder structure

try {
  const fileContent = fs.readFileSync(filePath);
  const params = {
    Bucket: BUCKET_NAME,
    Key: `lambdas/${FILE_NAME}`,
    Body: fileContent
  };

  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Upload failed:', err);
    } else {
      console.log(`✅ Uploaded successfully: ${data.Location}`);
    }
  });
} catch (err) {
  console.error(`❌ Failed to read file at ${filePath}`);
  console.error(err);
}
