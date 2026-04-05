// ============================================
// HELPNOW.COM - MAIN APPLICATION
// 100% Google Sheet Controlled
// ============================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 HelpNow Initializing...');
    await loadSystemConfig();
    await loadHeroContent();
    await loadEmergencyNumber();
    await loadServices();
    await loadSubCategories();
    await loadCities();
    await loadNeighborhoods();
    await loadReviews();
    await loadNavigationMenu();
    await initSmartSearch();
    await initForms();
    await initMobileMenu();
    await loadFooterContent();
    console.log('✅ HelpNow Ready!');
});

// ============================================
// LOAD SYSTEM CONFIGURATION FROM SHEET
// ============================================
async function loadSystemConfig() {
    try {
        const config = await callAPI(CONFIG.ENDPOINTS.getSystemConfig);
        if (config && !config.error) {
            // Apply colors if available
            if (config.primary_color) {
                document.documentElement.style.setProperty('--primary-color', config.primary_color);
            }
            if (config.primary_dark) {
                document.documentElement.style.setProperty('--primary-dark', config.primary_dark);
            }
            if (config.secondary_start) {
                document.documentElement.style.setProperty('--secondary-start', config.secondary_start);
            }
            if (config.secondary_mid) {
                document.documentElement.style.setProperty('--secondary-mid', config.secondary_mid);
            }
            if (config.secondary_end) {
                document.documentElement.style.setProperty('--secondary-end', config.secondary_end);
            }
            
            // Update trust badges
            const badges = document.querySelectorAll('.emergency-badge span');
            if (badges.length >= 4) {
                if (config.trust_badge_1) badges[0].textContent = config.trust_badge_1;
                if (config.trust_badge_2) badges[1].textContent = config.trust_badge_2;
                if (config.trust_badge_3) badges[2].textContent = config.trust_badge_3;
                if (config.trust_badge_4) badges[3].textContent = config.trust_badge_4;
            }
        }
    } catch (error) {
        console.error('Error loading system config:', error);
    }
}

// ============================================
// LOAD HERO CONTENT FROM SHEET
// ============================================
async function loadHeroContent() {
    try {
        const hero = await callAPI(CONFIG.ENDPOINTS.getHeroContent);
        if (hero && !hero.error) {
            const titleEl = document.querySelector('.hero h1');
            const subtitleEl = document.querySelector('.hero > .container > p');
            const searchInput = document.getElementById('smartSearch');
            const searchBtn = document.getElementById('searchBtn');
            
            if (titleEl && hero.hero_title) titleEl.innerHTML = hero.hero_title;
            if (subtitleEl && hero.hero_subtitle) subtitleEl.textContent = hero.hero_subtitle;
            if (searchInput && hero.search_placeholder) searchInput.placeholder = hero.search_placeholder;
            if (searchBtn && hero.button_text) searchBtn.textContent = hero.button_text;
        }
    } catch (error) {
        console.error('Error loading hero content:', error);
    }
}

// ============================================
// LOAD EMERGENCY NUMBER FROM SHEET
// ============================================
async function loadEmergencyNumber() {
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getEmergencyNumber);
        const emergencyNumber = data.number || CONFIG.DEFAULT_EMERGENCY_NUMBER || '+18889180798';
        
        const callBtn = document.getElementById('emergencyCallBtn');
        const footerPhone = document.getElementById('footerPhone');
        const ctaButton = document.querySelector('.emergency-cta .call-btn');
        
        if (callBtn) {
            callBtn.textContent = `📞 Call Now: ${emergencyNumber}`;
            callBtn.href = `tel:${emergencyNumber.replace(/[^0-9+]/g, '')}`;
        }
        if (footerPhone) footerPhone.textContent = emergencyNumber;
        if (ctaButton) {
            ctaButton.textContent = `📞 Call Now: ${emergencyNumber}`;
            ctaButton.href = `tel:${emergencyNumber.replace(/[^0-9+]/g, '')}`;
        }
    } catch (error) {
        console.error('Error loading emergency number:', error);
    }
}

// ============================================
// LOAD SERVICES WITH RATINGS FROM SHEET
// ============================================
async function loadServices() {
    const serviceGrid = document.getElementById('serviceGrid');
    if (!serviceGrid) return;
    
    serviceGrid.innerHTML = '<div class="spinner"></div>';
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getServices, { limit: 20 });
        
        if (data.services && data.services.length) {
            serviceGrid.innerHTML = data.services.map(service => `
                <a href="/pages/${service.slug || service.category_id.toLowerCase().replace(/ /g, '-')}.html" class="service-card">
                    <div class="service-icon">${service.icon || '🔧'}</div>
                    <h3>${service.category_name}</h3>
                    <p>${service.description || '24/7 Emergency Service'}</p>
                    <div class="rating">⭐ ${service.avg_rating || '4.8'} (${service.total_reviews || 100}+ reviews)</div>
                </a>
            `).join('');
        } else {
            serviceGrid.innerHTML = '<p>No services found. Please check back later.</p>';
        }
    } catch (error) {
        console.error('Error loading services:', error);
        serviceGrid.innerHTML = '<p>Unable to load services. Please try again later.</p>';
    }
}

