import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

console.log('🚀 Building THE FROGGIT for production deploy...');

// 1. Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 2. Read index.html
let html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf-8');

// 3. Read & inline CSS files
const cssFiles = [
  'src/styles/tokens.css',
  'src/styles/components.css',
  'src/styles/animations.css'
];

let inlinedCss = '';
for (const file of cssFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    inlinedCss += `\n/* === ${file} === */\n` + fs.readFileSync(filePath, 'utf-8');
  }
}

// Replace CSS <link> tags with single <style> tag
const cssLinkRegex = /<!--\s*Segregated Production Stylesheets\s*-->[\s\S]*?<link\s+rel="stylesheet"\s+href="\.\/src\/styles\/animations\.css"\s*\/>/i;
const styleTag = `<style>\n${inlinedCss}\n</style>`;

if (cssLinkRegex.test(html)) {
  html = html.replace(cssLinkRegex, styleTag);
} else {
  // Fallback: replace any link to tokens/components/animations
  html = html.replace(/<link\s+rel="stylesheet"\s+href="\.\/src\/styles\/[^"]+"\s*\/?>/gi, '');
  html = html.replace('</head>', `${styleTag}\n</head>`);
}

// 4. Read & inline JS files in strict dependency order
const jsFiles = [
  'src/audio/ProceduralAudio.js',
  'src/state/gameState.js',
  'src/rendering/sceneAndShaders.js',
  'src/entities/todeRig.js',
  'src/world/courseBuilder.js',
  'src/entities/enemiesAndParticles.js',
  'src/ui/minimapAndWorldMap.js',
  'src/gameplay/mechanicsAndModals.js',
  'src/input/controls.js',
  'src/main.js'
];

let inlinedJs = '';
for (const file of jsFiles) {
  const filePath = path.join(rootDir, file);
  if (fs.existsSync(filePath)) {
    inlinedJs += `\n// ==========================================\n// === Module: ${file} ===\n// ==========================================\n` + fs.readFileSync(filePath, 'utf-8');
  }
}

// Replace JS <script src="./src/..."> tags with single <script> block
const jsScriptRegex = /<!--\s*Segregated Production JavaScript Modules[\s\S]*?<script\s+src="\.\/src\/main\.js"><\/script>/i;
const scriptTag = `<script>\n${inlinedJs}\n</script>`;

if (jsScriptRegex.test(html)) {
  html = html.replace(jsScriptRegex, scriptTag);
} else {
  html = html.replace(/<script\s+src="\.\/src\/[^"]+"><\/script>/gi, '');
  html = html.replace('</body>', `${scriptTag}\n</body>`);
}

// 5. Write to dist/index.html and dist/froggit.html
fs.writeFileSync(path.join(distDir, 'index.html'), html, 'utf-8');
fs.writeFileSync(path.join(distDir, 'froggit.html'), html, 'utf-8');
console.log(`✅ Generated dist/index.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);
console.log(`✅ Generated dist/froggit.html (${(Buffer.byteLength(html) / 1024).toFixed(1)} KB)`);

// 6. Copy src directory to dist/src for debugging & modular inspection
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(path.join(rootDir, 'src'), path.join(distDir, 'src'));
console.log('✅ Copied modular source files to dist/src/');

// 7. Copy docs if present
const docsSrc = path.join(rootDir, 'docs');
if (fs.existsSync(docsSrc)) {
  copyDir(docsSrc, path.join(distDir, 'docs'));
  console.log('✅ Copied documentation to dist/docs/');
}

console.log('🎉 Production build completed successfully! Deploy directory dist is ready.');
