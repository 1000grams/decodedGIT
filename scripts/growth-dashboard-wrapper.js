const { exec } = require('child_process');
const path = require('path');

// Path to the Python script
const pythonScriptPath = path.join(__dirname, '../../growth-dashboard.py');

// Function to execute the Python script
function runGrowthDashboard(args = []) {
    return new Promise((resolve, reject) => {
        const command = `python ${pythonScriptPath} ${args.join(' ')}`;
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing script: ${error.message}`);
                reject(stderr);
            } else {
                resolve(stdout);
            }
        });
    });
}

// Example usage
if (require.main === module) {
    runGrowthDashboard(process.argv.slice(2))
        .then(output => console.log(output))
        .catch(err => console.error(err));
}

module.exports = { runGrowthDashboard };
