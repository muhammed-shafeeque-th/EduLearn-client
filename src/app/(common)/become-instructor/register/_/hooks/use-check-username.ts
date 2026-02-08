'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { userService } from '@/services/user.service';

export function useCheckUsername(username: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [usernameExists, setUsernameExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameExists(null);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setIsChecking(true);
        setError(null);

        const res = await userService.checkUsername({ username }, { signal: controller.signal });
        if (!res.success) {
          throw new Error(res.message);
        }

        setUsernameExists(res.data.exists);
      } catch (err) {
        if (axios.isCancel(err)) return;
        setError('Failed to check username availability.');
      } finally {
        setIsChecking(false);
      }
    }, 500); // debounce 500ms

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [username]);

  return { isChecking, usernameExists, error };
}
