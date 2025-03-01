const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

// Get app name from package.json
const appName = require('../package.json').name;

// Define cache directories based on platform
let cachePaths = [];

if (process.platform === 'win32') {
  // Windows cache paths
  cachePaths = [
    path.join(process.env.APPDATA, appName, 'Cache'),
    path.join(process.env.APPDATA, appName, 'Code Cache'),
    path.join(process.env.APPDATA, appName, 'GPUCache'),
  ];
} else if (process.platform === 'darwin') {
  // macOS cache paths
  cachePaths = [
    path.join(process.env.HOME, 'Library', 'Application Support', appName, 'Cache'),
    path.join(process.env.HOME, 'Library', 'Application Support', appName, 'Code Cache'),
    path.join(process.env.HOME, 'Library', 'Application Support', appName, 'GPUCache'),
  ];
} else {
  // Linux cache paths
  cachePaths = [
    path.join(process.env.HOME, '.config', appName, 'Cache'),
    path.join(process.env.HOME, '.config', appName, 'Code Cache'),
    path.join(process.env.HOME, '.config', appName, 'GPUCache'),
  ];
}

// Function to clean cache directories
function cleanCache() {
  console.log('Cleaning Electron cache directories...');
  
  let cleaned = false;
  
  cachePaths.forEach(cachePath => {
    if (fs.existsSync(cachePath)) {
      try {
        rimraf.sync(cachePath);
        console.log(`✅ Removed: ${cachePath}`);
        cleaned = true;
      } catch (error) {
        console.error(`❌ Failed to remove: ${cachePath}`, error.message);
      }
    } else {
      console.log(`⚠️ Directory does not exist: ${cachePath}`);
    }
  });
  
  if (cleaned) {
    console.log('Electron cache cleaned successfully!');
  } else {
    console.log('No cache directories needed cleaning.');
  }
}

// Execute the cleaning function
cleanCache(); 