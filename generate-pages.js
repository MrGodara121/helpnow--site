// ============================================
// HELPNOW.COM - PAGE GENERATOR SCRIPT
// Run: node generate-pages.js
// ============================================

const fs = require('fs');
const path = require('path');

console.log('📄 HelpNow Page Generator');
console.log('📍 This script will generate pages from Google Sheets data');
console.log('⚠️  Configure your SHEET_ID and API_KEY before running');
console.log('');
console.log('To enable auto-generation:');
console.log('1. Get Google Sheets API key from Google Cloud Console');
console.log('2. Update SHEET_ID and API_KEY variables below');
console.log('3. Run: node generate-pages.js');
console.log('');

// Configuration - Update these
const SHEET_ID = 'YOUR_SHEET_ID';
const API_KEY = 'YOUR_API_KEY';

const PAGES_DIR = path.join(__dirname, 'pages');

if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR);
    console.log('✅ Created pages directory');
}

console.log('🚀 Ready to generate pages!');
console.log(`📁 Pages will be saved to: ${PAGES_DIR}`);
