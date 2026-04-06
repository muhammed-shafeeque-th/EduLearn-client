import React from 'react';
import { Loader2, MessageSquare, Wifi, WifiOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ConnectionStatusProps {
  isConnected: boolean;
}

export function ConnectionStatus({ isConnected }: ConnectionStatusProps) {
  if (isConnected) {
    return (
      <Badge
        variant="outline"
        className="text-xs text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
      >
        <Wifi className="h-3 w-3 mr-1" />
        Live
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="text-xs text-amber-500 border-amber-500/30 bg-amber-500/10">
      <WifiOff className="h-3 w-3 mr-1" />
      Connecting...
    </Badge>
  );
}

interface EmptyDiscussionProps {
  message?: string;
}

export function EmptyDiscussion({
  message = 'No messages yet. Be the first to start the discussion!',
}: EmptyDiscussionProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-primary/50" />
      </div>
      <h3 className="text-base font-medium text-foreground/80 mb-1">No messages yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">{message}</p>
    </div>
  );
}

export function MessagesLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function DiscussionPageLoader() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading discussion...</p>
        </div>
      </div>
    </div>
  );
}

interface DiscussionErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function DiscussionError({
  message = 'Failed to load the discussion room. Please try again.',
  onRetry,
}: DiscussionErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <MessageSquare className="h-8 w-8 text-destructive/50" />
      </div>
      <h3 className="text-base font-medium text-foreground/80 mb-1">Something went wrong</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
