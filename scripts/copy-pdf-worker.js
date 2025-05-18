import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination paths
const sourceDir = path.join(__dirname, '../node_modules/pdfjs-dist/build');
const destDir = path.join(__dirname, '../public');

// Files to copy from build directory
const files = [
  'pdf.worker.js',
  'pdf.worker.min.js',
  'pdf.worker.mjs',
  'pdf.worker.min.mjs'
];

// WASM files to copy
const wasmFiles = [
  { src: '../wasm/openjpeg.wasm', dest: 'openjpeg.wasm' },
  { src: '../wasm/qcms_bg.wasm', dest: 'qcms_bg.wasm' },
  { src: '../wasm/feature_groups_bg.wasm', dest: 'feature_groups_bg.wasm' }
];

// Create directories for cmaps and standard fonts
const directories = [
  { path: 'cmaps', src: '../cmaps' },
  { path: 'standard_fonts', src: '../standard_fonts' }
];

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Copy each file
files.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  
  // Check if source file exists
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Successfully copied ${file} to public directory`);
    } catch (err) {
      console.error(`Failed to copy ${file}:`, err);
    }
  } else {
    console.warn(`Source file ${file} does not exist`);
  }
});

// Copy WASM files
wasmFiles.forEach(file => {
  const sourcePath = path.join(sourceDir, file.src);
  const destPath = path.join(destDir, file.dest);
  
  // Check if source file exists
  if (fs.existsSync(sourcePath)) {
    try {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`Successfully copied ${file.src} to public directory as ${file.dest}`);
    } catch (err) {
      console.error(`Failed to copy ${file.src}:`, err);
    }
  } else {
    console.warn(`Source file ${file.src} does not exist`);
  }
});

// Create directories for compatibility
for (const dir of ['cmaps', 'standard_fonts']) {
  const dirPath = path.join(destDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created ${dir} directory`);
  }
}

// Copy font files if they exist
const fontSrcDir = path.join(__dirname, '../node_modules/pdfjs-dist/standard_fonts');
const fontDestDir = path.join(destDir, 'standard_fonts');

if (fs.existsSync(fontSrcDir)) {
  try {
    const fontFiles = fs.readdirSync(fontSrcDir);
    fontFiles.forEach(file => {
      if (file.endsWith('.pfb') || file.endsWith('.afm')) {
        const srcFontPath = path.join(fontSrcDir, file);
        const destFontPath = path.join(fontDestDir, file);
        fs.copyFileSync(srcFontPath, destFontPath);
        console.log(`Copied font file: ${file}`);
      }
    });
  } catch (err) {
    console.warn('Error copying standard fonts:', err);
  }
}

console.log('PDF.js worker, WASM files, and fonts copy completed!');
