'use client';

import { normalizeCurrencyAmount } from '@/lib/utils';
import { memo } from 'react';

type PriceValue = number | string; // could be numeric or sku, or formatted string

interface PriceBreakdownProps {
  subtotal: PriceValue;
  discount: PriceValue;
  total: PriceValue;
  currency?: string; // e.g. 'USD', 'INR', etc.
  symbol?: string; // e.g. '$', '₹', etc., overrides default symbol for ISO if present
  /** if the price value is SKU/string, just render as is; if number, format */
}

// In this version, we assume numeric `price` is in the smallest unit (e.g., paise, cents)
// and convert it to its normal value before formatting.
function formatPrice(price: PriceValue, currency: string = 'USD', symbol?: string): string {
  // If price is a string/SKU, just return as is

  const amount = normalizeCurrencyAmount(price.toString());

  try {
    const formatted =
      (symbol ??
        (currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'INR' ? '₹' : '')) +
      amount.toLocaleString(undefined, {
        style: 'decimal', // show only the number, not currency name
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    return formatted;
  } catch {
    return `${amount}`;
  }
}

export const PriceBreakdown = memo(function PriceBreakdown({
  subtotal,
  discount,
  total,
  currency = 'INR',
  symbol,
}: PriceBreakdownProps) {
  const showDiscount =
    (typeof discount === 'number' && discount > 0) || (typeof discount === 'string' && discount);

  return (
    <div className="border-t border-border pt-4 space-y-2" aria-label="Price breakdown">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="text-foreground">{formatPrice(subtotal, currency, symbol)}</span>
      </div>
      {showDiscount && (
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Discount</span>
          <span className="text-green-600 dark:text-green-400">
            {/* Discount is always negative/shown with minus if number */}
            {typeof discount === 'number'
              ? '-' + formatPrice(discount, currency, symbol)
              : discount}
          </span>
        </div>
      )}
      <div className="flex justify-between text-base font-semibold pt-2 border-t border-border">
        <span className="text-foreground">Total</span>
        <span className="text-foreground">{formatPrice(total, currency, symbol)}</span>
      </div>
    </div>
  );
});
