import { useEffect, useRef, useState } from 'react';
import { userService } from '@/services/user.service';
import { getSocketService, SocketService } from '../socket.service';

/**
 * Hook to subscribe to online users list (server + live events)
 */
export function useOnlineUsers() {
  // store the socket service instance (stable ref, no re-instantiation)
  const socketRef = useRef<SocketService | null>(null);

  // use Set for easy add/remove, but return typed as string[]
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;

    // Always use latest socket (create if not already)
    if (!socketRef.current) {
      socketRef.current = getSocketService();
    }
    const socket = socketRef.current;

    // Fetch initial online users from HTTP
    userService
      .getOnlineUsers()
      .then((res) => {
        if (isMounted && res.success && Array.isArray(res.data)) {
          setOnlineUsers(new Set(res.data));
        } else if (!res.success) {
          console.error(res.message);
        }
      })
      .catch((err) => {
        console.error('Failed to load online users', err);
      });

    // Listen to online/offline socket events
    const handleOnline = (payload: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(payload.userId);
        return next;
      });
    };

    const handleOffline = (payload: { userId: string }) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(payload.userId);
        return next;
      });
    };
    const unsubs: Array<() => void> = [];

    unsubs.push(socket.on('user:online', handleOnline), socket.on('user:offline', handleOffline));

    // Cleanup on unmount
    return () => {
      isMounted = false;
      unsubs.forEach((fn) => fn());
      // socket.off('user:offline', handleOffline);
    };
    // We intentionally don't want to re-run if socket changes
  }, []);

  // Return a readonly set
  return new Set(onlineUsers) as ReadonlySet<string>;
}
