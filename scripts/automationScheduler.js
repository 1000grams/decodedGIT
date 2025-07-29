const path = require('path');
const { spawn } = require('child_process');
const cron = require('node-cron');

function runScript(relPath) {
  const scriptPath = path.join(__dirname, relPath);
  const child = spawn(process.execPath, [scriptPath], { stdio: 'inherit' });
  child.on('close', code => {
    if (code !== 0) {
      console.error(`${relPath} exited with code ${code}`);
    }
  });
}

// Run a Python script with python3
function runPythonScript(relPath) {
  const scriptPath = path.join(__dirname, relPath);
  const child = spawn('python3', [scriptPath], { stdio: 'inherit' });
  child.on('close', code => {
    if (code !== 0) {
      console.error(`${relPath} exited with code ${code}`);
    }
  });
}

// Industry Buzz: daily at 07:00 UTC
cron.schedule('0 7 * * *', () => {
  console.log(`[${new Date().toISOString()}] Running musicManagementResearcher`);
  runScript('musicManagementResearcher.js');
});

// Weekly Analytics Snapshot: Tuesdays at 12:00 UTC
cron.schedule('0 12 * * 2', () => {
  console.log(`[${new Date().toISOString()}] Running weeklyStatsLogger`);
  runScript('../backend/handlers/weeklyStatsLogger.js');
});

// Weekly Spotify Insights: Mondays at 08:00 UTC
cron.schedule('0 8 * * 1', () => {
  console.log(`[${new Date().toISOString()}] Running weekly Spotify insights`);
  runPythonScript('run-weekly-insights.py');
});

console.log('Automation scheduler started.');

