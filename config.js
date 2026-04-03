// ============================================
// HELPNOW.COM - CONFIGURATION
// 100% Google Sheet Controlled
// ============================================

const CONFIG = {
    // REPLACE WITH YOUR GOOGLE APPS SCRIPT URL AFTER DEPLOYMENT
    API_BASE_URL: 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec',
    
    // REPLACE WITH YOUR GOOGLE SHEET ID
    SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID',
    
    // Cache Settings
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    
    // API Endpoints
    ENDPOINTS: {
        getPageConfig: '/getPageConfig',
        submitLead: '/submitLead',
        getServices: '/getServices',
        getSubCategories: '/getSubCategories',
        getCities: '/getCities',
        getNeighborhoods: '/getNeighborhoods',
        getLandmarks: '/getLandmarks',
        getReviews: '/getReviews',
        getRatings: '/getRatings',
        trackCall: '/trackCall',
        search: '/search',
        getFAQs: '/getFAQs',
        getInternalLinks: '/getInternalLinks',
        getBreadcrumbs: '/getBreadcrumbs',
        getHeroContent: '/getHeroContent',
        getEmergencyNumber: '/getEmergencyNumber',
        getNavigationMenu: '/getNavigationMenu',
        getSystemConfig: '/getSystemConfig'
    }
};

// Cache storage
let apiCache = {};

// API Call Wrapper
async function callAPI(endpoint, params = {}, method = 'GET') {
    const cacheKey = `${endpoint}_${JSON.stringify(params)}`;
    
    if (apiCache[cacheKey] && (Date.now() - apiCache[cacheKey].timestamp < CONFIG.CACHE_DURATION)) {
        return apiCache[cacheKey].data;
    }
    
    try {
        let url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
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
