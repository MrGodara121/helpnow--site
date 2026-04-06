// ============================================
// HELPNOW.COM - MAIN APPLICATION
// 100% Google Sheet Controlled - 31 Tabs
// ============================================

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 HelpNow Initializing...');
    
    await loadSystemConfig();
    await loadHeroContent();
    await loadEmergencyNumber();
    await loadMainCategories();
    await loadSubCategories();
    await loadCities();
    await loadNeighborhoods();
    await loadLandmarks();
    await loadProviderReviews();
    await loadRatingsSummary();
    await loadFAQs();
    await loadInternalLinks();
    await loadNavigationMenu();
    await loadTrustSection();
    await loadEmergencyCTA();
    await loadFooterSections();
    await loadFooterSocialLinks();
    await loadFooterPolicyLinks();
    await loadFooterTrustBadges();
    await loadFooterNewsletter();
    await loadFooterApps();
    await loadFooterPaymentMethods();
    await loadFooterBusinessHours();
    await initSmartSearch();
    await initForms();
    await initMobileMenu();
    await initSmoothScroll();
    await initFAQToggles();
    
    console.log('✅ HelpNow Ready!');
});

// ============================================
// SYSTEM CONFIGURATION
// ============================================
async function loadSystemConfig() {
    try {
        const config = await callAPI(CONFIG.ENDPOINTS.getSystemConfig);
        if (config && !config.error) {
            // Apply colors
            if (config.primary_color) document.documentElement.style.setProperty('--primary-color', config.primary_color);
            if (config.primary_dark) document.documentElement.style.setProperty('--primary-dark', config.primary_dark);
            if (config.secondary_start) document.documentElement.style.setProperty('--secondary-start', config.secondary_start);
            if (config.secondary_mid) document.documentElement.style.setProperty('--secondary-mid', config.secondary_mid);
            if (config.secondary_end) document.documentElement.style.setProperty('--secondary-end', config.secondary_end);
            
            // Update trust badges
            const badges = document.querySelectorAll('.emergency-badge span');
            if (badges.length >= 4) {
                if (config.trust_badge_1) badges[0].textContent = config.trust_badge_1;
                if (config.trust_badge_2) badges[1].textContent = config.trust_badge_2;
                if (config.trust_badge_3) badges[2].textContent = config.trust_badge_3;
                if (config.trust_badge_4) badges[3].textContent = config.trust_badge_4;
            }
        }
        
        // Apply colors theme
        const colors = await callAPI(CONFIG.ENDPOINTS.getColorsTheme);
        if (colors && !colors.error) {
            Object.keys(colors).forEach(key => {
                if (colors[key]) document.documentElement.style.setProperty(`--${key.replace(/_/g, '-')}`, colors[key]);
            });
        }
    } catch (error) {
        console.error('Error loading system config:', error);
    }
}

// ============================================
// HERO CONTENT
// ============================================
async function loadHeroContent() {
    try {
        const hero = await callAPI(CONFIG.ENDPOINTS.getHeroContent);
        if (hero && !hero.error) {
            const titleEl = document.querySelector('.hero h1');
            const subtitleEl = document.querySelector('.hero-subtitle');
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
// EMERGENCY NUMBER
// ============================================
async function loadEmergencyNumber() {
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getEmergencyNumber);
        const emergencyNumber = data.number || CONFIG.DEFAULT_EMERGENCY_NUMBER;
        
        const callBtn = document.getElementById('emergencyCallBtn');
        const ctaButton = document.querySelector('.emergency-cta .call-btn');
        
        if (callBtn) {
            callBtn.textContent = `📞 Call Now: ${emergencyNumber}`;
            callBtn.href = `tel:${emergencyNumber.replace(/[^0-9+]/g, '')}`;
            callBtn.addEventListener('click', () => trackCall(emergencyNumber, window.location.pathname));
        }
        if (ctaButton) {
            ctaButton.textContent = `📞 Call Now: ${emergencyNumber}`;
            ctaButton.href = `tel:${emergencyNumber.replace(/[^0-9+]/g, '')}`;
        }
    } catch (error) {
        console.error('Error loading emergency number:', error);
    }
}

// ============================================
// MAIN CATEGORIES
// ============================================
async function loadMainCategories() {
    const serviceGrid = document.getElementById('serviceGrid');
    if (!serviceGrid) return;
    
    serviceGrid.innerHTML = '<div class="spinner"></div>';
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getMainCategories, { limit: 20 });
        
        if (data.categories && data.categories.length) {
            serviceGrid.innerHTML = data.categories.map(category => `
                <a href="/pages/${category.slug || category.category_id.toLowerCase().replace(/ /g, '-')}.html" class="service-card">
                    <div class="service-icon">${category.icon || '🔧'}</div>
                    <h3>${category.category_name}</h3>
                    <p>${category.description || '24/7 Emergency Service'}</p>
                    <div class="rating">⭐ ${category.avg_rating || '4.8'} (${category.total_reviews || 100}+ reviews)</div>
                </a>
            `).join('');
        } else {
            serviceGrid.innerHTML = '<p>No services found. Please check back later.</p>';
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        serviceGrid.innerHTML = '<p>Unable to load services. Please try again later.</p>';
    }
}

