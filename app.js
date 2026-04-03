// ============================================
// HELPNOW.COM - MAIN APPLICATION
// 100% Google Sheet Controlled
// ============================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
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
});

// Load System Configuration from Sheet
async function loadSystemConfig() {
    const config = await callAPI(CONFIG.ENDPOINTS.getSystemConfig);
    if (config && !config.error) {
        // Apply colors if available
        if (config.primary_color) {
            document.documentElement.style.setProperty('--primary-color', config.primary_color);
        }
        if (config.primary_dark) {
            document.documentElement.style.setProperty('--primary-dark', config.primary_dark);
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
}

// Load Hero Content from Sheet
async function loadHeroContent() {
    const hero = await callAPI(CONFIG.ENDPOINTS.getHeroContent);
    if (hero && !hero.error) {
        const titleEl = document.querySelector('.hero h1');
        const subtitleEl = document.querySelector('.hero > .container > p');
        const searchInput = document.getElementById('smartSearch');
        
        if (titleEl && hero.hero_title) titleEl.innerHTML = hero.hero_title;
        if (subtitleEl && hero.hero_subtitle) subtitleEl.textContent = hero.hero_subtitle;
        if (searchInput && hero.search_placeholder) searchInput.placeholder = hero.search_placeholder;
    }
}

// Load Emergency Number from Sheet
async function loadEmergencyNumber() {
    const data = await callAPI(CONFIG.ENDPOINTS.getEmergencyNumber);
    const emergencyNumber = data.number || '+18889180798';
    
    const callBtn = document.getElementById('emergencyCallBtn');
    const footerPhone = document.getElementById('footerPhone');
    
    if (callBtn) {
        callBtn.textContent = `📞 Call Now: ${emergencyNumber}`;
        callBtn.href = `tel:${emergencyNumber.replace(/[^0-9+]/g, '')}`;
    }
    if (footerPhone) footerPhone.textContent = emergencyNumber;
}

// Load Services with Ratings from Sheet
async function loadServices() {
    const serviceGrid = document.getElementById('serviceGrid');
    if (!serviceGrid) return;
    
    serviceGrid.innerHTML = '<div class="spinner"></div>';
    const data = await callAPI(CONFIG.ENDPOINTS.getServices, { limit: 20 });
    
    if (data.services && data.services.length) {
        serviceGrid.innerHTML = data.services.map(service => `
            <a href="/pages/${service.slug || service.category_id.toLowerCase()}.html" class="service-card">
                <div class="service-icon">${service.icon || '🔧'}</div>
                <h3>${service.category_name}</h3>
                <p>${service.description || '24/7 Emergency Service'}</p>
                <div class="rating">⭐ ${service.avg_rating || '4.8'} (${service.total_reviews || 100}+ reviews)</div>
            </a>
        `).join('');
    }
}

// Load Sub Categories from Sheet
async function loadSubCategories() {
    const data = await callAPI(CONFIG.ENDPOINTS.getSubCategories, { limit: 50 });
    if (data.sub_categories && data.sub_categories.length) {
        // Store for search
        window.subCategories = data.sub_categories;
    }
}

// Load Cities from Sheet
async function loadCities() {
    const cityGrid = document.getElementById('cityGrid');
    if (!cityGrid) return;
    
    cityGrid.innerHTML = '<div class="spinner"></div>';
    const data = await callAPI(CONFIG.ENDPOINTS.getCities, { limit: 20 });
    
    if (data.cities && data.cities.length) {
        cityGrid.innerHTML = data.cities.map(city => `
            <a href="/pages/${city.slug || city.city_name.toLowerCase().replace(/ /g, '-')}.html" class="city-card">
                <h3>${city.city_name}, ${city.state_code || city.state}</h3>
                <p>${city.service_count || 50}+ services available</p>
                <div class="rating">⭐ ${city.avg_rating || '4.7'} (${city.total_reviews || 200}+ reviews)</div>
            </a>
        `).join('');
    }
}

// Load Neighborhoods from Sheet (Hyper-local SEO)
async function loadNeighborhoods() {
    const neighborhoodGrid = document.getElementById('neighborhoodGrid');
    if (!neighborhoodGrid) return;
    
    neighborhoodGrid.innerHTML = '<div class="spinner"></div>';
    const data = await callAPI(CONFIG.ENDPOINTS.getNeighborhoods, { limit: 20 });
    
    if (data.neighborhoods && data.neighborhoods.length) {
        neighborhoodGrid.innerHTML = data.neighborhoods.map(neighborhood => `
            <a href="/pages/${neighborhood.slug}.html" class="neighborhood-card">
                <h3>📍 ${neighborhood.neighborhood_name}</h3>
                <p>${neighborhood.city_name}, ${neighborhood.state_code}</p>
                <small>${neighborhood.service_count || 30}+ emergency services</small>
            </a>
        `).join('');
    } else {
        neighborhoodGrid.style.display = 'none';
    }
}

// Load Reviews from Sheet
async function loadReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;
    
    reviewsGrid.innerHTML = '<div class="spinner"></div>';
    const data = await callAPI(CONFIG.ENDPOINTS.getReviews, { limit: 6 });
    
    if (data.reviews && data.reviews.length) {
        reviewsGrid.innerHTML = data.reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <span class="review-name">${review.user_name}</span>
                    <span class="review-stars">${'⭐'.repeat(Math.floor(review.rating))} ${review.rating}</span>
                </div>
                <p class="review-text">"${review.review_text.substring(0, 150)}${review.review_text.length > 150 ? '...' : ''}"</p>
                <small>${review.service_name} in ${review.city_name}</small>
            </div>
        `).join('');
    }
}

// Load Navigation Menu from Sheet
async function loadNavigationMenu() {
    const navLinks = document.getElementById('navLinks');
    if (!navLinks) return;
    
    const data = await callAPI(CONFIG.ENDPOINTS.getNavigationMenu);
    if (data.menu && data.menu.length) {
        // Keep Home and Admin, update others
        const existingLinks = navLinks.querySelectorAll('a:not(.admin-link):not([href="/"])');
        existingLinks.forEach(link => link.remove());
        
        data.menu.forEach(item => {
            if (item.menu_name !== 'Home' && item.menu_name !== 'Admin') {
                const a = document.createElement('a');
                a.href = item.url;
                a.textContent = item.menu_name;
                if (item.target) a.target = item.target;
                navLinks.insertBefore(a, navLinks.querySelector('.admin-link'));
            }
        });
    }
}

// Load Footer Content from Sheet
async function loadFooterContent() {
    const footerServices = document.getElementById('footerServices');
    const footerCities = document.getElementById('footerCities');
    
    if (footerServices) {
        const services = await callAPI(CONFIG.ENDPOINTS.getServices, { limit: 8 });
        if (services.services) {
            footerServices.innerHTML = services.services.map(s => 
                `<a href="/pages/${s.slug || s.category_id.toLowerCase()}.html">${s.category_name}</a>`
            ).join('');
        }
    }
    
    if (footerCities) {
        const cities = await callAPI(CONFIG.ENDPOINTS.getCities, { limit: 8 });
        if (cities.cities) {
            footerCities.innerHTML = cities.cities.map(c => 
                `<a href="/pages/${c.slug || c.city_name.toLowerCase().replace(/ /g, '-')}.html">${c.city_name}</a>`
            ).join('');
        }
    }
}

// Smart Search with Filters
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

// Initialize Forms
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
            
            const result = await callAPI(CONFIG.ENDPOINTS.submitLead, data, 'POST');
            
            if (result.success) {
                showNotification('Request submitted! A professional will contact you shortly.', 'success');
                form.reset();
            } else {
                showNotification('Something went wrong. Please try again.', 'error');
            }
            
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Mobile Menu
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Track Call
function trackCall(number, pageUrl) {
    callAPI(CONFIG.ENDPOINTS.trackCall, {
        number: number,
        page: pageUrl,
        timestamp: new Date().toISOString()
    }, 'POST');
}

// Export functions
if (typeof window !== 'undefined') {
    window.trackCall = trackCall;
    window.showNotification = showNotification;
}
