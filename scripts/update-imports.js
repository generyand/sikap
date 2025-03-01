const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Function to process a file and update imports
function updateImportsInFile(filePath) {
  try {
    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if the file imports from @prisma/client
    if (content.includes('@prisma/client')) {
      console.log(`Processing: ${filePath}`);
      
      // Replace imports from @prisma/client with imports from our local types
      let updatedContent = content.replace(
        /import\s+{([^}]+)}\s+from\s+['"]@prisma\/client['"]/g, 
        'import {$1} from \'@/types\''
      );
      
      // Also replace any remaining direct imports
      updatedContent = updatedContent.replace(
        /import\s+([^{]+)\s+from\s+['"]@prisma\/client['"]/g, 
        'import $1 from \'@/types\''
      );
      
      // Write the updated content back to the file
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      console.log(`✅ Updated imports in: ${filePath}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error(`❌ Error processing file ${filePath}:`, error.message);
    return false;
  }
}

// Function to recursively process directories
function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  let updatedFiles = 0;
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isDirectory()) {
      // Skip node_modules and .git directories
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'out') {
        updatedFiles += processDirectory(filePath);
      }
    } else if (stats.isFile() && 
              (filePath.endsWith('.ts') || 
               filePath.endsWith('.tsx') || 
               filePath.endsWith('.js') || 
               filePath.endsWith('.jsx'))) {
      // Process TypeScript and JavaScript files
      if (updateImportsInFile(filePath)) {
        updatedFiles++;
      }
    }
  }
  
  return updatedFiles;
}

// Main function
function main() {
  console.log('Starting import update process...');
  const rootDir = path.resolve(__dirname, '..');
  const srcDir = path.join(rootDir, 'src');
  
  // Process the src directory
  const updatedFiles = processDirectory(srcDir);
  
  console.log(`\nProcess completed. Updated ${updatedFiles} files.`);
  console.log('\nRunning TypeScript check...');
  
  try {
    // Run TypeScript check to validate the changes
    execSync('npm run typecheck', { stdio: 'inherit' });
    console.log('✅ TypeScript check passed!');
  } catch (error) {
    console.error('❌ TypeScript check failed. You may need to manually fix some type issues.');
  }
}

// Run the main function
main(); 