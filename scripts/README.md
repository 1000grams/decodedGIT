# Scripts Directory

This directory contains utility scripts for deployment and testing purposes. Below is a list of available scripts and their usage:

1. **uploadAllToS3.js**
   - Uploads all ZIP files from the `backend/lambda` directory to the specified S3 bucket.
   - Usage: `node uploadAllToS3.js`

2. **uploadToS3.js**
   - Uploads a specific ZIP file to the specified S3 bucket.
   - Usage: `node uploadToS3.js <filename>`

3. **test-backend-connection.js**
   - Tests the connection to backend endpoints.
   - Usage: `node test-backend-connection.js`

4. **integrate-fix-artistid.js**
   - Integrates the `fix-artistid` directory into the project.
   - Usage: `node integrate-fix-artistid.js`
