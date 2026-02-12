// import { useCallback, useState } from 'react';
// import { useAppDispatch } from '@/store';
// import { checkEmail } from '@/store/slices/auth-slice';
// import { useDebounce } from '@/hooks/use-debounce';

// export default function useEmailCheck() {
//   const [emailStatus, setEmailStatus] = useState<{
//     status: 'available' | 'already-exist' | 'error';
//     message: string;
//   } | null>(null);
//   const [isCheckingEmail, setIsCheckingEmail] = useState(false);
//   const dispatch = useAppDispatch();

//   // Debounced function to check email
//   const emailCheck = useCallback(
//     useDebounce(async (email: string, isEmailValid: boolean) => {
//       if (!email || isEmailValid) return;

//       try {
//         setIsCheckingEmail(true);
//         const response = await dispatch(checkEmail({ email }));
//         console.log(response);

//         if (response.meta.requestStatus === 'fulfilled') {
//           setEmailStatus({ status: 'already-exist', message: 'Email already exists' });
//         } else {
//           setEmailStatus({ status: 'available', message: 'Email is available' });
//         }
//       } catch (error) {
//         if (error instanceof Error) {
//           setEmailStatus({ status: 'error', message: error.message || 'Error check email' });
//         }
//       } finally {
//         setIsCheckingEmail(false);
//       }
//     }, 1000), // 1000ms debounce
//     [useDebounce]
//   );

//   return { emailCheck, isCheckingEmail, emailStatus, setEmailStatus, setIsCheckingEmail };
// }

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/lib/utils';

export function useCheckEmail(email: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!email || !email.includes('@')) {
      setEmailExists(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsChecking(true);
        setError(null);

        const response = await authService.checkEmail({ email }, { signal: controller.signal });
        if (!response.success) {
          throw new Error(response.message);
        }

        setEmailExists(response.data.exists);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError(getErrorMessage(err, 'Failed to verify email'));
      } finally {
        setIsChecking(false);
      }
    }, 500); // debounce 500ms

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [email]);

  return { isChecking, emailExists, error };
}
