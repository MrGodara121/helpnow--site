// ============================================
// HELPNOW.COM - FOOTER SCHEMA MARKUP
// For rich snippets in Google Search
// ============================================

// Add all schema markup after page loads
document.addEventListener('DOMContentLoaded', async () => {
    await addOrganizationSchema();
    await addLocalBusinessSchema();
    await addBreadcrumbSchema();
    await addSiteNavigationSchema();
});

// Organization Schema
async function addOrganizationSchema() {
    const emergencyNumber = await getEmergencyNumberFromConfig();
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "HelpNow",
        "alternateName": "HelpNow Emergency Services",
        "url": window.location.origin,
        "logo": `${window.location.origin}/assets/images/logo.png`,
        "description": "24/7 emergency home services connecting you with licensed professionals instantly.",
        "telephone": emergencyNumber,
        "email": "support@helpnow.com",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": emergencyNumber,
            "contactType": "emergency",
            "contactOption": "TollFree",
            "areaServed": "US",
            "availableLanguage": ["English", "Spanish"],
            "hoursAvailable": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                "opens": "00:00",
                "closes": "23:59"
            }
        },
        "sameAs": [
            "https://www.facebook.com/helpnow",
            "https://twitter.com/helpnow",
            "https://www.instagram.com/helpnow",
            "https://www.linkedin.com/company/helpnow",
            "https://www.youtube.com/helpnow"
        ],
        "areaServed": [
            { "@type": "City", "name": "New York" },
            { "@type": "City", "name": "Los Angeles" },
            { "@type": "City", "name": "Chicago" },
            { "@type": "City", "name": "Houston" },
            { "@type": "City", "name": "Phoenix" }
        ],
        "foundingDate": "2024",
        "foundingLocation": { "@type": "Place", "address": { "@type": "PostalAddress", "addressLocality": "New York", "addressRegion": "NY", "addressCountry": "US" } },
        "legalName": "HelpNow Emergency Services LLC",
        "taxID": "XX-XXXXXXX",
        "duns": "XXXXXXXX",
        "brand": { "@type": "Brand", "name": "HelpNow", "logo": `${window.location.origin}/assets/images/logo.png` }
    };
    
    addScriptToHead(schema, 'organization-schema');
}

// Local Business Schema
async function addLocalBusinessSchema() {
    const emergencyNumber = await getEmergencyNumberFromConfig();
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        "name": "HelpNow",
        "description": "24/7 emergency home services - plumbing, water damage, electrical, roofing, HVAC, fire damage, insurance claims",
        "url": window.location.origin,
        "telephone": emergencyNumber,
        "priceRange": "$$",
        "openingHours": "Mo-Su 00:00-23:59",
        "openingHoursSpecification": [
            { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], "opens": "00:00", "closes": "23:59" }
        ],
        "address": { "@type": "PostalAddress", "addressLocality": "New York", "addressRegion": "NY", "postalCode": "10001", "addressCountry": "US" },
        "geo": { "@type": "GeoCoordinates", "latitude": "40.7128", "longitude": "-74.0060" },
        "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "reviewCount": "1250", "bestRating": "5", "worstRating": "1" },
        "areaServed": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"],
        "hasOfferCatalog": {
            "@type": "OfferCatalog",
            "name": "Emergency Services",
            "itemListElement": [
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Emergency Plumbing", "description": "24/7 emergency plumbing services - burst pipes, leaks, backups" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Water Damage Restoration", "description": "24/7 water damage cleanup - flood, extraction, drying" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Emergency Electrician", "description": "24/7 electrical emergency services - power outage, sparks" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Emergency Roof Repair", "description": "24/7 roof repair - storm damage, leaks, tarp" } },
                { "@type": "Offer", "itemOffered": { "@type": "Service", "name": "HVAC Emergency", "description": "24/7 heating and cooling - no heat, no AC" } }
            ]
        },
        "paymentAccepted": "Cash, Credit Card, PayPal, Apple Pay, Google Pay",
        "currenciesAccepted": "USD",
        "serviceArea": { "@type": "GeoCircle", "geoMidpoint": { "@type": "GeoCoordinates", "latitude": "40.7128", "longitude": "-74.0060" }, "geoRadius": "50000" }
    };
    
    addScriptToHead(schema, 'localbusiness-schema');
}

// Breadcrumb Schema
async function addBreadcrumbSchema() {
    const path = window.location.pathname;
    const pathSegments = path.split('/').filter(seg => seg && seg !== '');
    
    const breadcrumbs = [{ name: "Home", url: "/" }];
    let currentPath = "";
    
    for (const segment of pathSegments) {
        currentPath += `/${segment}`;
        let name = segment.replace(/\.html$/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        breadcrumbs.push({ name: name, url: currentPath });
    }
    
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbs.map((crumb, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": crumb.name,
            "item": window.location.origin + crumb.url
        }))
    };
    
    addScriptToHead(schema, 'breadcrumb-schema');
}

// Site Navigation Schema
async function addSiteNavigationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SiteNavigationElement",
        "name": "Main Navigation",
        "description": "Main navigation menu for HelpNow emergency services",
        "url": window.location.origin,
        "hasPart": [
            { "@type": "SiteNavigationElement", "name": "Home", "url": `${window.location.origin}/` },
            { "@type": "SiteNavigationElement", "name": "Emergency Services", "url": `${window.location.origin}/#services` },
            { "@type": "SiteNavigationElement", "name": "Service Areas", "url": `${window.location.origin}/#cities` },
            { "@type": "SiteNavigationElement", "name": "How It Works", "url": `${window.location.origin}/#how-it-works` },
            { "@type": "SiteNavigationElement", "name": "Insurance Help", "url": `${window.location.origin}/insurance-claims` },
            { "@type": "SiteNavigationElement", "name": "Blog", "url": `${window.location.origin}/blog` }
        ]
    };
    
    addScriptToHead(schema, 'navigation-schema');
}

// Helper function to add schema script
function addScriptToHead(schema, id) {
    if (document.getElementById(id)) return;
    
    const script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
}

// Get emergency number from config
async function getEmergencyNumberFromConfig() {
    try {
        if (typeof callAPI !== 'undefined') {
            const data = await callAPI(CONFIG.ENDPOINTS.getEmergencyNumber);
            return data.number || CONFIG.DEFAULT_EMERGENCY_NUMBER || '+18889180798';
        }
    } catch(e) {}
    return '+18889180798';
}
