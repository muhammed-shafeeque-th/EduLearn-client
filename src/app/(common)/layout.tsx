import React, { Suspense } from 'react';
import Header from '../_/header';
import Footer from '../_/footer';
import { RealtimeProviders } from '@/lib/providers';
import { RouteFallback } from '@/components/ui/route-fallback';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <RealtimeProviders>
      <main className="min-h-screen bg-background text-foreground relative">
        <Suspense fallback={<RouteFallback />}>
          <Header />
          <div className="min-h-screen">{children}</div>
          <Footer />
        </Suspense>
        <div id="user-modal-root" />
      </main>
    </RealtimeProviders>
  );
}