// ============================================
// SUB CATEGORIES
// ============================================
async function loadSubCategories() {
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getSubCategories, { limit: 100 });
        if (data.sub_categories && data.sub_categories.length) {
            window.subCategories = data.sub_categories;
        }
    } catch (error) {
        console.error('Error loading sub categories:', error);
    }
}

// ============================================
// CITIES
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
// NEIGHBORHOODS (Hyper-local SEO)
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
// LANDMARKS
// ============================================
async function loadLandmarks() {
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getLandmarks, { limit: 20 });
        if (data.landmarks && data.landmarks.length) {
            window.landmarks = data.landmarks;
        }
    } catch (error) {
        console.error('Error loading landmarks:', error);
    }
}

// ============================================
// PROVIDER REVIEWS
// ============================================
async function loadProviderReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    if (!reviewsGrid) return;
    
    reviewsGrid.innerHTML = '<div class="spinner"></div>';
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getProviderReviews, { limit: 6 });
        
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
// RATINGS SUMMARY
// ============================================
async function loadRatingsSummary() {
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getRatingsSummary);
        if (data && !data.error) {
            const avgRatingEl = document.getElementById('avgRating');
            const totalReviewsEl = document.getElementById('totalReviews');
            if (avgRatingEl) avgRatingEl.textContent = data.avg_rating || '4.9';
            if (totalReviewsEl) totalReviewsEl.textContent = data.total_reviews || '1250';
        }
    } catch (error) {
        console.error('Error loading ratings summary:', error);
    }
}

// ============================================
// FAQS (Schema Markup)
// ============================================
async function loadFAQs() {
    const faqGrid = document.getElementById('faqGrid');
    if (!faqGrid) return;
    
    faqGrid.innerHTML = '<div class="spinner"></div>';
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getFAQs, { limit: 8 });
        
        if (data.faqs && data.faqs.length) {
            faqGrid.innerHTML = data.faqs.map((faq, index) => `
                <div class="faq-card" data-faq-index="${index}">
                    <div class="faq-question">
                        ${faq.question}
                        <span class="faq-icon">+</span>
                    </div>
                    <div class="faq-answer">
                        <p>${faq.answer}</p>
                    </div>
                </div>
            `).join('');
            
            // Add FAQ schema
            addFAQSchema(data.faqs);
        } else {
            faqGrid.style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading FAQs:', error);
        faqGrid.style.display = 'none';
    }
}

// Add FAQ Schema Markup
function addFAQSchema(faqs) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
    
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

// ============================================
// INTERNAL LINKS (SEO Boost)
// ============================================
async function loadInternalLinks() {
    const internalLinksContainer = document.getElementById('internalLinks');
    if (!internalLinksContainer) return;
    
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getInternalLinks, { url: window.location.pathname });
        
        if (data.links && data.links.length) {
            let linksHTML = '<div class="internal-links"><h3>Related Services</h3><div class="internal-links-grid">';
            data.links.forEach(link => {
                linksHTML += `<a href="${link.target_url}">${link.anchor_text || link.target_url.replace(/\.html$/, '').replace(/-/g, ' ')}</a>`;
            });
            linksHTML += '</div></div>';
            internalLinksContainer.innerHTML = linksHTML;
        }
    } catch (error) {
        console.error('Error loading internal links:', error);
    }
}

