// ============================================
// HELPNOW.COM - MASTER CONFIGURATION
// 100% Google Sheet Controlled - 31 Tabs
// ============================================

const CONFIG = {
    // ===== GOOGLE APPS SCRIPT URL =====
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbyrft-4cg7OiG_hNSmh8qzfY74IcQ3cFnBNyz3MzR3j7-h8Znxa3AN1HZhecEXrb9AxZA/exec',
    
    // ===== GOOGLE SHEET ID =====
    SPREADSHEET_ID: '11lJ0od8N_tesMpMRcguwPt1VFUg8oiiOBGMpBQ0ZwIE',
    
    // Site Information
    SITE_NAME: 'HelpNow',
    SITE_DOMAIN: 'helpnow.com',
    SITE_DESCRIPTION: '24/7 Emergency Home Services - Connect with licensed professionals instantly',
    SITE_KEYWORDS: 'emergency plumber, water damage, electrician, roof repair, hvac, fire damage',
    
    // Default Emergency Number (fallback only)
    DEFAULT_EMERGENCY_NUMBER: '+18889180798',
    
    // Feature Flags
    FEATURES: {
        enableCalls: true,
        enableLeads: true,
        enableRouting: true,
        enableReviews: true,
        enableSEO: true,
        enableFAQs: true,
        enableBreadcrumbs: true,
        enableInternalLinks: true,
        enableSitemap: true,
        enableSchemaMarkup: true,
        enableAnalytics: false
    },
    
    // Cache Settings
    CACHE_DURATION: 5 * 60 * 1000,
    PAGE_CACHE_DURATION: 60 * 60 * 1000,
    SITEMAP_CACHE_DURATION: 24 * 60 * 60 * 1000,
    
    // API Endpoints (31 Tabs Supported)
    ENDPOINTS: {
        // Core
        getPageConfig: '/getPageConfig',
        submitLead: '/submitLead',
        trackCall: '/trackCall',
        
        // Categories & Services
        getCountries: '/getCountries',
        getMainCategories: '/getMainCategories',
        getSubCategories: '/getSubCategories',
        getCities: '/getCities',
        getNeighborhoods: '/getNeighborhoods',
        getLandmarks: '/getLandmarks',
        
        // Providers & Reviews
        getProviders: '/getProviders',
        getProviderReviews: '/getProviderReviews',
        getRatingsSummary: '/getRatingsSummary',
        
        // SEO & Content
        getPageControl: '/getPageControl',
        getSEOPages: '/getSEOPages',
        getInternalLinks: '/getInternalLinks',
        getLinkingClusters: '/getLinkingClusters',
        getSearchIndex: '/getSearchIndex',
        getFAQs: '/getFAQs',
        getBreadcrumbs: '/getBreadcrumbs',
        
        // Navigation & UI
        getNavigationMenu: '/getNavigationMenu',
        getHeroContent: '/getHeroContent',
        getServicesSection: '/getServicesSection',
        getCitiesSection: '/getCitiesSection',
        getHowItWorks: '/getHowItWorks',
        getTrustSection: '/getTrustSection',
        getEmergencyCTA: '/getEmergencyCTA',
        
        // Footer (Advanced)
        getFooterSections: '/getFooterSections',
        getFooterSocialLinks: '/getFooterSocialLinks',
        getFooterPolicyLinks: '/getFooterPolicyLinks',
        getFooterTrustBadges: '/getFooterTrustBadges',
        getFooterNewsletter: '/getFooterNewsletter',
        getFooterApps: '/getFooterApps',
        getFooterPaymentMethods: '/getFooterPaymentMethods',
        getFooterBusinessHours: '/getFooterBusinessHours',
        
        // System
        getSystemConfig: '/getSystemConfig',
        getColorsTheme: '/getColorsTheme',
        getFontsTypography: '/getFontsTypography',
        
        // Leads & Analytics
        getAllLeads: '/getAllLeads',
        getRecentLeads: '/getRecentLeads',
        getStats: '/getStats',
        getSitemap: '/getSitemap',
        
        // Emergency
        getEmergencyNumber: '/getEmergencyNumber',
        getCallNumbers: '/getCallNumbers',
        
        // Search
        search: '/search'
    }
};

// Cache storage
let apiCache = {};

// API Call Wrapper with Retry Logic
async function callAPI(endpoint, params = {}, method = 'GET', retries = 3) {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    
    // Check cache
    if (apiCache[cacheKey] && (Date.now() - apiCache[cacheKey].timestamp < CONFIG.CACHE_DURATION)) {
        return apiCache[cacheKey].data;
    }
    
    for (let i = 0; i < retries; i++) {
        try {
            let url = `${CONFIG.API_BASE_URL}${endpoint}`;
            const options = {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                mode: 'cors'
            };
            
            if (method === 'POST') {
                options.body = JSON.stringify(params);
            } else if (Object.keys(params).length > 0) {
                const queryParams = new URLSearchParams(params).toString();
                url = `${url}?${queryParams}`;
            }
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (!data.error) {
                apiCache[cacheKey] = { data: data, timestamp: Date.now() };
                return data;
            }
            
            if (i === retries - 1) return { error: data.error };
        } catch (error) {
            console.error(`API Error (attempt ${i + 1}):`, error);
            if (i === retries - 1) return { error: error.message };
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
    return { error: 'Max retries exceeded' };
}

// Clear cache function
function clearCache() {
    apiCache = {};
    console.log('Cache cleared');
}

// Generate Sitemap
async function generateSitemap() {
    const sitemapData = await callAPI(CONFIG.ENDPOINTS.getSitemap);
    if (sitemapData && sitemapData.urls) {
        let sitemapXML = '<?xml version="1.0" encoding="UTF-8"?>\n';
        sitemapXML += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';
        
        sitemapData.urls.forEach(url => {
            sitemapXML += `  <url>\n`;
            sitemapXML += `    <loc>${url.loc}</loc>\n`;
            if (url.lastmod) sitemapXML += `    <lastmod>${url.lastmod}</lastmod>\n`;
            if (url.changefreq) sitemapXML += `    <changefreq>${url.changefreq}</changefreq>\n`;
            if (url.priority) sitemapXML += `    <priority>${url.priority}</priority>\n`;
            sitemapXML += `  </url>\n`;
        });
        
        sitemapXML += '</urlset>';
        return sitemapXML;
    }
    return null;
}

// Export for browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.callAPI = callAPI;
    window.clearCache = clearCache;
    window.generateSitemap = generateSitemap;
}
