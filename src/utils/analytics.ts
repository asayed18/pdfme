// Google Analytics utility functions

// Initialize Google Analytics
export const initGA = (measurementId) => {
  // Skip during development
  if (import.meta?.env?.DEV) {
    console.log('Google Analytics initialized in development mode (no tracking)');
    return;
  }

  // Add the Google Analytics script to the document head
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);

  // Initialize the dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  gtag('js', new Date());
  gtag('config', measurementId);

  // Make gtag available globally
  window.gtag = gtag;
};

// Track page views
export const pageView = (path) => {
  if (!window.gtag || import.meta.env.DEV) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title
  });
};

// Track events (e.g., button clicks, feature usage)
export const trackEvent = (category, action, label = null, value = null) => {
  if (!window.gtag || import.meta.env.DEV) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
};