import { ReactNode } from 'react';

interface CheckoutLayoutProps {
  children: ReactNode;
}

export default async function CheckoutLayout({ children }: CheckoutLayoutProps) {
  return (
    <main className="min-h-screen flex flex-col bg-background text-foreground relative">
      {children}
    </main>
  );
}
