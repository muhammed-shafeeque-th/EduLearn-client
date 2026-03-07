'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { getErrorCodeMessage } from '@/lib/errors/error-codes';

export function useGlobalErrorToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const shownRef = useRef<string | null>(null);

  useEffect(() => {
    const errorCode = searchParams.get('error_code');
    if (!errorCode) return;

    // Deduplicate per navigation
    const uniqueKey = `${pathname}:${errorCode}`;
    if (shownRef.current === uniqueKey) return;

    const message =
      getErrorCodeMessage(errorCode) ?? 'An unexpected error occurred. Please try again.';

    toast.error({ title: message });

    shownRef.current = uniqueKey;

    // Remove error_code from URL so refresh doesn’t re-toast
    const params = new URLSearchParams(searchParams.toString());
    params.delete('error_code');

    router.replace(params.toString() ? `${pathname}?${params}` : pathname, { scroll: false });
  }, [searchParams, pathname, router]);
}