// ============================================
// LOAD SUB CATEGORIES FROM SHEET
// ============================================
async function loadSubCategories() {
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getSubCategories, { limit: 50 });
        if (data.sub_categories && data.sub_categories.length) {
            window.subCategories = data.sub_categories;
        }
    } catch (error) {
        console.error('Error loading sub categories:', error);
    }
}

// ============================================
// LOAD CITIES FROM SHEET
// ============================================
async function loadCities() {
    const cityGrid = document.getElementById('cityGrid');
    if (!cityGrid) return;
    
    cityGrid.innerHTML = '<div class="spinner"></div>';
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getCities, { limit: 20 });
        
        if (data.cities && data.cities.length) {
            cityGrid.innerHTML = data.cities.map(city => `
                <a href="/pages/services-in-${city.city_name.toLowerCase().replace(/ /g, '-')}.html" class="city-card">
                    <h3>${city.city_name}, ${city.state_code || city.state}</h3>
                    <p>${city.service_count || 50}+ services available</p>
                    <div class="rating">⭐ ${city.avg_rating || '4.7'} (${city.total_reviews || 200}+ reviews)</div>
                </a>
            `).join('');
        } else {
            cityGrid.innerHTML = '<p>No cities found. Please check back later.</p>';
        }
    } catch (error) {
        console.error('Error loading cities:', error);
        cityGrid.innerHTML = '<p>Unable to load cities. Please try again later.</p>';
    }
}

// ============================================
// LOAD NEIGHBORHOODS FROM SHEET (Hyper-local SEO)
// ============================================
async function loadNeighborhoods() {
    const neighborhoodGrid = document.getElementById('neighborhoodGrid');
    if (!neighborhoodGrid) return;
    
    neighborhoodGrid.innerHTML = '<div class="spinner"></div>';
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getNeighborhoods, { limit: 20 });
        
        if (data.neighborhoods && data.neighborhoods.length) {
            neighborhoodGrid.innerHTML = data.neighborhoods.map(neighborhood => `
                <a href="/pages/${neighborhood.slug}.html" class="neighborhood-card">
                    <h3>📍 ${neighborhood.neighborhood_name}</h3>
                    <p>${neighborhood.city_name}, ${neighborhood.state_code}</p>
                    <small>${neighborhood.service_count || 30}+ emergency services</small>
                </a>
            `).join('');
            neighborhoodGrid.style.display = 'grid';
        } else {
            neighborhoodGrid.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading neighborhoods:', error);
        neighborhoodGrid.style.display = 'none';
    }
}

// ============================================
// LOAD REVIEWS FROM SHEET
// ============================================
async function loadReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;
    
    reviewsGrid.innerHTML = '<div class="spinner"></div>';
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getReviews, { limit: 6 });
        
        if (data.reviews && data.reviews.length) {
            reviewsGrid.innerHTML = data.reviews.map(review => `
                <div class="review-card">
                    <div class="review-header">
                        <span class="review-name">${review.user_name}</span>
                        <span class="review-stars">${'⭐'.repeat(Math.floor(review.rating))} ${review.rating}</span>
                    </div>
                    <p class="review-text">"${review.review_text ? review.review_text.substring(0, 150) : 'Excellent service!'}${review.review_text && review.review_text.length > 150 ? '...' : ''}"</p>
                    <small>${review.service_name || 'Emergency Service'} in ${review.city_name || 'Your Area'}</small>
                </div>
            `).join('');
        } else {
            reviewsGrid.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        reviewsGrid.innerHTML = '<p>Unable to load reviews.</p>';
    }
}

// ============================================
// LOAD NAVIGATION MENU FROM SHEET
// ============================================
async function loadNavigationMenu() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getNavigationMenu);
        if (data.menu && data.menu.length) {
            const existingLinks = navLinks.querySelectorAll('a:not(.admin-link):not([href="/"])');
            existingLinks.forEach(link => link.remove());
            
            data.menu.forEach(item => {
                if (item.menu_name !== 'Home' && item.menu_name !== 'Admin') {
                    const a = document.createElement('a');
                    a.href = item.url;
                    a.textContent = item.menu_name;
                    if (item.target === '_blank') a.target = '_blank';
                    if (item.target === '_blank') a.rel = 'noopener noreferrer';
                    navLinks.insertBefore(a, navLinks.querySelector('.admin-link'));
                }
            });
        }
    } catch (error) {
        console.error('Error loading navigation menu:', error);
    }
}

