/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ConnectionState,
  DEFAULT_CONFIG,
  ReconnectionState,
  WebSocketConfig,
  WebSocketMessage,
  Notification,
} from './types';
import { EventCallback, TypedEventEmitter } from './utils/event-emitter';
import { HeartbeatManager } from './utils/heart-beat-manager';
import { NotificationMessageParser } from './utils/notification-parser';
import { MessageQueue } from './utils/message-queue';

/**
 * Event definitions for the NotificationWebSocketManager
 */
export interface NotificationWebSocketEvents extends Record<string, unknown> {
  // Connection events
  connected: { timestamp: Date };
  disconnected: { reason: string; code?: number; timestamp: Date };
  reconnecting: ReconnectionState;
  reconnected: { attempt: number; timestamp: Date };

  // Message events
  notification: Notification;
  message: WebSocketMessage;

  // Error events
  error: Error;
  heartbeat_timeout: void;

  // State events
  state_changed: ConnectionState;
}

/**
 * Connection readiness states
 */
enum ReadyState {
  CONNECTING = WebSocket.CONNECTING,
  OPEN = WebSocket.OPEN,
  CLOSING = WebSocket.CLOSING,
  CLOSED = WebSocket.CLOSED,
}

/**
 * NotificationWebSocketManager - Event-driven WebSocket manager for notifications
 */
