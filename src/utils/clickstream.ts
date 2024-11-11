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

  const appId = process.env.NEXT_PUBLIC_CLICKSTREAM_APP_ID;
  const endpoint = process.env.NEXT_PUBLIC_CLICKSTREAM_ENDPOINT;

  if (!appId || !endpoint) {
    console.warn('Clickstream event not recorded: Missing appId or endpoint');
    return;
  }

  try {
    ClickstreamAnalytics.record({
      name,
      attributes
    });
  } catch (error) {
    console.error('Failed to record Clickstream event:', error);
  }
}; 