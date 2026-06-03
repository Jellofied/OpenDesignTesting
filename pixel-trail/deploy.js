import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const pixelTrailDir = __dirname;
const tempDeployDir = path.join(pixelTrailDir, 'deploy_temp');
const buildDir = path.join(pixelTrailDir, 'dist');

// Helper to recursively copy directories
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Helper to delete directory recursively
function deleteFolderRecursive(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

try {
  console.log('🚀 Starting custom subfolder deployment...');

  // 1. Clean up old temp dir if exists
  if (fs.existsSync(tempDeployDir)) {
    console.log('🧹 Cleaning up old temporary deploy directory...');
    deleteFolderRecursive(tempDeployDir);
  }

  // 2. Create fresh temp dir
  fs.mkdirSync(tempDeployDir, { recursive: true });

  // 3. Copy other repositories/components from root into temp dir
  console.log('📦 Copying existing showcase folders and index.html...');
  const rootFiles = fs.readdirSync(rootDir);
  rootFiles.forEach((file) => {
    // Exclude git files, node_modules, temp folders, and our own pixel-trail project folder
    if (
      file === 'pixel-trail' ||
      file === '.git' ||
      file === '.github' ||
      file === '.gitignore' ||
      file.startsWith('.')
    ) {
      return;
    }
    
    const srcPath = path.join(rootDir, file);
    const destPath = path.join(tempDeployDir, file);
    
    copyRecursiveSync(srcPath, destPath);
    console.log(`   - Copied: ${file}`);
  });

  // 4. Copy build files of pixel-trail into tempDeployDir/pixel-trail
  console.log('⚡ Copying built React application into pixel-trail subfolder...');
  const destPixelTrailPath = path.join(tempDeployDir, 'pixel-trail');
  copyRecursiveSync(buildDir, destPixelTrailPath);

  // 5. Deploy tempDeployDir to gh-pages branch
  console.log('📤 Pushing build to gh-pages using gh-pages CLI...');
  // We run gh-pages from the pixel-trail folder, pointing it to our temp folder
  // We use npx to ensure gh-pages is resolved correctly
  execSync(`npx gh-pages -d deploy_temp`, {
    cwd: pixelTrailDir,
    stdio: 'inherit',
  });

  // 6. Clean up
  console.log('🧹 Cleaning up temporary deploy folder...');
  deleteFolderRecursive(tempDeployDir);

  console.log('✨ Deployment completed successfully!');
} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  // Ensure cleanup on failure
  if (fs.existsSync(tempDeployDir)) {
    deleteFolderRecursive(tempDeployDir);
  }
  process.exit(1);
}
