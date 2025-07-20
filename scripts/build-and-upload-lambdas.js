const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const AWS = require("aws-sdk");

const s3 = new AWS.S3({ region: "eu-central-1" });

const lambdaDir = path.join(__dirname, "backend", "lambda");
const outputDir = path.join(__dirname, "lambda-zips");
const bucketName = "decodedmusic-lambda-code";

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

const lambdaFolders = fs
  .readdirSync(lambdaDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

(async () => {
  for (const folder of lambdaFolders) {
    const lambdaPath = path.join(lambdaDir, folder);
    const zipPath = path.join(outputDir, `${folder}.zip`);

    try {
      console.log(`📦 Building ${folder}...`);

      // Install dependencies
      if (fs.existsSync(path.join(lambdaPath, "package.json"))) {
        execSync("npm install", { cwd: lambdaPath, stdio: "inherit" });
      }

      // Zip folder
      execSync(`powershell Compress-Archive -Path "${lambdaPath}\\*" -DestinationPath "${zipPath}" -Force`);
      console.log(`✅ Zipped ${folder}.zip`);

      // Upload to S3
      const fileContent = fs.readFileSync(zipPath);
      await s3
        .putObject({
          Bucket: bucketName,
          Key: `${folder}.zip`,
          Body: fileContent,
          ContentType: "application/zip",
        })
        .promise();
      console.log(`🚀 Uploaded to S3: ${bucketName}/${folder}.zip\n`);
    } catch (err) {
      console.error(`❌ Failed for ${folder}:`, err.message);
    }
  }
})();
