'use client';

import { ForwardRefExoticComponent, memo } from 'react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Order } from '@/types/order';

const STATUS_CONFIG: Record<
  Order['status'],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  { icon: ForwardRefExoticComponent<any>; color: string; bg: string; label: string }
> = {
  succeeded: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-50 dark:bg-green-900/20',
    label: 'Completed',
  },
  failed: {
    icon: XCircle,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-900/20',
    label: 'Failed',
  },
  cancelled: {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: 'Cancelled',
  },
  created: {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Created',
  },
  pending_payment: {
    icon: Clock,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    label: 'Pending Payment',
  },
  processing: {
    icon: Clock,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    label: 'Processing',
  },
  refunded: {
    icon: XCircle,
    color: 'text-purple-700 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    label: 'Refunded',
  },
  expired: {
    icon: XCircle,
    color: 'text-muted-foreground',
    bg: 'bg-muted',
    label: 'Expired',
  },
};

interface OrderHeaderProps {
  order: Pick<Order, 'id' | 'createdAt' | 'status'>;
}

export const OrderHeader = memo(function OrderHeader({ order }: OrderHeaderProps) {
  const status = STATUS_CONFIG[order.status];
  const StatusIcon = status.icon;

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{order.id}</h3>
        <time dateTime={order.createdAt} className="text-sm text-muted-foreground mt-1 block">
          {formattedDate}
        </time>
      </div>
      <div
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${status.bg} self-start sm:self-auto`}
        role="status"
        aria-label={`Order status: ${status.label}`}
      >
        <StatusIcon className={`w-4 h-4 ${status.color}`} aria-hidden="true" />
        <span className={`text-sm font-medium ${status.color}`}>{status.label}</span>
      </div>
    </div>
  );
});
