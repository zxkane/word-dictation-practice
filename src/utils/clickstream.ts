import { ClickstreamAnalytics } from '@aws/clickstream-web';

export function initClickstream() {
  if (typeof window === 'undefined') return;

  const appId = process.env.NEXT_PUBLIC_CLICKSTREAM_APP_ID;
  const endpoint = process.env.NEXT_PUBLIC_CLICKSTREAM_ENDPOINT;

  if (!appId || !endpoint) {
    console.warn('Clickstream not initialized: Missing appId or endpoint');
    return;
  }

  try {
    ClickstreamAnalytics.init({
      appId,
      endpoint,
      isTrackPageViewEvents: true,
      isTrackUserEngagementEvents: true,
      isTrackClickEvents: true,
      isLogEvents: process.env.NODE_ENV === 'development'
    });
  } catch (error) {
    console.error('Failed to initialize Clickstream:', error);
  }
};

export const recordEvent = (name: string, attributes?: Record<string, string | number | boolean | null>) => {
  if (typeof window === 'undefined') return;

  // Record to Clickstream
  const appId = process.env.NEXT_PUBLIC_CLICKSTREAM_APP_ID;
  const endpoint = process.env.NEXT_PUBLIC_CLICKSTREAM_ENDPOINT;

  if (!appId || !endpoint) {
    console.warn('Clickstream event not recorded: Missing appId or endpoint');
  } else {
    try {
      ClickstreamAnalytics.record({
        name,
        attributes
      });
    } catch (error) {
      console.error('Failed to record Clickstream event:', error);
    }
  }

  // Record to Google Analytics
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (measurementId && window.dataLayer) {
    try {
      window.dataLayer.push({
        event: name,
        ...attributes
      });
    } catch (error) {
      console.error('Failed to record Google Analytics event:', error);
    }
  }
};

export function initGoogleAnalytics() {
  if (typeof window === 'undefined') return;

  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!measurementId) {
    console.warn('Google Analytics not initialized: Missing measurement ID');
    return;
  }

  try {
    // Add Google Analytics script tag
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    // Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    function gtag(...parameters: unknown[]) {
      window.dataLayer.push(parameters);
    }
    gtag('js', new Date());
    gtag('config', measurementId);
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
}

// Add type declaration for window
declare global {
  interface Window {
    dataLayer: unknown[];
  }
} 