@echo off
REM Setup script for Cognito OIDC Node.js Auth Example
cd /d %~dp0

REM Install dependencies
call npm install ejs express express-session openid-client

echo.
echo Setup complete!
echo To start the server, run:
echo    node app.js

.\setup-auth.bat
