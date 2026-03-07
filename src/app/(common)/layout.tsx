import React, { Suspense } from 'react';
import Header from '../_/header';
import Footer from '../_/footer';

import 'plyr/dist/plyr.css';
import LoadingScreen from '@/components/ui/loading-screen';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground relative">
      {/* User-level */}
      <Suspense fallback={<LoadingScreen />}>
        <Header />
        <div className="min-h-screen">{children}</div>
        <Footer />
      </Suspense>
      {/* User-level */}
      <div id="user-modal-root" />
    </main>
  );
}
