const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'fix-artistid');
const targetDir = path.join(__dirname, 'src', 'fix-artistid');

function copyDirectory(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach(file => {
    const sourcePath = path.join(source, file);
    const targetPath = path.join(target, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, targetPath);
    } else {
      fs.copyFileSync(sourcePath, targetPath);
    }
  });
}

copyDirectory(sourceDir, targetDir);
console.log('Integration of fix-artistid completed.');