// ============================================
// NAVIGATION MENU
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
// TRUST SECTION
// ============================================
async function loadTrustSection() {
    const trustGrid = document.getElementById('trustGrid');
    if (!trustGrid) return;
    
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getTrustSection);
        if (data.items && data.items.length) {
            trustGrid.innerHTML = data.items.map(item => `
                <div class="trust-item">
                    <span class="trust-icon">${item.icon}</span>
                    <h3>${item.title}</h3>
                    <p>${item.description}</p>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading trust section:', error);
    }
}

// ============================================
// EMERGENCY CTA
// ============================================
async function loadEmergencyCTA() {
    const ctaSection = document.querySelector('.emergency-cta');
    if (!ctaSection) return;
    
    try {
        const data = await callAPI(CONFIG.ENDPOINTS.getEmergencyCTA);
        if (data && !data.error) {
            const iconEl = ctaSection.querySelector('.cta-icon');
            const titleEl = ctaSection.querySelector('h2');
            const subtitleEl = ctaSection.querySelector('.cta-subtitle');
            
            if (iconEl && data.icon) iconEl.textContent = data.icon;
            if (titleEl && data.title) titleEl.textContent = data.title;
            if (subtitleEl && data.subtitle) subtitleEl.textContent = data.subtitle;
        }
    } catch (error) {
        console.error('Error loading emergency CTA:', error);
    }
}

// ============================================
// FOOTER SECTIONS (Advanced)
// ============================================
async function loadFooterSections() {
    const footerGrid = document.getElementById('footerGrid');
    if (!footerGrid) return;
    
    footerGrid.innerHTML = '<div class="spinner"></div>';
    try {
        const sections = await callAPI(CONFIG.ENDPOINTS.getFooterSections);
        const socialLinks = await callAPI(CONFIG.ENDPOINTS.getFooterSocialLinks);
        const policyLinks = await callAPI(CONFIG.ENDPOINTS.getFooterPolicyLinks);
        const trustBadges = await callAPI(CONFIG.ENDPOINTS.getFooterTrustBadges);
        const newsletter = await callAPI(CONFIG.ENDPOINTS.getFooterNewsletter);
        const apps = await callAPI(CONFIG.ENDPOINTS.getFooterApps);
        const paymentMethods = await callAPI(CONFIG.ENDPOINTS.getFooterPaymentMethods);
        const businessHours = await callAPI(CONFIG.ENDPOINTS.getFooterBusinessHours);
        const services = await callAPI(CONFIG.ENDPOINTS.getMainCategories, { limit: 8 });
        const cities = await callAPI(CONFIG.ENDPOINTS.getCities, { limit: 8 });
        const emergencyNumber = await callAPI(CONFIG.ENDPOINTS.getEmergencyNumber);
        
        let footerHTML = `
            <div class="footer-grid-advanced">
                <!-- Column 1: Brand -->
                <div class="footer-col-advanced">
                    <div class="footer-logo">
                        <span class="footer-logo-icon">🚨</span>
                        <span class="footer-logo-text">HelpNow</span>
                    </div>
                    <p class="footer-about">${sections.about_text || '24/7 emergency home services connecting you with licensed professionals instantly.'}</p>
                    <div class="footer-social">
                        ${socialLinks.map(s => `<a href="${s.url}" class="social-icon" target="_blank" rel="noopener noreferrer">${s.icon} ${s.name}</a>`).join('')}
                    </div>
                </div>
                
                <!-- Column 2: Emergency Services -->
                <div class="footer-col-advanced">
                    <h4 class="footer-heading">Emergency Services</h4>
                    <ul class="footer-links">
                        ${services.services ? services.services.map(s => `<li><a href="/pages/${s.slug || s.category_id.toLowerCase()}.html">${s.category_name}</a></li>`).join('') : ''}
                    </ul>
                </div>
                
                <!-- Column 3: Service Areas -->
                <div class="footer-col-advanced">
                    <h4 class="footer-heading">Service Areas</h4>
                    <ul class="footer-links">
                        ${cities.cities ? cities.cities.map(c => `<li><a href="/pages/services-in-${c.city_name.toLowerCase().replace(/ /g, '-')}.html">${c.city_name}, ${c.state_code || c.state}</a></li>`).join('') : ''}
                    </ul>
                </div>
                
                <!-- Column 4: Business Hours -->
                <div class="footer-col-advanced">
                    <h4 class="footer-heading">24/7 Emergency Support</h4>
                    <div class="business-hours">
                        ${businessHours.map(h => `<div class="hours-row"><span class="hours-day">${h.day}:</span><span class="hours-time">${h.hours}</span></div>`).join('')}
                    </div>
                    <div class="emergency-phone-footer">
                        <span class="phone-icon">📞</span>
                        <span class="phone-number">${emergencyNumber.number || CONFIG.DEFAULT_EMERGENCY_NUMBER}</span>
                    </div>
                </div>
                
                <!-- Column 5: Trust Badges -->
                <div class="footer-col-advanced">
                    <h4 class="footer-heading">Why Choose Us</h4>
                    <div class="trust-badges">
                        ${trustBadges.map(b => `
                            <div class="trust-badge">
                                <span class="badge-icon">${b.icon}</span>
                                <span class="badge-text">${b.text}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        // Newsletter Section
        if (newsletter.enabled === 'Yes') {
            footerHTML += `
                <div class="footer-newsletter">
                    <div class="newsletter-content">
                        <h4>${newsletter.title || 'Get Emergency Alerts'}</h4>
                        <p>${newsletter.subtitle || 'Subscribe for safety tips and emergency updates'}</p>
                    </div>
                    <form class="newsletter-form" id="newsletterForm">
                        <input type="email" placeholder="${newsletter.placeholder || 'Enter your email'}" required>
                        <button type="submit">${newsletter.button_text || 'Subscribe'}</button>
                    </form>
                </div>
            `;
        }
        
        // Apps Section
        if (apps.length) {
            footerHTML += `
                <div class="footer-apps">
                    <h4>Download Our App</h4>
                    <div class="app-links">
                        ${apps.map(a => `<a href="${a.url}" class="app-link" target="_blank">${a.icon} ${a.name}</a>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Payment Methods
        if (paymentMethods.length) {
            footerHTML += `
                <div class="footer-payment">
                    <span class="payment-label">We Accept:</span>
                    <div class="payment-icons">
                        ${paymentMethods.map(p => `<span class="payment-icon" title="${p.name}">${p.icon}</span>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Bottom Bar
        footerHTML += `
            <div class="footer-bottom-advanced">
                <div class="copyright">
                    © ${new Date().getFullYear()} HelpNow. ${sections.copyright_text || 'All rights reserved.'}
                </div>
                <div class="footer-policy-links">
                    ${policyLinks.map(p => `<a href="${p.url}">${p.name}</a>`).join(' | ')}
                </div>
            </div>
        `;
        
        footerGrid.innerHTML = footerHTML;
        
        // Initialize newsletter form
        const newsletterForm = document.getElementById('newsletterForm');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }
    } catch (error) {
        console.error('Error loading footer sections:', error);
        footerGrid.innerHTML = '<p>Unable to load footer.</p>';
    }
}

// Rest of footer loaders (social links, policy links, trust badges, newsletter, apps, payment methods, business hours)
async function loadFooterSocialLinks() { /* Handled in loadFooterSections */ }
async function loadFooterPolicyLinks() { /* Handled in loadFooterSections */ }
async function loadFooterTrustBadges() { /* Handled in loadFooterSections */ }
async function loadFooterNewsletter() { /* Handled in loadFooterSections */ }
async function loadFooterApps() { /* Handled in loadFooterSections */ }
async function loadFooterPaymentMethods() { /* Handled in loadFooterSections */ }
async function loadFooterBusinessHours() { /* Handled in loadFooterSections */ }

// ============================================
// SMART SEARCH
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
            const results = await callAPI(CONFIG.ENDPOINTS.search, { q: query, location: location, category: category });
            
            if (results.suggestions && results.suggestions.length) {
                suggestionsDiv.innerHTML = results.suggestions.map(s => `
                    <div class="suggestion-item" data-url="${s.url}">
                        <strong>${s.display_text || s.keyword}</strong>
                        <small>${s.category || 'Emergency Service'} in ${s.city || 'Your Area'}</small>
                    </div>
                `).join('');
                suggestionsDiv.classList.add('active');
                
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', () => { window.location.href = item.dataset.url; });
                });
            } else {
                suggestionsDiv.classList.remove('active');
            }
        } catch (error) {
            console.error('Search error:', error);
            suggestionsDiv.classList.remove('active');
        }
    };
    
    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(performSearch, 300);
    });
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) window.location.href = `/search.html?q=${encodeURIComponent(query)}`;
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
// FORMS SUBMISSION
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

// Newsletter submission
async function handleNewsletterSubmit(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    try {
        const result = await callAPI('/subscribeNewsletter', { email: email }, 'POST');
        if (result.success) {
            showNotification('Subscribed successfully!', 'success');
            e.target.reset();
        } else {
            showNotification('Something went wrong', 'error');
        }
    } catch (error) {
        showNotification('Something went wrong', 'error');
    }
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
    const mobileBtn = document.getElementById('mobileMenu');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileBtn && navLinks) {
        mobileBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileBtn.classList.toggle('active');
            mobileBtn.setAttribute('aria-expanded', navLinks.classList.contains('active'));
        });
    }
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#' || href === '') return;
            
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// ============================================
// FAQ TOGGLES
// ============================================
function initFAQToggles() {
    document.querySelectorAll('.faq-card').forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });
    });
}

// ============================================
// NOTIFICATION
// ============================================
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `<span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span> ${message}`;
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
// EXPORT FUNCTIONS
// ============================================
if (typeof window !== 'undefined') {
    window.trackCall = trackCall;
    window.showNotification = showNotification;
    window.initFAQToggles = initFAQToggles;
                }
