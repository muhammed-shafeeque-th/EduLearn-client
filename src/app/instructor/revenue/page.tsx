import { Metadata } from 'next';
import { RevenuePageClient } from './_/components/revenue-page-client';
import RevenueLoading from './loading';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Revenue & Wallet | Instructor Dashboard - EduLearn',
  description:
    'Manage your earnings, track revenue, view transactions, and request payouts. Complete financial overview for instructors.',
  keywords: ['instructor revenue', 'earnings', 'wallet', 'payout', 'transactions'],
  openGraph: {
    title: 'Revenue & Wallet - Instructor Dashboard',
    description: 'Track your earnings and manage payouts',
    type: 'website',
  },
};

export default function RevenuePage() {
  return (
    <Suspense fallback={<RevenueLoading />}>
      <RevenuePageClient />
    </Suspense>
  );
}