// ============================================
// LOAD FOOTER CONTENT FROM SHEET
// ============================================
async function loadFooterContent() {
    const footerServices = document.getElementById('footerServices');
    const footerCities = document.getElementById('footerCities');
    
    try {
        if (footerServices) {
            const services = await callAPI(CONFIG.ENDPOINTS.getServices, { limit: 8 });
            if (services.services && services.services.length) {
                footerServices.innerHTML = services.services.map(s => 
                    `<a href="/pages/${s.slug || s.category_id.toLowerCase().replace(/ /g, '-')}.html">${s.category_name}</a>`
                ).join('');
            }
        }
        
        if (footerCities) {
            const cities = await callAPI(CONFIG.ENDPOINTS.getCities, { limit: 8 });
            if (cities.cities && cities.cities.length) {
                footerCities.innerHTML = cities.cities.map(c => 
                    `<a href="/pages/services-in-${c.city_name.toLowerCase().replace(/ /g, '-')}.html">${c.city_name}</a>`
                ).join('');
            }
        }
    } catch (error) {
        console.error('Error loading footer content:', error);
    }
}

// ============================================
// SMART SEARCH WITH FILTERS
// ============================================
async function initSmartSearch() {
    const searchInput = document.getElementById('smartSearch');
    const searchBtn = document.getElementById('searchBtn');
    const locationFilter = document.getElementById('locationFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const suggestionsDiv = document.getElementById('searchSuggestions');
    
    if (!searchInput) return;
    
    let debounceTimer;
    
    const performSearch = async () => {
        const query = searchInput.value.trim();
        const location = locationFilter ? locationFilter.value : '';
        const category = categoryFilter ? categoryFilter.value : '';
        
        if (query.length < 2) {
            suggestionsDiv.classList.remove('active');
            return;
        }
        
        try {
            const results = await callAPI(CONFIG.ENDPOINTS.search, { 
                q: query, 
                location: location, 
                category: category 
            });
            
            if (results.suggestions && results.suggestions.length) {
                suggestionsDiv.innerHTML = results.suggestions.map(s => `
                    <div class="suggestion-item" data-url="${s.url}">
                        <strong>${s.display_text || s.keyword}</strong>
                        <small style="color: #6b7280; display: block;">${s.category || 'Emergency Service'} in ${s.city || 'Your Area'}</small>
                    </div>
                `).join('');
                suggestionsDiv.classList.add('active');
                
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => {
                        window.location.href = item.dataset.url;
                    });
                });
            } else {
                suggestionsDiv.classList.remove('active');
            }
        } catch (error) {
            console.error('Search error:', error);
            suggestionsDiv.classList.remove('active');
        }
    };
    
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300);
    });
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
            }
        });
    }
    
    if (locationFilter) locationFilter.addEventListener('change', performSearch);
    if (categoryFilter) categoryFilter.addEventListener('change', performSearch);
    
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !suggestionsDiv.contains(e.target)) {
            suggestionsDiv.classList.remove('active');
        }
    });
}

// ============================================
// INITIALIZE FORMS
// ============================================
async function initForms() {
    const forms = document.querySelectorAll('form[data-type="lead"], form#leadForm');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Submitting...';
            submitBtn.disabled = true;
            
            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => { data[key] = value; });
            
            data.page_url = window.location.pathname;
            data.timestamp = new Date().toISOString();
            data.user_agent = navigator.userAgent;
            
            try {
                const result = await callAPI(CONFIG.ENDPOINTS.submitLead, data, 'POST');
                
                if (result.success) {
                    showNotification('Request submitted! A professional will contact you shortly.', 'success');
                    form.reset();
                } else {
                    showNotification('Something went wrong. Please try again.', 'error');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showNotification('Unable to submit. Please call us directly.', 'error');
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// ============================================
// MOBILE MENU TOGGLE
// ============================================
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        });
    }
}

// ============================================
// SHOW NOTIFICATION
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 14px 20px;
        background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 10px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// ============================================
// TRACK CALL
// ============================================
function trackCall(number, pageUrl) {
    callAPI(CONFIG.ENDPOINTS.trackCall, {
        number: number,
        page: pageUrl,
        timestamp: new Date().toISOString(),
        caller_number: 'Website Visitor'
    }, 'POST').catch(error => console.error('Call tracking error:', error));
}

// ============================================
// EXPORT FUNCTIONS FOR GLOBAL USE
// ============================================
if (typeof window !== 'undefined') {
    window.trackCall = trackCall;
    window.showNotification = showNotification;
}

// Add CSS animations if not present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}
