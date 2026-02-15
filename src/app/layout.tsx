import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import { StateProviders } from '@/lib/providers';
import { ThemeProvider } from '@/lib/providers/theme/theme-provider';
import { AuthSessionProvider } from '@/lib/providers/auth-session-provider';
import React, { Suspense } from 'react';
import { ToastProvider } from '@/lib/providers/toast-provider';
import OneTapProvider from '@/lib/providers/one-tap-provider';
// import { getOneTapConfig } from '@/lib/config/one-tap-config';
import LoadingScreen from '@/components/ui/loading-screen';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
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
  // Get One Tap configuration - you can change this to any preset from one-tap-config.ts
  // const config = getOneTapConfig('mobile-friendly');

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} antialiased`}>
        <StateProviders>
          <AuthSessionProvider>
            <OneTapProvider />
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              <main className="min-h-screen flex flex-col">
                <Suspense fallback={<LoadingScreen />}>{children}</Suspense>
              </main>
            </ThemeProvider>
          </AuthSessionProvider>
        </StateProviders>
        <ToastProvider />

        {/* Portals/Modals can be rendered here if needed */}
        <div id="modal-root" />
      </body>
    </html>
  );
}
