'use client';

import { memo } from 'react';
import { CreditCard } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  status?: string;
}

export const EmptyState = memo(function EmptyState({ status }: EmptyStateProps) {
  const message = status ? `No ${status} orders found` : 'No orders yet';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
          <CreditCard className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">{message}</h3>
        <p className="text-muted-foreground mb-6">
          Start exploring courses and make your first purchase!
        </p>
        <Link
          href="/courses"
          className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Browse Courses
        </Link>
      </div>
    </div>
  );
});
