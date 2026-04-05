// ============================================
// HELPNOW.COM - PAGE GENERATOR SCRIPT
// Run: node generate-pages.js
// ============================================

// ✅ UPDATED WITH YOUR SHEET ID
// ⚠️ NOTE: API Key is required for this script to work
// Get API Key from: https://console.cloud.google.com/

const fs = require('fs');
const path = require('path');

// ===== GOOGLE SHEET CONFIGURATION =====
const SHEET_ID = '11lJ0od8N_tesMpMRcguwPt1VFUg8oiiOBGMpBQ0ZwIE';

// 🔴 IMPORTANT: You need to get this from Google Cloud Console
// https://console.cloud.google.com/ → Enable Sheets API → Create Credentials → API Key
const API_KEY = 'YOUR_GOOGLE_API_KEY_HERE';  // ← CHANGE THIS

// ===== PAGE TEMPLATE =====
const PAGE_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{TITLE}}</title>
    <meta name="description" content="{{DESCRIPTION}}">
    <link rel="stylesheet" href="/style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>

<nav class="navbar">
    <div class="container">
        <a href="/" class="logo">🚨 HelpNow</a>
        <div class="nav-links">
            <a href="/">Home</a>
            <a href="#services">Emergency Services</a>
            <a href="#cities">Locations</a>
            <a href="#how-it-works">How It Works</a>
            <a href="/insurance-claims">Insurance Help</a>
            <a href="admin.html" class="admin-link">Admin</a>
        </div>
        <button class="mobile-menu" id="mobileMenu">☰</button>
    </div>
</nav>

<div class="container">
    <div id="breadcrumbs"></div>
</div>

<section class="hero" style="padding: 40px 0;">
    <div class="container">
        <h1>{{H1}}</h1>
        <p>{{SUBHEADING}}</p>
        
        <div style="text-align: center;">
            <a id="callBtn" href="tel:{{CALL_NUMBER}}" class="call-btn">📞 Call Now: {{CALL_NUMBER}}</a>
        </div>
    </div>
</section>

<div class="container">
    <div class="form-container">
        <h2>Get Emergency Help Now</h2>
        <form id="leadForm" data-type="lead">
            <div class="form-group">
                <label>Full Name *</label>
                <input type="text" name="name" required>
            </div>
            <div class="form-group">
                <label>Phone Number *</label>
                <input type="tel" name="phone" required>
            </div>
            <div class="form-group">
                <label>Address / Zip Code</label>
                <input type="text" name="address">
            </div>
            <div class="form-group">
                <label>Describe Your Emergency</label>
                <textarea name="issue" rows="3" placeholder="Please describe your problem..."></textarea>
            </div>
            <button type="submit">Submit Emergency Request</button>
        </form>
    </div>
    
    <div id="faqSection"></div>
    <div id="internalLinks"></div>
</div>

<footer>
    <div class="container">
        <div class="footer-grid">
            <div class="footer-col">
                <h4>🚨 HelpNow</h4>
                <p>24/7 emergency home services connecting you with licensed professionals instantly.</p>
            </div>
            <div class="footer-col">
                <h4>Emergency Services</h4>
                <div id="footerServices"></div>
            </div>
            <div class="footer-col">
                <h4>Service Areas</h4>
                <div id="footerCities"></div>
            </div>
            <div class="footer-col">
                <h4>Contact</h4>
                <p>📞 Emergency: <strong>{{CALL_NUMBER}}</strong></p>
                <p>📧 support@helpnow.com</p>
                <p>🕐 24/7/365</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 HelpNow. All rights reserved.</p>
        </div>
    </div>
</footer>

<script src="/config.js"></script>
<script src="/app.js"></script>

<script>
    window.pageConfig = {
        service: "{{SERVICE_NAME}}",
        city: "{{CITY}}",
        call_enabled: true,
        call_number: "{{CALL_NUMBER}}"
    };
