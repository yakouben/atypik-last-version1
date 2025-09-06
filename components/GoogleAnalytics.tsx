'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

interface GoogleAnalyticsProps {
  GA_MEASUREMENT_ID: string;
}

function GoogleAnalyticsInner({ GA_MEASUREMENT_ID }: GoogleAnalyticsProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    console.log('🔍 GA4 Setup Check:', {
      GA_MEASUREMENT_ID,
      pathname,
      gtagAvailable: typeof window !== 'undefined' && typeof window.gtag === 'function'
    });
    
    if (pathname && window.gtag) {
      window.gtag('config', GA_MEASUREMENT_ID, {
        page_path: pathname + searchParams.toString(),
        page_title: document.title,
      });
    }
  }, [pathname, searchParams, GA_MEASUREMENT_ID]);

  if (!GA_MEASUREMENT_ID) {
    console.log('❌ GA_MEASUREMENT_ID is missing!');
    return null;
  }

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_title: document.title,
              page_location: window.location.href,
              send_page_view: true,
              anonymize_ip: true,
              cookie_flags: 'SameSite=None;Secure'
            });
          `,
        }}
      />
    </>
  );
}

export default function GoogleAnalytics(props: GoogleAnalyticsProps) {
  return (
    <Suspense fallback={null}>
      <GoogleAnalyticsInner {...props} />
    </Suspense>
  );
}

// Utility function to track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  console.log('🎯 trackEvent called:', { action, category, label, value });
  if (typeof window !== 'undefined' && window.gtag) {
    console.log('✅ gtag is available, firing event');
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  } else {
    console.log('❌ gtag not available or not in browser');
  }
};

// Utility function to track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID!, {
      page_path: url,
    });
  }
};

// Specific event tracking functions for your requirements
export const trackFormSubmit = (formName: string) => {
  trackEvent('form_submit', 'engagement', formName);
};

export const trackCtaClick = (buttonName: string, location: string) => {
  console.log('🔥 trackCtaClick called:', buttonName, location);
  trackEvent('cta_click', 'engagement', `${buttonName}_${location}`);
};

export const trackReservation = (propertyName: string, propertyId?: string) => {
  console.log('🔥 trackReservation called:', propertyName, propertyId);
  trackEvent('reservation', 'conversion', propertyName, 1);
  // Also track as a conversion event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'purchase', {
      transaction_id: `reservation_${Date.now()}`,
      value: 1,
      currency: 'EUR',
      items: [{
        item_id: propertyId || 'unknown',
        item_name: propertyName,
        item_category: 'accommodation',
        quantity: 1
      }]
    });
  }
}; 