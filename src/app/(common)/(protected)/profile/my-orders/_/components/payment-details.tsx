'use client';

import { memo } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';

interface PaymentDetailsProps {
  paymentMethod?: string;
  paymentStatus?: string;
  failureReason?: string;
}

export const PaymentDetails = memo(function PaymentDetails({
  paymentMethod,
  paymentStatus,
  failureReason,
}: PaymentDetailsProps) {
  // Handle the case where payment details (method or status) could not be presented
  const noPaymentInfo = !paymentMethod && !paymentStatus;

  return (
    <div className="mt-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <CreditCard className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Payment Method</span>
      </div>

      {noPaymentInfo ? (
        <p className="text-sm text-muted-foreground italic">Payment details not available.</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          {paymentMethod ? paymentMethod.toUpperCase() : <span className="italic">—</span>}
        </p>
      )}

      {paymentStatus === 'failed' && failureReason && (
        <div className="mt-3 flex items-start gap-2 p-3 bg-destructive/10 rounded-lg">
          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">Payment Failed</p>
            <p className="text-xs text-destructive/80 mt-1">{failureReason}</p>
          </div>
        </div>
      )}
    </div>
  );
});
