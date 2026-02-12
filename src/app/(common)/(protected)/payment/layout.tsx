import { Metadata } from 'next';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Payment',
  description: 'Review and process your course payment securely.',
  openGraph: {
    title: 'Payment - EduLearn',
    description: 'Secure payment page for your course enrollment.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Payment - EduLearn',
    description: 'Access the secure payment page for your course.',
  },
};

interface PaymentLayoutProps {
  params: Promise<{ courseId: string }>;
  children: React.ReactNode;
}

export default function PaymentLayout({ children }: PaymentLayoutProps) {
  return (
    <>
      {/* Preload Razorpay EARLY */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />
      <main className="min-h-screen bg-background">{children}</main>
    </>
  );
}
