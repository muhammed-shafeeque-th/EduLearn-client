export interface WalletTransaction {
  id: string;
  amount: number;
  /** deposit, withdrawal, purchase, refund, etc. */
  type: string;
  /** pending, complete, failed, etc. */
  status: string;
  /** orderId, if applicable */
  relatedOrder: string;
  timestamp: string;
  note?: string | undefined;
}

export interface UserWallet {
  userId: string;
  balance: number;
  currency: string;
  transactions: WalletTransaction[];
  updatedAt?: string | undefined;
  createdAt?: string | undefined;
}

// Type Definitions
export interface RevenueData {
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  lifetimeEarnings: number;
  thisMonthEarnings: number;
  lastMonthEarnings: number;
  thisWeekEarnings: number;
  growthRate: number;
  transactionCount: number;
  averageOrderValue: number;
}

// interface WalletTransaction {
//   id: string;
//   type: 'enrollment' | 'payout' | 'refund' | 'fee' | 'bonus';
//   amount: number;
//   status: 'completed' | 'pending' | 'failed' | 'cancelled';
//   courseId?: string;
//   courseName?: string;
//   studentName?: string;
//   date: string;
//   description: string;
//   transactionFee?: number;
//   netAmount?: number;
// }

// export interface CourseEarning {
//   id: string;
//   courseName: string;
//   thumbnail: string;
//   totalRevenue: number;
//   enrollmentCount: number;
//   averagePrice: number;
//   revenueShare: number;
//   growth: number;
//   lastEnrollment: string;
// }

// interface PayoutInfo {
//   id: string;
//   amount: number;
//   status: 'completed' | 'pending' | 'processing';
//   requestDate: string;
//   completedDate?: string;
//   paymentMethod: string;
//   transactionId?: string;
// }

// export interface WalletData {
//   balance: number;
//   pendingAmount: number;
//   currency: string;
//   lastPayout: PayoutInfo | null;
//   paymentMethods: PaymentMethod[];
//   minimumPayout: number;
//   nextPayoutDate: string;
// }

// interface PaymentMethod {
//   id: string;
//   type: 'bank_account' | 'paypal' | 'stripe' | 'wise';
//   name: string;
//   last4: string;
//   isDefault: boolean;
//   verified: boolean;
// }
