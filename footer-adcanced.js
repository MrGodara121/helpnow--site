// ============================================
// HELPNOW.COM - ADVANCED FOOTER
// 100% Google Sheet Controlled
// ============================================

// Load advanced footer after main content
document.addEventListener('DOMContentLoaded', async () => {
    await loadAdvancedFooter();
    await initFooterNewsletter();
    await initFooterScrollEffects();
});

async function loadAdvancedFooter() {
    const footer = document.getElementById('mainFooter');
    if (!footer) return;
    
    try {
        const [sections, socialLinks, policyLinks, trustBadges, newsletter, apps, paymentMethods, businessHours, services, cities, emergencyNumber] = await Promise.all([
            callAPI(CONFIG.ENDPOINTS.getFooterSections),
            callAPI(CONFIG.ENDPOINTS.getFooterSocialLinks),
            callAPI(CONFIG.ENDPOINTS.getFooterPolicyLinks),
            callAPI(CONFIG.ENDPOINTS.getFooterTrustBadges),
            callAPI(CONFIG.ENDPOINTS.getFooterNewsletter),
            callAPI(CONFIG.ENDPOINTS.getFooterApps),
            callAPI(CONFIG.ENDPOINTS.getFooterPaymentMethods),
            callAPI(CONFIG.ENDPOINTS.getFooterBusinessHours),
            callAPI(CONFIG.ENDPOINTS.getMainCategories, { limit: 8 }),
            callAPI(CONFIG.ENDPOINTS.getCities, { limit: 8 }),
            callAPI(CONFIG.ENDPOINTS.getEmergencyNumber)
        ]);
        
        const emergencyNumberValue = emergencyNumber.number || CONFIG.DEFAULT_EMERGENCY_NUMBER;
        
        let footerHTML = `
            <div class="container">
                <div class="footer-grid-advanced">
                    <!-- Column 1: Brand -->
                    <div class="footer-col-advanced">
                        <div class="footer-logo">
                            <span class="footer-logo-icon">🚨</span>
                            <span class="footer-logo-text">HelpNow</span>
                        </div>
                        <p class="footer-about">${sections.about_text || '24/7 emergency home services connecting you with licensed professionals instantly.'}</p>
                        <div class="footer-social">
                            ${socialLinks.map(s => `<a href="${s.url}" class="social-icon" target="_blank" rel="noopener noreferrer" aria-label="${s.name}">${s.icon}</a>`).join('')}
                        </div>
                    </div>
                    
                    <!-- Column 2: Emergency Services -->
                    <div class="footer-col-advanced">
                        <h4 class="footer-heading">Emergency Services</h4>
                        <ul class="footer-links">
                            ${services.services ? services.services.slice(0, 8).map(s => `<li><a href="/pages/${s.slug || s.category_id.toLowerCase().replace(/ /g, '-')}.html">${s.category_name}</a></li>`).join('') : '<li>Loading...</li>'}
                        </ul>
                    </div>
                    
                    <!-- Column 3: Service Areas -->
                    <div class="footer-col-advanced">
                        <h4 class="footer-heading">Service Areas</h4>
                        <ul class="footer-links">
                            ${cities.cities ? cities.cities.slice(0, 8).map(c => `<li><a href="/pages/services-in-${c.city_name.toLowerCase().replace(/ /g, '-')}.html">${c.city_name}, ${c.state_code || c.state}</a></li>`).join('') : '<li>Loading...</li>'}
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
                            <span class="phone-number">${emergencyNumberValue}</span>
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
                    <form class="newsletter-form" id="footerNewsletterForm">
                        <input type="email" placeholder="${newsletter.placeholder || 'Enter your email'}" required>
                        <button type="submit">${newsletter.button_text || 'Subscribe'}</button>
                    </form>
                </div>
            `;
        }
        
        // Apps Section
        if (apps && apps.length) {
            footerHTML += `
                <div class="footer-apps">
                    <h4>Download Our App</h4>
                    <div class="app-links">
                        ${apps.map(a => `<a href="${a.url}" class="app-link" target="_blank" rel="noopener noreferrer">${a.icon} ${a.name}</a>`).join('')}
                    </div>
                </div>
            `;
        }
        
        // Payment Methods
        if (paymentMethods && paymentMethods.length) {
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
            </div>
        `;
        
        footer.innerHTML = footerHTML;
        
    } catch (error) {
        console.error('Error loading advanced footer:', error);
        footer.innerHTML = `<div class="container"><p>© ${new Date().getFullYear()} HelpNow. All rights reserved.</p></div>`;
    }
}

// Initialize footer newsletter form
async function initFooterNewsletter() {
    const form = document.getElementById('footerNewsletterForm');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]').value;
        const submitBtn = form.querySelector('button');
        const originalText = submitBtn.textContent;
        
        submitBtn.textContent = 'Subscribing...';
        submitBtn.disabled = true;
        
        try {
            const result = await callAPI('/subscribeNewsletter', { email: email }, 'POST');
            if (result.success) {
                showNotification('Subscribed successfully!', 'success');
                form.reset();
            } else {
                showNotification('Something went wrong', 'error');
            }
        } catch (error) {
            showNotification('Something went wrong', 'error');
        }
        
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
}

// Footer scroll effects
function initFooterScrollEffects() {
    window.addEventListener('scroll', () => {
        const footer = document.getElementById('mainFooter');
        if (!footer) return;
        
        const scrollPosition = window.scrollY + window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        if (scrollPosition >= documentHeight - 100) {
            footer.classList.add('footer-visible');
        } else {
            footer.classList.remove('footer-visible');
        }
    });
}
