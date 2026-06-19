'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname } from 'next/navigation';

const COOKIE_NAME = 'portfolio_cookie_consent';

function readCookie(name: string) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function VisitorTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  const trackVisit = useCallback(() => {
    const consent = readCookie(COOKIE_NAME);
    if (consent !== 'accepted') return;
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/api') || pathname.startsWith('/terms')) {
      return;
    }

    const trackerKey = pathname;
    if (lastTracked.current === trackerKey) return;
    lastTracked.current = trackerKey;

    fetch('/api/visits', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        pathname,
        referrer: document.referrer || null,
        userAgent: navigator.userAgent,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
        consent,
      }),
    }).catch(() => {
      lastTracked.current = null;
    });
  }, [pathname]);

  useEffect(() => {
    trackVisit();
  }, [trackVisit]);

  useEffect(() => {
    const refresh = () => {
      lastTracked.current = null;
      trackVisit();
    };

    window.addEventListener('portfolio-consent-changed', refresh);
    return () => window.removeEventListener('portfolio-consent-changed', refresh);
  }, [trackVisit]);

  return null;
}
