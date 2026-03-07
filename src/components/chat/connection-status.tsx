'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  const [visible, setVisible] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);

  useEffect(() => {
    if (!isConnected) {
      setVisible(true);
      setWasDisconnected(true);
      return;
    }

    if (wasDisconnected) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setWasDisconnected(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, wasDisconnected]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className={cn('fixed bottom-4 left-1/2 -translate-x-1/2 z-50', className)}
      >
        <div
          className={cn(
            'px-4 py-2 rounded-lg shadow-lg backdrop-blur-sm flex items-center gap-2',
            isConnected
              ? 'bg-green-100 dark:bg-green-900/80 text-green-800 dark:text-green-200'
              : 'bg-yellow-100 dark:bg-yellow-900/80 text-yellow-800 dark:text-yellow-200'
          )}
        >
          {isConnected ? (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-medium">Connected</span>
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Reconnecting...</span>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ConnectionStatusIndicator({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-red-600 dark:text-red-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          </>
        )}
      </div>
      <span className="text-xs text-muted-foreground">{isConnected ? 'Online' : 'Offline'}</span>
    </div>
  );
}
