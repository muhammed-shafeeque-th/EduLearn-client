import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/providers/theme/theme-provider';
import { ToastProvider } from '@/lib/providers/toast-provider';
import { RootProviders } from '@/lib/providers';
import React from 'react';
import { config } from '@/lib/config';
import { SITE_NAME } from '@/lib/constants';
import { absoluteUrl } from '@/lib/constants/routes';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  colorScheme: 'light dark',
};

export const metadata: Metadata = {
  title: { default: 'EduLearn - Learn Anything, Anytime', template: '%s | EduLearn' },
  description: 'EduLearn is a modern e-learning platform offering high-quality online courses.',
  robots: 'index, follow',
  metadataBase: new URL(config.siteUrl),
  icons: { icon: '/icons/icon.png', apple: '/icons/apple-icon.png' },
  openGraph: {
    title: "Structured courses, taught by practitioners'",
    description: 'EduLearn is a modern e-learning platform offering high-quality online courses.',
    url: new URL(config.siteUrl),
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: absoluteUrl('/images/opengraph-image.png'),
        width: 1200,
        height: 630,
        alt: 'Structured courses, taught by practitioners',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <RootProviders>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </RootProviders>
        <ToastProvider />
        <div id="modal-root" />
      </body>
    </html>
  );
}
