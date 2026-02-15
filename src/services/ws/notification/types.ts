import { authRefreshToken, getClientAuthToken } from '@/lib/auth/auth-client-apis';
import { Notification } from '@/types/notification';

export type { Notification };

/**
 * WebSocket message types
 */
export type WebSocketMessageType = 'notification' | 'ping' | 'pong' | 'ack' | 'error';

/**
 * WebSocket message structure
 */
export interface WebSocketMessage {
  type: WebSocketMessageType;
  id?: string;
  timestamp?: number;
  data?: unknown;
  category?: string;
  subject?: string;
  message?: string;
  priority?: 'low' | 'medium' | 'high';
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Connection state information
 */
export interface ConnectionState {
  isConnected: boolean;
  reconnectAttempts: number;
  lastError?: Error;
  lastConnectedAt?: Date;
  lastDisconnectedAt?: Date;
}

/**
 * Reconnection state
 */
export interface ReconnectionState {
  attempt: number;
  delay: number;
  maxAttempts: number;
}

/**
 * WebSocket configuration options
 */
export interface WebSocketConfig {
  maxReconnectAttempts: number;
  baseReconnectDelay: number;
  maxReconnectDelay: number;
  heartbeatInterval: number;
  heartbeatTimeout: number;
  connectionTimeout: number;
  getToken?: () => Promise<string> | string | null;
  authRefresh?: () => Promise<{ token: string } | null>;
  enableMessageQueue: boolean;
  maxQueueSize: number;
  queueMessageMaxAge: number;
  reconnectStrategy: 'exponential' | 'linear' | 'fixed';
}

/**
 * Default WebSocket configuration
 */
export const DEFAULT_CONFIG: WebSocketConfig = {
  maxReconnectAttempts: 5,
  baseReconnectDelay: 1000,
  maxReconnectDelay: 30000,
  heartbeatInterval: 30000,
  heartbeatTimeout: 60000, // 2x heartbeat interval
  connectionTimeout: 10000,
  enableMessageQueue: true,
  getToken: getClientAuthToken,
  authRefresh: authRefreshToken,
  maxQueueSize: 100,
  queueMessageMaxAge: 5 * 60 * 1000, // 5 minutes
  reconnectStrategy: 'exponential',
} as const;
