import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { ScrollLine } from '@/components/scroll-line';
import { MotionRuntime } from '@/components/motion-runtime';
import { CookieConsent } from '@/components/cookie-consent';
import { VisitorTracker } from '@/components/visitor-tracker';
import { AdminEntry } from '@/components/admin-entry';

export const metadata: Metadata = {
  title: 'Tejas Kandi | Full-Stack Engineer, AI Systems, IoT & Robotics',
  description:
    'Premium engineering portfolio featuring real-time systems, AI workflows, embedded projects, and production-grade delivery.',
  metadataBase: new URL('https://tejaskandi.dev'),
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Tejas Kandi Portfolio',
    description: 'A futuristic engineering command center portfolio.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ScrollLine />
        <MotionRuntime />
        <AdminEntry />
        <VisitorTracker />
        <CookieConsent />
        {children}
      </body>
    </html>
  );
}
