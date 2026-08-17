'use client';

import { memo } from 'react';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All Orders' },
  { value: 'succeeded', label: 'Completed' },
  { value: 'processing', label: 'Processing' },
  { value: 'failed', label: 'Failed' },
] as const;

interface OrdersFilterProps {
  currentStatus: string;
  onFilterChange: (status: string) => void;
  isPending: boolean;
}

export const OrdersFilter = memo(function OrdersFilter({
  currentStatus,
  onFilterChange,
  isPending,
}: OrdersFilterProps) {
  return (
    <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter orders">
      {FILTER_OPTIONS.map((option) => (
        <button
          key={option.value}
          onClick={() => onFilterChange(option.value)}
          disabled={isPending}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            currentStatus === option.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          aria-pressed={currentStatus === option.value}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
});