export class NotificationWebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private currentUrl: string | null = null;
  private isManualDisconnect = false;
  private isRefreshingToken = false;
  private lastToken: string | null = null;

  private readonly heartbeatManager: HeartbeatManager;
  private readonly messageParser: NotificationMessageParser;
  private readonly messageQueue: MessageQueue;
  private readonly eventEmitter = new TypedEventEmitter<NotificationWebSocketEvents>();

  private connectionState: ConnectionState = {
    isConnected: false,
    reconnectAttempts: 0,
  };

  constructor(private readonly config: WebSocketConfig = DEFAULT_CONFIG) {
    this.heartbeatManager = new HeartbeatManager(
      config.heartbeatInterval,
      () => this.sendHeartbeat(),
      () => this.handleHeartbeatTimeout(),
      config.heartbeatTimeout
    );

    this.messageParser = new NotificationMessageParser();
    this.messageQueue = new MessageQueue(config.maxQueueSize, config.queueMessageMaxAge);

    this.setupInternalHandlers();
  }

  /**
   * Connect to the WebSocket server with current or refreshed token.
   */
  public connect(url: string): void {
    if (this.isConnected()) {
      console.warn('WebSocket already connected');
      return;
    }
    if (this.ws?.readyState === ReadyState.CONNECTING) {
      this.cleanupConnection();
    }
    this.currentUrl = url;
    this.isManualDisconnect = false;
    void this.createConnection(url, false);
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.isManualDisconnect = true;
    this.clearReconnectTimeout();
    this.clearConnectionTimeout();
    this.cleanupConnection();
    this.updateConnectionState(false);
  }

  /**
   * Send a message, queue if needed. If fails because token is expired, refresh token then try resend once.
   */
  public send(message: WebSocketMessage, priority = 0): boolean {
    if (!this.isConnected()) {
      if (this.config.enableMessageQueue) {
        this.messageQueue.enqueue(message, priority);
        return true;
      }
      console.warn('Cannot send message: WebSocket not connected');
      return false;
    }

    try {
      this.ws!.send(JSON.stringify(message));
      return true;
    } catch (error: any) {
      // If error is due to authentication, trigger refresh and retry once
      if (this.isAuthError(error)) {
        this.tryRefreshTokenAndResend(message, priority);
        return true;
      }
      console.error('Failed to send message:', error);
      if (this.config.enableMessageQueue) {
        this.messageQueue.enqueue(message, priority);
        return true;
      }
      return false;
    }
  }

  /**
   * Checks if WebSocket is currently connected
   */
  public isConnected(): boolean {
    return !!this.ws && this.ws.readyState === ReadyState.OPEN;
  }

  /**
   * Get current connection state (immutable)
   */
  public getConnectionState(): Readonly<ConnectionState> {
    return { ...this.connectionState };
  }

  /**
   * Number of queued messages
   */
  public getQueuedMessageCount(): number {
    return this.messageQueue.size();
  }

  /**
   * Clear all queued messages
   */
  public clearQueue(): void {
    this.messageQueue.clear();
  }

  /**
   * Get the current WebSocket ready state
   */
  public getReadyState(): ReadyState | null {
    return this.ws?.readyState ?? null;
  }

  // ===================== Event Subscription API =====================
  public on<K extends keyof NotificationWebSocketEvents>(
    event: K,
    callback: EventCallback<NotificationWebSocketEvents[K]>
  ): () => void {
    return this.eventEmitter.on(event, callback);
  }

  public once<K extends keyof NotificationWebSocketEvents>(
    event: K,
    callback: EventCallback<NotificationWebSocketEvents[K]>
  ): () => void {
    return this.eventEmitter.once(event, callback);
  }

  public off<K extends keyof NotificationWebSocketEvents>(
    event: K,
    callback: EventCallback<NotificationWebSocketEvents[K]>
  ): void {
    this.eventEmitter.off(event, callback);
  }

  // ===================== Connection Management =====================

  /**
   * Create WebSocket connection.
   * @param doRefreshOnAuthFailure If true, will attempt refresh/connection if auth error.
   */
  private async createConnection(url: string, doRefreshOnAuthFailure = false): Promise<void> {
    try {
      let wsUrl = url;
      let token = this.lastToken;
      if (!token) {
        token = (await this.config.getToken?.()) || null;
      }
      this.lastToken = token;

      if (token) {
        const parsedUrl = new URL(url, window?.location?.origin || undefined);
        parsedUrl.searchParams.set('token', token);
        wsUrl = parsedUrl.toString();
      }
      this.ws = new WebSocket(wsUrl);
      this.attachEventHandlers(wsUrl);
      this.setConnectionTimeout(wsUrl);
    } catch (error: any) {
      // If error is auth and not already tried refresh, refresh token then reconnect
      if (!doRefreshOnAuthFailure && this.isAuthError(error)) {
        await this.handleAuthErrorReconnect(url);
      } else {
        this.handleConnectionError(
          error instanceof Error ? error : new Error('Failed to create WebSocket'),
          url
        );
      }
    }
  }

  /**
   * Attach WebSocket event handlers. Must ensure no memory leaks.
   */
  private attachEventHandlers(url: string): void {
    if (!this.ws) return;

    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event: MessageEvent) => this.handleMessage(event);
    this.ws.onerror = (event: Event) => this.handleError(event, url);
    this.ws.onclose = (event: CloseEvent) => this.handleClose(event, url);
  }

  /**
   * Manage connection timeout effectively for network/infra issues.
   */
  private setConnectionTimeout(url: string): void {
    this.clearConnectionTimeout();
    this.connectionTimeoutId = setTimeout(() => {
      if (this.ws?.readyState !== ReadyState.OPEN) {
        console.warn('Connection timeout');
        this.cleanupConnection();
        this.handleConnectionError(new Error('Connection timeout'), url);
      }
    }, this.config.connectionTimeout);
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutId !== null) {
      clearTimeout(this.connectionTimeoutId);
      this.connectionTimeoutId = null;
    }
  }

  private setupInternalHandlers(): void {
    // Placeholder for additional internal event set-up if required
  }

  /**
   * WebSocket open handler; emits events and processes queue.
   */
  private handleOpen(): void {
    console.log('WebSocket connected');
    this.clearConnectionTimeout();
    this.reconnectAttempts = 0;
    const now = new Date();
    this.updateConnectionState(true, now);
    this.heartbeatManager.start();
    this.heartbeatManager.reset();
    this.processQueuedMessages();
    this.eventEmitter.emit('connected', { timestamp: now });
  }

  /**
   * Send all queued messages (batch sending to avoid long blocking).
   */
  private processQueuedMessages(): void {
    if (!this.config.enableMessageQueue || !this.isConnected()) return;
    const maxBatchSize = 10;
    let processed = 0;
    let message = this.messageQueue.dequeue();

    while (message && processed < maxBatchSize) {
      try {
        this.ws!.send(JSON.stringify(message));
        processed++;
        message = this.messageQueue.dequeue();
      } catch (error: any) {
        // If error is auth, refresh token and requeue message for next successful send
        if (this.isAuthError(error)) {
          this.tryRefreshTokenAndResend(message!, 0);
        } else {
          console.error('Failed to send queued message:', error);
          if (message) this.messageQueue.enqueue(message, 0);
        }
        break;
      }
    }

    if (this.messageQueue.size() > 0) {
      setTimeout(() => this.processQueuedMessages(), 100);
    }
  }

  /**
   * Process inbound WebSocket message event (all parsing here).
   */
  private handleMessage(event: MessageEvent): void {
    const message = this.messageParser.parse(event.data);
    if (!message) return;

    this.eventEmitter.emit('message', message);

    switch (message.type) {
      case 'pong':
        this.heartbeatManager.markPongReceived();
        break;

      case 'notification': {
        const notification = this.messageParser.toNotification(message);
        if (notification) {
          this.eventEmitter.emit('notification', notification);
        }
        break;
      }

      case 'error': {
        // If error.message is about authentication/token, refresh token then reconnect
        const errorText = typeof message.message === 'string' ? message.message.toLowerCase() : '';
        if (this.isAuthErrorText(errorText)) {
          this.handleAuthErrorReconnect(this.currentUrl || '');
          return;
        }
        console.error('Server error message:', message);
        const error = new Error(errorText || 'WebSocket server error');
        this.eventEmitter.emit('error', error);
        break;
      }

      default:
        // Unknown type: ensure this is logged for dev visibility
        console.debug('Unknown message type:', message.type);
    }
  }

  /**
   * Handle WebSocket error and reflect the state.
   */
  private handleError(event: Event, url: string): void {
    // Try to distinguish auth error from generic error if possible
    const error = new Error('WebSocket error occurred');
    console.error('WebSocket error:', event);
    // If error is auth-related, try refresh before generic error
    if (this.isAuthError(event)) {
      void this.handleAuthErrorReconnect(url);
      return;
    }
    this.updateConnectionState(this.connectionState.isConnected, undefined, error);
    this.eventEmitter.emit('error', error);
  }

  /**
   * WebSocket close event handler; supports reconnection if not manual.
   */
  private handleClose(event: CloseEvent, url: string): void {
    const now = new Date();
    const reason = event.reason || 'Unknown reason';
    console.log('WebSocket disconnected:', reason, event.code);

    this.clearConnectionTimeout();
    this.heartbeatManager.stop();
    this.updateConnectionState(false, undefined, this.connectionState.lastError, now);

    this.eventEmitter.emit('disconnected', {
      reason,
      code: event.code,
      timestamp: now,
    });

    // If auth error on close, refresh before reconnect
    if (this.isCloseAuthError(event)) {
      this.handleAuthErrorReconnect(url);
      return;
    }

    if (!this.isManualDisconnect) {
      this.attemptReconnect(url);
    }
  }

  /**
   * Handles connection errors and triggers reconnection if required.
   */
  private handleConnectionError(error: Error, url: string): void {
    // Attempt token refresh if error is auth, but only once per connection error
    if (!this.isManualDisconnect && this.isAuthError(error)) {
      void this.handleAuthErrorReconnect(url);
      return;
    }

    console.error('Connection error:', error);
    this.updateConnectionState(false, undefined, error);
    this.eventEmitter.emit('error', error);

    if (!this.isManualDisconnect) {
      this.attemptReconnect(url);
    }
  }

  /**
   * If token/auth error, refresh token, then try reconnect.
   */
  private async handleAuthErrorReconnect(url: string): Promise<void> {
    if (this.isRefreshingToken) return;
    this.isRefreshingToken = true;
    try {
      const refreshResult = await this.config.authRefresh?.();
      if (refreshResult?.token) {
        this.lastToken = refreshResult.token;
        this.disconnect();
        setTimeout(() => {
          void this.createConnection(url, true);
        }, 100);
        return;
      } else {
        console.error('Token refresh did not provide a new token.');
      }
    } catch (err) {
      this.eventEmitter.emit(
        'error',
        err instanceof Error ? err : new Error('Token refresh failed')
      );
      console.error('Token refresh failed:', err);
    } finally {
      this.isRefreshingToken = false;
    }
  }

  /**
   * Attempt resending given message after refreshing the token.
   * Only tries once.
   */
  private async tryRefreshTokenAndResend(
    message: WebSocketMessage,
    priority: number
  ): Promise<void> {
    try {
      const refreshResult = await this.config.authRefresh?.();
      if (refreshResult?.token) {
        this.lastToken = refreshResult.token;
        if (this.ws && this.ws.readyState === ReadyState.OPEN) {
          try {
            this.ws.send(JSON.stringify(message));
            return;
          } catch {
            // Fall through to queue
          }
        }
      }
    } catch {
      // swallow, fallback to queue
    }
    // If resend failed, queue the message if possible
    if (this.config.enableMessageQueue) {
      this.messageQueue.enqueue(message, priority);
    }
  }

  /**
   * Utility: checks if an error or message indicates an authentication problem.
   */
  private isAuthError(err: any): boolean {
    if (!err) return false;
    // Check error message string for common auth patterns
    const message =
      typeof err === 'string'
        ? err
        : err?.message || (typeof err?.toString === 'function' ? err.toString() : '');
    if (typeof message !== 'string') return false;
    return this.isAuthErrorText(message.toLowerCase());
  }

  /**
   * Utility: checks if error text likely indicates an auth issue.
   */
  private isAuthErrorText(message: string): boolean {
    return (
      message.includes('token') &&
      (message.includes('expired') ||
        message.includes('invalid') ||
        message.includes('unauthorized') ||
        message.includes('auth') ||
        message.includes('forbidden'))
    );
  }

  /**
   * Utility: checks if close event likely relates to auth (based on code or reason).
   */
  private isCloseAuthError(event: CloseEvent): boolean {
    // Common WebSocket close codes for policy/unauth
    return (
      event.code === 4401 || // custom: unauthorized
      event.code === 4001 || // custom: token expired
      !!(event.reason && this.isAuthErrorText(event.reason.toLowerCase()))
    );
  }

  /**
   * Perform reconnection with backoff. Never exceeds max attempts.
   */
  private attemptReconnect(url: string): void {
    if (!this.shouldReconnect(this.reconnectAttempts)) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.calculateReconnectDelay(this.reconnectAttempts - 1);

    console.log(
      `Reconnecting (${this.reconnectAttempts}/${this.config.maxReconnectAttempts}) in ${delay}ms`
    );

    const reconnectionState: ReconnectionState = {
      attempt: this.reconnectAttempts,
      delay,
      maxAttempts: this.config.maxReconnectAttempts,
    };

    this.eventEmitter.emit('reconnecting', reconnectionState);

    this.reconnectTimeoutId = setTimeout(() => {
      if (!this.isManualDisconnect) {
        void this.createConnection(url, false);

        this.once('connected', () => {
          this.eventEmitter.emit('reconnected', {
            attempt: this.reconnectAttempts,
            timestamp: new Date(),
          });
        });
      }
    }, delay);
  }

  /**
   * Heartbeat timeout handler; triggers safe reconnect.
   */
  private handleHeartbeatTimeout(): void {
    console.warn('Heartbeat timeout - connection may be dead');
    this.eventEmitter.emit('heartbeat_timeout', void null);
    if (this.ws) {
      this.ws.close();
    }
  }

  /**
   * Send WebSocket ping to maintain heartbeat.
   */
  private sendHeartbeat(): void {
    if (this.isConnected()) {
      this.send({ type: 'ping', timestamp: Date.now() });
    }
  }

  private clearReconnectTimeout(): void {
    if (this.reconnectTimeoutId !== null) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  /**
   * Complete resource and event handler cleanup for a connection.
   */
  private cleanupConnection(): void {
    this.heartbeatManager.stop();
    this.clearReconnectTimeout();
    this.clearConnectionTimeout();

    if (this.ws) {
      // Detach event handlers to prevent leaks
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      if (this.ws.readyState === ReadyState.OPEN || this.ws.readyState === ReadyState.CONNECTING) {
        this.ws.close();
      }

      this.ws = null;
    }
  }

  /**
   * Update and emit connection state. Keeps immutability.
   */
  private updateConnectionState(
    isConnected: boolean,
    lastConnectedAt?: Date,
    lastError?: Error,
    lastDisconnectedAt?: Date
  ): void {
    this.connectionState = {
      ...this.connectionState,
      isConnected,
      reconnectAttempts: this.reconnectAttempts,
      lastError,
      lastConnectedAt: lastConnectedAt ?? this.connectionState.lastConnectedAt,
      lastDisconnectedAt: lastDisconnectedAt ?? this.connectionState.lastDisconnectedAt,
    };

    this.eventEmitter.emit('state_changed', { ...this.connectionState });
  }

  /**
   * Compute delay for reconnection with respect to strategy.
   */
  private calculateReconnectDelay(attempts: number): number {
    switch (this.config.reconnectStrategy) {
      case 'exponential':
        return Math.min(
          this.config.baseReconnectDelay * Math.pow(2, attempts),
          this.config.maxReconnectDelay
        );
      case 'linear':
        return Math.min(
          this.config.baseReconnectDelay * (attempts + 1),
          this.config.maxReconnectDelay
        );
      case 'fixed':
        return this.config.baseReconnectDelay;
      default:
        return Math.min(
          this.config.baseReconnectDelay * Math.pow(2, attempts),
          this.config.maxReconnectDelay
        );
    }
  }

  /**
   * Enforces that reconnection attempts are within the permitted bounds.
   */
  private shouldReconnect(attempts: number): boolean {
    return attempts < this.config.maxReconnectAttempts;
  }

  // ===================== Public Destruction/Cleanup =====================

  /**
   * Clean up all resources and event handlers. Prevent leaks.
   */
  public destroy(): void {
    this.isManualDisconnect = true;
    this.disconnect();
    this.messageQueue.clear();
    this.eventEmitter.removeAllListeners();
  }
}
