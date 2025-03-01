const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');

console.log('Starting Prisma cleanup...');

// Get the root directory of the project
const rootDir = path.resolve(__dirname, '..');

// List of files and directories to be removed
const toRemove = [
  // Prisma directory and configuration
  path.join(rootDir, 'prisma'),
  
  // Prisma scripts
  path.join(rootDir, 'scripts', 'prepare-prisma.js'),
  path.join(rootDir, 'scripts', 'fix-browser-imports.js'),
  
  // Any stub files
  path.join(rootDir, 'src', 'renderer', 'prisma-browser-stub.ts'),
  path.join(rootDir, 'src', 'renderer', 'prisma-browser-stub.js'),
];

// Function to delete a file or directory
function deleteItem(itemPath) {
  try {
    if (fs.existsSync(itemPath)) {
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        // Use rimraf to delete directories
        rimraf.sync(itemPath);
        console.log(`✅ Removed directory: ${itemPath}`);
      } else {
        // Delete file
        fs.unlinkSync(itemPath);
        console.log(`✅ Removed file: ${itemPath}`);
      }
      return true;
    } else {
      console.log(`⚠️ Item does not exist: ${itemPath}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Failed to remove: ${itemPath}`, error.message);
    return false;
  }
}

// Remove each item in the list
let removedCount = 0;
for (const item of toRemove) {
  if (deleteItem(item)) {
    removedCount++;
  }
}

console.log(`\nPrisma cleanup completed. Removed ${removedCount} items.`);
console.log('Your application has been fully migrated from Prisma to Sequelize!'); 