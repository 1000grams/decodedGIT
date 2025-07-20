const { exec } = require('child_process');

function run() {
  const cmd = process.platform === 'win32' ? 'python' : 'python3';
  const child = exec(`${cmd} trend-prediction.py`, (error, stdout, stderr) => {
    if (error) {
      console.error('Error running trend-prediction.py:', error.message);
      if (stderr) console.error(stderr);
      process.exit(1);
    }
    console.log(stdout);
    if (stderr) console.error(stderr);
  });

  child.stdout.pipe(process.stdout);
  child.stderr.pipe(process.stderr);
}

run();
