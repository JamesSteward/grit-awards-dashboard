/**
 * Web Vitals Reporting for GRIT Awards
 * 
 * Tracks Core Web Vitals metrics and sends them to analytics.
 * Integrates with Vercel Analytics automatically.
 * 
 * Metrics tracked:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 */

/**
 * Send metric to analytics
 * @param {Object} metric - Web Vitals metric object
 */
function sendToAnalytics(metric) {
  const { name, value, id, rating } = metric;
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Web Vitals] ${name}:`, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      rating,
      id,
    });
  }
  
  // Send to Vercel Analytics (automatically integrated)
  if (window.va) {
    window.va('event', {
      name: 'web-vitals',
      data: {
        metric: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        rating,
        id,
      },
    });
  }
  
  // Send to Google Analytics 4 (if configured)
  if (window.gtag && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    window.gtag('event', name, {
      event_category: 'Web Vitals',
      event_label: id,
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      non_interaction: true,
    });
  }
  
  // Send to custom analytics endpoint (if needed)
  if (import.meta.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(import.meta.env.VITE_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        metric: name,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        rating,
        id,
        url: window.location.href,
        timestamp: Date.now(),
      }),
    }).catch(console.error);
  }
}

/**
 * Initialize Web Vitals reporting
 * Uses dynamic import to keep bundle size small
 */
export function initWebVitals() {
  // Only run in production or when explicitly enabled
  if (!import.meta.env.PROD && !import.meta.env.VITE_WEB_VITALS_DEV) {
    return;
  }
  
  // Dynamically import web-vitals library
  // This keeps it out of the main bundle
  import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }).catch((error) => {
    console.error('Failed to load web-vitals:', error);
  });
}

/**
 * Report a custom event to analytics
 * @param {string} eventName - Name of the event
 * @param {Object} eventData - Event data payload
 */
export function reportEvent(eventName, eventData = {}) {
  // Send to Vercel Analytics
  if (window.va) {
    window.va('event', {
      name: eventName,
      data: eventData,
    });
  }
  
  // Send to Google Analytics
  if (window.gtag && import.meta.env.VITE_GA_MEASUREMENT_ID) {
    window.gtag('event', eventName, eventData);
  }
  
  // Log in development
  if (import.meta.env.DEV) {
    console.log(`[Analytics] Event: ${eventName}`, eventData);
  }
}

export default initWebVitals;

