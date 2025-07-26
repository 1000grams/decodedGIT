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

console.log('Automation scheduler started.');

