'use client';

import React from 'react';
import { cn } from '@/lib/utils';

import type { UiMessage } from '@/types/chat';
import type { Chat } from '@/types/chat';
import type { UserInfo } from '@/types/user';

export function mergeMessagesBySequence(prev: UiMessage[], incoming: UiMessage[]) {
  const map = new Map<string, UiMessage>();

  for (const m of prev) map.set(m.id, m);
  for (const m of incoming) map.set(m.id, m);

  const merged = Array.from(map.values());
  merged.sort((a, b) => a.sequence - b.sequence);
  return merged;
}

export function getOtherUser(chat: Chat, currentUserId: string) {
  const otherUser = currentUserId === chat.studentId ? chat.instructor : chat.student;

  const otherUserId = currentUserId === chat.studentId ? chat.instructorId : chat.studentId;

  return { otherUser, otherUserId };
}

export function getUserDisplayName(user?: UserInfo | null) {
  if (!user) return 'Unknown';
  return user.name.trim() || user.email || 'Unknown';
}

// ============================================================================
// ENHANCED TYPING INDICATOR
// ============================================================================

interface TypingIndicatorProps {
  isVisible: boolean;
  userName?: string;
  className?: string;
}

export function TypingIndicator({ isVisible, userName, className }: TypingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl rounded-bl-md bg-card border border-border shadow-sm animate-in fade-in slide-in-from-bottom-2',
        className
      )}
    >
      <div className="flex space-x-1">
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '1.4s' }}
        />
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '200ms', animationDuration: '1.4s' }}
        />
        <div
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{ animationDelay: '400ms', animationDuration: '1.4s' }}
        />
      </div>
      {userName && (
        <span className="text-xs text-muted-foreground font-medium">{userName} is typing...</span>
      )}
    </div>
  );
}

// ============================================================================
// ENHANCED EMPTY STATE
// ============================================================================

import { MessageSquarePlus, Send, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyMessagesStateProps {
  onNewMessage: () => void;
}

export function EmptyMessagesState({ onNewMessage }: EmptyMessagesStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-background via-blue-50/30 to-purple-50/30 dark:from-background dark:via-blue-950/10 dark:to-purple-950/10">
      <div className="text-center space-y-8 max-w-lg px-6">
        {/* Animated Icon */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full opacity-20 animate-pulse" />
          <div className="absolute inset-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center">
            <Send className="w-14 h-14 text-blue-600 dark:text-blue-400 animate-bounce" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-yellow-500 animate-pulse" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome to Messages
          </h2>
          <p className="text-muted-foreground text-base leading-relaxed max-w-md mx-auto">
            Connect with instructors and classmates. Start meaningful conversations and collaborate
            on your learning journey.
          </p>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button
            onClick={onNewMessage}
            size="lg"
            className="rounded-full px-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <MessageSquarePlus className="w-5 h-5 mr-2" />
            Start New Conversation
          </Button>

          {/* Features */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8">
            <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm mb-1">Connect</h4>
              <p className="text-xs text-muted-foreground">Chat with instructors and peers</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Send className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm mb-1">Real-time</h4>
              <p className="text-xs text-muted-foreground">Instant message delivery</p>
            </div>
            <div className="p-4 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50">
              <Sparkles className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <h4 className="font-semibold text-sm mb-1">Rich Media</h4>
              <p className="text-xs text-muted-foreground">Share files, images, and more</p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="pt-6 space-y-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            Quick Tips
          </p>
          <div className="space-y-2 text-left inline-block mx-auto">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>
                Press{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> to
                send messages quickly
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>
                Use{' '}
                <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">
                  Shift+Enter
                </kbd>{' '}
                for new lines
              </span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-pink-500 rounded-full mt-1.5 flex-shrink-0" />
              <span>Pin important chats for quick access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ENHANCED CONNECTION STATUS
// ============================================================================

import { useEffect, useState } from 'react';
import { Wifi, WifiOff, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
}

export function ConnectionStatus({ isConnected, className }: ConnectionStatusProps) {
  const [visible, setVisible] = useState(false);
  const [wasDisconnected, setWasDisconnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState<'good' | 'poor' | 'offline'>('good');

  useEffect(() => {
    if (!isConnected) {
      setVisible(true);
      setWasDisconnected(true);
      setConnectionQuality('offline');
      return;
    }

    if (wasDisconnected) {
      setConnectionQuality('good');
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        setWasDisconnected(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isConnected, wasDisconnected]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className={cn('fixed bottom-6 left-1/2 -translate-x-1/2 z-50', className)}
      >
        <div
          className={cn(
            'px-6 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-3 border-2 transition-all duration-300',
            isConnected
              ? 'bg-green-500/90 dark:bg-green-600/90 text-white border-green-400/50 shadow-green-500/50'
              : 'bg-orange-500/90 dark:bg-orange-600/90 text-white border-orange-400/50 shadow-orange-500/50'
          )}
        >
          <div className="relative">
            {isConnected ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping" />
              </>
            ) : (
              <WifiOff className="w-5 h-5 animate-pulse" />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-sm font-bold">{isConnected ? 'Connected' : 'Reconnecting'}</span>
            <span className="text-[10px] opacity-90">
              {isConnected ? 'Chat is ready' : 'Please wait...'}
            </span>
          </div>

          {!isConnected && <Loader2 className="w-4 h-4 animate-spin ml-1" />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Mini connection indicator for header
export function ConnectionStatusIndicator({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border">
      <div className="relative">
        {isConnected ? (
          <>
            <Wifi className="w-4 h-4 text-green-600 dark:text-green-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full">
              <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75" />
            </div>
          </>
        ) : (
          <>
            <WifiOff className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-pulse" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
          </>
        )}
      </div>
      <div className="flex flex-col">
        <span
          className={cn(
            'text-xs font-medium',
            isConnected
              ? 'text-green-700 dark:text-green-400'
              : 'text-orange-700 dark:text-orange-400'
          )}
        >
          {isConnected ? 'Online' : 'Offline'}
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

import { Skeleton } from '@/components/ui/skeleton';

export function ChatInterfaceSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      {/* Header Skeleton */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Skeleton className="w-11 h-11 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>
      </div>

      {/* Messages Skeleton */}
      <div className="flex-1 p-4 space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className={cn('flex gap-3', i % 2 === 0 ? 'flex-row-reverse' : '')}>
            <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
            <div className="space-y-2 max-w-md">
              <Skeleton className={cn('h-16 rounded-2xl', i % 2 === 0 ? 'w-64' : 'w-48')} />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>

      {/* Input Skeleton */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-10 flex-1 rounded-2xl" />
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MESSAGE DELIVERY STATUS
// ============================================================================

export function MessageDeliveryStatus({
  status,
}: {
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}) {
  const statusConfig = {
    sending: {
      icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />,
      text: 'Sending...',
      color: 'text-gray-400',
    },
    sent: {
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      text: 'Sent',
      color: 'text-gray-500',
    },
    delivered: {
      icon: (
        <div className="flex -space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <CheckCircle2 className="w-3.5 h-3.5" />
        </div>
      ),
      text: 'Delivered',
      color: 'text-gray-500',
    },
    read: {
      icon: (
        <div className="flex -space-x-1">
          <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500" />
          <CheckCircle2 className="w-3.5 h-3.5 fill-blue-500" />
        </div>
      ),
      text: 'Read',
      color: 'text-blue-500',
    },
    failed: {
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      text: 'Failed',
      color: 'text-destructive',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center gap-1', config.color)} title={config.text}>
      {config.icon}
    </div>
  );
}

import { AlertCircle } from 'lucide-react';
