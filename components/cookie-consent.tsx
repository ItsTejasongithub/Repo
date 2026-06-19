'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const COOKIE_NAME = 'portfolio_cookie_consent';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

type ConsentState = 'accepted' | 'rejected' | 'pending';

function readConsent(): ConsentState {
  if (typeof document === 'undefined') return 'pending';
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]+)`));
  if (!match) return 'pending';
  const value = decodeURIComponent(match[1]);
  if (value === 'accepted' || value === 'rejected') return value;
  return 'pending';
}

function writeConsent(value: 'accepted' | 'rejected') {
  document.cookie = `${COOKIE_NAME}=${value}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentState>('pending');

  useEffect(() => {
    setConsent(readConsent());
  }, []);

  if (consent !== 'pending') {
    return null;
  }

  const accept = () => {
    writeConsent('accepted');
    setConsent('accepted');
    window.dispatchEvent(new Event('portfolio-consent-changed'));
  };

  const reject = () => {
    writeConsent('rejected');
    setConsent('rejected');
    window.dispatchEvent(new Event('portfolio-consent-changed'));
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4">
      <div className="container-pad glass metal-border flex max-h-[85vh] flex-col gap-4 overflow-auto rounded-3xl p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-xs uppercase tracking-[0.35em] text-electric/70">Privacy notice</p>
          <h2 className="text-base font-semibold text-white sm:text-lg">Cookies help power visitor analytics on this site.</h2>
          <p className="text-sm leading-6 text-white/70">
            I only store visit data after consent. You can reject analytics cookies and still browse the portfolio.
            Read the full terms and privacy notes on the legal page.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <Link
            href="/terms"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <X className="h-4 w-4" />
            Terms
          </Link>
          <button
            type="button"
            onClick={reject}
            className="w-full rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white sm:w-auto"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={accept}
            className="w-full rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition hover:scale-[1.02] sm:w-auto"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
