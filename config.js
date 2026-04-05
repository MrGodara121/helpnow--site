// ============================================
// HELPNOW.COM - CONFIGURATION FILE
// ============================================

// ✅ UPDATED WITH YOUR CREDENTIALS
const CONFIG = {
    // ===== GOOGLE APPS SCRIPT URL =====
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbyrft-4cg7OiG_hNSmh8qzfY74IcQ3cFnBNyz3MzR3j7-h8Znxa3AN1HZhecEXrb9AxZA/exec',
    
    // ===== GOOGLE SHEET ID =====
    SPREADSHEET_ID: '11lJ0od8N_tesMpMRcguwPt1VFUg8oiiOBGMpBQ0ZwIE',
    
    // Site Information
    SITE_NAME: 'HelpNow',
    SITE_DOMAIN: 'helpnow.com',
    SITE_DESCRIPTION: '24/7 Emergency Home Services - Connect with licensed professionals instantly',
    
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
        enableInternalLinks: true
    },
    
    // Cache Settings
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    PAGE_CACHE_DURATION: 60 * 60 * 1000, // 1 hour
    
    // API Endpoints
    ENDPOINTS: {
        getPageConfig: '/getPageConfig',
        submitLead: '/submitLead',
        getServices: '/getServices',
        getCities: '/getCities',
        trackCall: '/trackCall',
        getProviders: '/getProviders',
        search: '/search',
        getFAQs: '/getFAQs',
        getInternalLinks: '/getInternalLinks',
        getBreadcrumbs: '/getBreadcrumbs',
        getStats: '/getStats',
        getRecentLeads: '/getRecentLeads',
        getHeroContent: '/getHeroContent',
        getEmergencyNumber: '/getEmergencyNumber',
        getNavigationMenu: '/getNavigationMenu',
        getSystemConfig: '/getSystemConfig',
        getFooterSections: '/getFooterSections',
        getFooterSocialLinks: '/getFooterSocialLinks',
        getFooterPolicyLinks: '/getFooterPolicyLinks',
        getFooterTrustBadges: '/getFooterTrustBadges',
        getFooterNewsletter: '/getFooterNewsletter',
        getFooterApps: '/getFooterApps',
        getFooterPaymentMethods: '/getFooterPaymentMethods',
        getFooterBusinessHours: '/getFooterBusinessHours'
    },
    
    // Default Values
    DEFAULTS: {
        country: 'US',
        currency: 'USD',
        timezone: 'America/New_York',
        responseTime: '30-60 minutes'
    }
};

// Cache storage
let apiCache = {};

// API Call Wrapper
async function callAPI(endpoint, params = {}, method = 'GET') {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    
    // Check cache
    if (apiCache[cacheKey] && (Date.now() - apiCache[cacheKey].timestamp < CONFIG.CACHE_DURATION)) {
        return apiCache[cacheKey].data;
    }
    
    try {
        let url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        if (method === 'POST') {
            options.body = JSON.stringify(params);
        } else if (Object.keys(params).length > 0) {
            const queryParams = new URLSearchParams(params).toString();
            url = `${url}?${queryParams}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        // Cache successful responses
        if (!data.error) {
            apiCache[cacheKey] = {
                data: data,
                timestamp: Date.now()
            };
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        return { error: error.message };
    }
}

// Clear cache function
function clearCache() {
    apiCache = {};
    console.log('Cache cleared');
}

// Export for browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
    window.callAPI = callAPI;
    window.clearCache = clearCache;
}
