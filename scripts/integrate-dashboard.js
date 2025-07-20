const fs   = require('fs');
const path = require('path');

function integrateDashboard() {
  console.log('🔧 Integrating Dashboard with React Build...');

  try {
    // Look for static dashboard files in the frontend directory
    const projectRoot = path.resolve(__dirname, '..');
    const generatedFiles = [
      { from: path.join(projectRoot, 'scripts', 'FRONTEND INTEGRATION.html'), to: 'public/dashboard-standalone.html' },
      { from: path.join(projectRoot, 'dashboard.js'),                        to: 'public/dashboard-standalone.js'   },
      { from: path.join(projectRoot, 'dashboard.css'),                       to: 'public/dashboard-standalone.css'  },
      { from: path.join(projectRoot, 'test-dashboard.html'),                 to: 'public/test-dashboard.html'       }
    ];

    generatedFiles.forEach(file => {
      if (fs.existsSync(file.from)) {
        const targetDir = path.dirname(file.to);
        if (!fs.existsSync(targetDir)) {
          fs.mkdirSync(targetDir, { recursive: true });
        }
        fs.copyFileSync(file.from, file.to);
        console.log(`✅ Copied ${path.basename(file.from)} → ${file.to}`);
      } else {
        console.warn(`⚠️ Missing at project root: ${path.basename(file.from)}`);
      }
    });

    // Update reference to apiconfig.js
    const servicesDir = 'src/services';
    const apiConfigPath = path.join(servicesDir, 'apiconfig.js');
    if (!fs.existsSync(apiConfigPath)) {
      console.error('❌ apiconfig.js is missing. Ensure it is generated correctly.');
    }

    console.log('🎉 Dashboard integration complete!');
  } catch (error) {
    console.error('❌ Integration failed:', error);
  }
}

if (require.main === module) {
  integrateDashboard();
}

module.exports = { integrateDashboard };
