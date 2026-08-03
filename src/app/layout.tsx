import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { RootProviders } from '@/lib/providers';
import { ThemeProvider } from '@/lib/providers/theme/theme-provider';
import { AuthSessionProvider } from '@/lib/providers/auth-session-provider';
import React, { Suspense } from 'react';
import { ToastProvider } from '@/lib/providers/toast-provider';
import OneTapProvider from '@/lib/providers/one-tap-provider';
import { RouteFallback } from '@/components/ui/route-fallback';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  colorScheme: 'dark',
};

export const metadata: Metadata = {
  title: {
    default: 'EduLearn - Learn Anything, Anytime',
    template: '%s | EduLearn',
  },
  description: 'EduLearn is a modern e-learning platform offering high-quality online courses.',
  robots: 'index, follow',
  metadataBase: new URL('https://edulearn.vercel.app'),
  openGraph: {
    title: 'EduLearn',
    description: 'Learn Anything, Anytime with EduLearn',
    url: 'https://www.edulearn.com',
    type: 'website',
    images: [
      {
        url: 'https://www.edulearn.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EduLearn Open Graph Image',
      },
      '/og-default.png',
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduLearn',
    description: 'Learn Anything, Anytime with EduLearn',
    site: '@EduLearn',
    creator: '@EduLearnTeam',
    images: ['https://www.edulearn.com/twitter-image.jpg'],
  },
  icons: {
    icon: '/edulearn-icon.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} font-sans antialiased`}>
        <RootProviders>
          <AuthSessionProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <main className="min-h-screen flex flex-col">
                <Suspense fallback={<RouteFallback />}>{children}</Suspense>
              </main>
              <OneTapProvider />
            </ThemeProvider>
          </AuthSessionProvider>
        </RootProviders>
        <ToastProvider />
        <div id="modal-root" />
      </body>
    </html>
  );
}
