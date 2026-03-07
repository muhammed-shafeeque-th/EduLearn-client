'use client';

import { Toaster } from 'sonner';
import { useTheme } from 'next-themes';

export function ToastProvider() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as 'light' | 'dark' | 'system'}
      position="top-center"
      //   closeButton
      richColors
      expand={false}
      visibleToasts={4}
      toastOptions={{
        className: 'toast',
        style: {
          borderRadius: '8px',
          fontSize: '14px',
        },
        duration: 4000,
      }}
      className="toaster group"
    />
  );
}
