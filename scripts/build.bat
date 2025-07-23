@echo off
REM build.bat - Automated build with AWS Secrets Manager env injection for Windows

REM Set your AWS Secret name and region
set SECRET_NAME=decodedmusic-prod-env
set AWS_REGION=eu-central-1

REM Fetch secrets from AWS Secrets Manager and write to .env
echo Fetching secrets from AWS Secrets Manager...
aws secretsmanager get-secret-value --secret-id %SECRET_NAME% --region %AWS_REGION% --query SecretString --output text > temp_env.txt

REM Remove quotes and write to .env
powershell -Command "Get-Content temp_env.txt | Out-File -Encoding ASCII .env"
del temp_env.txt

echo Building React app...
npm run build

echo Build complete. You can now deploy your build folder.
