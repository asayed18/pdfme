// Google Analytics utility functions

// Add type definitions for the global gtag function
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
  
  interface ImportMeta {
    env: {
      DEV: boolean;
      [key: string]: any;
    };
  }
}

// Initialize Google Analytics
export const initGA = (measurementId: string) => {
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
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId);

  // Make gtag available globally
  window.gtag = gtag;
};

// Track page views
export const pageView = (path: string) => {
  if (!window.gtag || import.meta.env.DEV) return;
  
  window.gtag('event', 'page_view', {
    page_path: path,
    page_location: window.location.href,
    page_title: document.title
  });
};

// Track events (e.g., button clicks, feature usage)
export const trackEvent = (category: string, action: string, label: string | null = null, value: number | null = null) => {
  if (!window.gtag || import.meta.env.DEV) return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value
  });
};