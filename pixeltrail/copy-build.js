import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const buildDir = path.join(__dirname, 'dist');
const targetDir = __dirname;

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
  console.log('📦 Starting post-build copy...');
  
  // Copy built index.html
  const srcHtml = path.join(buildDir, 'index.html');
  const destHtml = path.join(targetDir, 'index.html');
  if (fs.existsSync(srcHtml)) {
    fs.copyFileSync(srcHtml, destHtml);
    console.log('✅ Copied index.html');
  } else {
    console.warn('⚠️ No index.html found in dist!');
  }

  // Copy built assets directory
  const srcAssets = path.join(buildDir, 'assets');
  const destAssets = path.join(targetDir, 'assets');
  
  if (fs.existsSync(destAssets)) {
    console.log('🧹 Cleaning old assets directory...');
    deleteFolderRecursive(destAssets);
  }
  
  if (fs.existsSync(srcAssets)) {
    copyRecursiveSync(srcAssets, destAssets);
    console.log('✅ Copied assets directory');
  } else {
    console.warn('⚠️ No assets directory found in dist!');
  }

  // Clean up dist
  if (fs.existsSync(buildDir)) {
    console.log('🧹 Cleaning up dist folder...');
    deleteFolderRecursive(buildDir);
  }
  
  console.log('✨ Build copy completed successfully!');
} catch (error) {
  console.error('❌ Build copy failed:', error.message);
  process.exit(1);
}