</script>
</body>
</html>`;

// ===== DIRECTORY SETUP =====
const PAGES_DIR = path.join(__dirname, 'pages');

if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR);
    console.log('✅ Created pages directory');
}

// ===== FETCH DATA FROM GOOGLE SHEETS =====
async function fetchSheetData(sheetName) {
    if (API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
        console.log('⚠️ Please set your API_KEY in generate-pages.js');
        console.log('Get it from: https://console.cloud.google.com/\n');
        return [];
    }
    
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data.values || [];
    } catch (error) {
        console.error(`Error fetching ${sheetName}:`, error.message);
        return [];
    }
}

// ===== GET CALL NUMBER =====
function getCallNumber(callData, city, categoryId) {
    for (let i = 1; i < callData.length; i++) {
        if (callData[i][2] === city && callData[i][3] === categoryId) {
            return callData[i][5] || callData[i][4] || '+18889180798';
        }
    }
    return '+18889180798';
}

// ===== GENERATE ALL PAGES =====
async function generateAllPages() {
    console.log('🚀 Starting page generation...\n');
    
    if (API_KEY === 'YOUR_GOOGLE_API_KEY_HERE') {
        console.log('❌ API_KEY not configured!');
        console.log('\n📝 How to get Google API Key:');
        console.log('   1. Go to https://console.cloud.google.com/');
        console.log('   2. Create new project or select existing');
        console.log('   3. Enable Google Sheets API');
        console.log('   4. Go to Credentials → Create Credentials → API Key');
        console.log('   5. Copy the API key and paste it in generate-pages.js\n');
        return;
    }
    
    // Fetch data from sheets
    console.log('📊 Fetching data from Google Sheets...');
    const categories = await fetchSheetData('MAIN_CATEGORIES');
    const cities = await fetchSheetData('CITIES');
    const callNumbers = await fetchSheetData('CALL_NUMBERS');
    
    if (!categories.length || !cities.length) {
        console.log('❌ No data found. Make sure sheets are created.');
        console.log('\n📝 Required sheets:');
        console.log('   - MAIN_CATEGORIES');
        console.log('   - CITIES');
        console.log('   - CALL_NUMBERS');
        return;
    }
    
    console.log(`   ✅ Found ${categories.length - 1} categories`);
    console.log(`   ✅ Found ${cities.length - 1} cities`);
    console.log(`   ✅ Found ${callNumbers.length - 1} call numbers\n`);
    
    // Clear existing pages
    const existing = fs.readdirSync(PAGES_DIR);
    existing.forEach(file => {
        if (file.endsWith('.html')) {
            fs.unlinkSync(path.join(PAGES_DIR, file));
        }
    });
    
    let count = 0;
    
    // Generate pages for each category and city
    for (let i = 1; i < categories.length; i++) {
        const category = categories[i];
        const categoryId = category[0];
        const categoryName = category[1];
        const subCategory = category[2];
        const icon = category[3] || '🔧';
        
        for (let j = 1; j < cities.length; j++) {
            const city = cities[j];
            const cityName = city[1];
            const stateCode = city[3];
            
            // Get call number for this category and city
            const callNumber = getCallNumber(callNumbers, cityName, categoryId);
            
            // Generate URL slug
            const slug = `${categoryName.toLowerCase().replace(/ /g, '-')}-${cityName.toLowerCase().replace(/ /g, '-')}`;
            const filename = `${slug}.html`;
            const filePath = path.join(PAGES_DIR, filename);
            
            // Generate HTML
            const html = PAGE_TEMPLATE
                .replace(/{{TITLE}}/g, `${categoryName} in ${cityName} | 24/7 Emergency HelpNow`)
                .replace(/{{DESCRIPTION}}/g, `Best ${categoryName} in ${cityName}. Call ${callNumber} for 24/7 emergency service. Licensed & insured professionals. Free estimates.`)
                .replace(/{{H1}}/g, `${categoryName} in ${cityName}`)
                .replace(/{{SUBHEADING}}/g, `24/7 Emergency Service • Licensed & Insured • Free Estimates • ${subCategory || 'Emergency Response'}`)
                .replace(/{{CALL_NUMBER}}/g, callNumber)
                .replace(/{{SERVICE_NAME}}/g, categoryName)
                .replace(/{{CITY}}/g, cityName)
                .replace(/{{ICON}}/g, icon);
            
            fs.writeFileSync(filePath, html);
            count++;
            console.log(`✅ Generated: ${filename}`);
        }
    }
    
    console.log(`\n🎉 TOTAL ${count} PAGES GENERATED!`);
    console.log(`📁 Location: ${PAGES_DIR}`);
    console.log('\n🚀 Next steps:');
    console.log('   1. config.js already has your Apps Script URL and Sheet ID');
    console.log('   2. Push to GitHub');
    console.log('   3. Enable GitHub Pages');
}

// ===== RUN GENERATOR =====
console.log('=' .repeat(50));
console.log('   HELPNOW PAGE GENERATOR');
console.log('=' .repeat(50));
console.log('');

if (SHEET_ID === '11lJ0od8N_tesMpMRcguwPt1VFUg8oiiOBGMpBQ0ZwIE') {
    console.log('✅ Sheet ID found!\n');
} else {
    console.log('⚠️ Please check SHEET_ID\n');
}

generateAllPages().catch(console.error);
