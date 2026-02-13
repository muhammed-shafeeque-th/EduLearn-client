import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { NotificationWebSocketManager } from '../notification-websocket.manager';
import {
  ConnectionState,
  DEFAULT_CONFIG,
  WebSocketConfig,
  WebSocketMessage,
  Notification,
} from '../types';

interface UseNotificationWebSocketOptions {
  url: string;
  userId?: string;
  enabled?: boolean;
  config?: Partial<WebSocketConfig>;
  onNotification?: (notification: Notification) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
  onReconnecting?: (state: { attempt: number; delay: number; maxAttempts: number }) => void;
  onReconnected?: (state: { attempt: number; timestamp: Date }) => void;
}

/**
 * React hook for managing WebSocket connection with notifications
 *
 * Features:
 * - Automatic connection management
 * - State synchronization
 * - Event callbacks
 * - Optimized re-renders
 */
export function useNotificationWebSocket({
  url,
  userId,
  enabled = true,
  config,
  onNotification,
  onConnect,
  onDisconnect,
  onError,
  onReconnecting,
  onReconnected,
}: UseNotificationWebSocketOptions) {
  const managerRef = useRef<NotificationWebSocketManager | null>(null);
  const callbacksRef = useRef({
    onNotification,
    onConnect,
    onDisconnect,
    onError,
    onReconnecting,
    onReconnected,
  });

  // Update callbacks ref to avoid recreating subscriptions
  useEffect(() => {
    callbacksRef.current = {
      onNotification,
      onConnect,
      onDisconnect,
      onError,
      onReconnecting,
      onReconnected,
    };
  }, [onNotification, onConnect, onDisconnect, onError, onReconnecting, onReconnected]);

  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isConnected: false,
    reconnectAttempts: 0,
  });

  // Build full URL with userId (memoized to avoid unnecessary reconnections)
  const fullUrl = useMemo(() => {
    if (!userId) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}userId=${userId}`;
  }, [url, userId]);

  // Initialize manager (only when config changes)
  useEffect(() => {
    const mergedConfig = { ...DEFAULT_CONFIG, ...config };
    managerRef.current = new NotificationWebSocketManager(mergedConfig);

    return () => {
      managerRef.current?.destroy();
      managerRef.current = null;
    };
  }, [config]);

  // Setup event listeners (stable references using refs)
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    const unsubscribers = [
      manager.on('notification', (notification) => {
        callbacksRef.current.onNotification?.(notification);
      }),
      manager.on('connected', () => {
        setConnectionState(manager.getConnectionState());
        callbacksRef.current.onConnect?.();
      }),
      manager.on('disconnected', () => {
        setConnectionState(manager.getConnectionState());
        callbacksRef.current.onDisconnect?.();
      }),
      manager.on('error', (error) => {
        setConnectionState(manager.getConnectionState());
        callbacksRef.current.onError?.(error);
      }),
      manager.on('reconnecting', (state) => {
        setConnectionState(manager.getConnectionState());
        callbacksRef.current.onReconnecting?.(state);
      }),
      manager.on('reconnected', (state) => {
        setConnectionState(manager.getConnectionState());
        callbacksRef.current.onReconnected?.(state);
      }),
      manager.on('state_changed', (state) => {
        setConnectionState(state);
      }),
    ];

    return () => {
      unsubscribers.forEach((unsub) => unsub());
    };
  }, []); // Empty deps - callbacks are in ref

  // Handle connection/disconnection
  useEffect(() => {
    const manager = managerRef.current;
    if (!manager) return;

    if (enabled) {
      manager.connect(fullUrl);
    } else {
      manager.disconnect();
    }

    return () => {
      if (enabled) {
        manager.disconnect();
      }
    };
  }, [fullUrl, enabled]);

  // Memoized send message function
  const sendMessage = useCallback((message: WebSocketMessage, priority?: number) => {
    return managerRef.current?.send(message, priority) ?? false;
  }, []);

  // Memoized reconnect function
  const reconnect = useCallback(() => {
    if (managerRef.current && enabled) {
      managerRef.current.reconnect();
    }
  }, [enabled]);

  // Get queued message count
  const queuedMessageCount = managerRef.current?.getQueuedMessageCount() ?? 0;

  return {
    isConnected: connectionState.isConnected,
    reconnectAttempts: connectionState.reconnectAttempts,
    lastError: connectionState.lastError,
    lastConnectedAt: connectionState.lastConnectedAt,
    lastDisconnectedAt: connectionState.lastDisconnectedAt,
    queuedMessageCount,
    sendMessage,
    reconnect,
  };
}
