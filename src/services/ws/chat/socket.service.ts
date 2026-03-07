import { io, Socket } from 'socket.io-client';
import { config } from '@/lib/config';
import { getClientAuthToken, authRefreshToken } from '@/lib/auth/auth-client-apis';

import type { Chat, Message } from '@/types/chat';
import { sleep } from '@/lib/utils';

export type SocketEventType =
  | 'message:new'
  | 'messages:read'
  | 'message:edited'
  | 'message:deleted'
  | 'message:reaction'
  | 'message:reaction:removed'
  | 'typing:start'
  | 'typing:stop'
  | 'user:online'
  | 'user:offline'
  | 'chat:created'
  | 'discussion:message:new'
  | 'connect'
  | 'disconnect'
  | 'error';

export type SocketEmitEventType =
  | 'join:chat'
  | 'leave:chat'
  | 'typing:start'
  | 'typing:stop'
  | 'join:discussion'
  | 'leave:discussion';

export interface NewMessagePayload {
  message: Message;
}

export interface MessagesReadPayload {
  chatId: string;
  userId: string;
  readAt: string | number;
}

export interface MessageEditedPayload {
  messageId: string;
  chatId: string;
  content: string;
  editedAt: string | number;
}

export interface MessageDeletedPayload {
  messageId: string;
  chatId: string;
  deleteForEveryone: boolean;
}

export interface MessageReactionPayload {
  messageId: string;
  chatId: string;
  reaction: {
    id?: string;
    userId: string;
    emoji: string;
    timestamp: string | number;
  };
}

export interface ReactionRemovedPayload {
  messageId: string;
  chatId: string;
  reactionId: string;
  removedBy: string;
}

export interface TypingPayload {
  chatId: string;
  userId: string;
  user?: { firstName: string; lastName?: string };
}

export interface UserPresencePayload {
  userId: string;
  timestamp?: string | number;
}

export interface ChatCreatedPayload {
  chat: Chat;
}

export interface DiscussionMessagePayload {
  message: {
    id: string;
    roomId: string;
    senderId: string;
    content: string;
    sequence: number;
    createdAt: string;
    updatedAt: string;
    senderName?: string;
  };
}

export type EventHandlerMap = {
  'message:new': (p: NewMessagePayload) => void;
  'messages:read': (p: MessagesReadPayload) => void;
  'message:edited': (p: MessageEditedPayload) => void;
  'message:deleted': (p: MessageDeletedPayload) => void;
  'message:reaction': (p: MessageReactionPayload) => void;
  'message:reaction:removed': (p: ReactionRemovedPayload) => void;
  'typing:start': (p: TypingPayload) => void;
  'typing:stop': (p: TypingPayload) => void;
  'user:online': (p: UserPresencePayload) => void;
  'user:offline': (p: UserPresencePayload) => void;
  'chat:created': (p: ChatCreatedPayload) => void;
  'discussion:message:new': (p: DiscussionMessagePayload) => void;
  connect: () => void;
  disconnect: () => void;
  error: (e: Error) => void;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyHandler = (...args: any[]) => void;

const CONNECT_TIMEOUT_MS = 10_000;

export class SocketService {
  private socket: Socket | null = null;
  private handlers = new Map<SocketEventType, Set<AnyHandler>>();
  private connectPromise: Promise<void> | null = null;
  private connectionRetries = 0;

  // Connection

  async connect(): Promise<void> {
    // If already connected, nothing to do
    if (this.socket?.connected) return;

    // If a connection attempt is already in flight, piggy-back on it
    if (this.connectPromise) return this.connectPromise;

    this.connectPromise = this._doConnect();

    try {
      await this.connectPromise;
    } finally {
      this.connectPromise = null;
    }
  }

  private async _doConnect(): Promise<void> {
    // Clean up any old socket before creating a new one
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }

    this.socket = io(`${config.chatWsUrl}/chat`, {
      auth: async (cb) => {
        const token = await getClientAuthToken();
        cb({ token });
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 5_000,
    });

    this._registerSocketListeners();

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error('WebSocket connect timeout')),
        CONNECT_TIMEOUT_MS
      );

      this.socket!.once('connect', () => {
        clearTimeout(timer);
        resolve();
      });

      this.socket!.once('connect_error', async (err) => {
        clearTimeout(timer);

        // Attempt one token refresh & retry
        try {
          if (this.connectionRetries > 5) throw err;

          const refreshed = await authRefreshToken();
          if (refreshed?.token) {
            this.socket?.removeAllListeners();
            this.socket?.disconnect();
            this.socket = null;
            // Retry connection (will create a new socket)
            const delay = this._getRetryDelay(this.connectionRetries + 1);
            this.connectionRetries++;
            await sleep(delay);
            resolve(this._doConnect());
            return;
          }
          return;
        } catch {
          // refresh failed, fall through to reject
        }

        this.connectionRetries = 0;

        reject(err);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    // NOTE: We intentionally do NOT clear handlers here.
    // Handlers are owned by their subscribers and cleaned up via
    // the unsubscribe function returned from `on()`.
  }

  get isConnected(): boolean {
    return !!this.socket?.connected;
  }

  // Event subscriptions

  on<T extends SocketEventType>(event: T, handler: EventHandlerMap[T]): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler as AnyHandler);

    return () => {
      this.handlers.get(event)?.delete(handler as AnyHandler);
    };
  }

  // Room management

  joinChat(chatId: string): void {
    this.socket?.emit('join:chat', { chatId });
  }

  leaveChat(chatId: string): void {
    this.socket?.emit('leave:chat', { chatId });
  }

  joinDiscussion(roomId: string): void {
    this.socket?.emit('join:discussion', { roomId });
  }

  leaveDiscussion(roomId: string): void {
    this.socket?.emit('leave:discussion', { roomId });
  }

  // Typing

  startTyping(chatId: string): void {
    this.socket?.emit('typing:start', { chatId });
  }

  stopTyping(chatId: string): void {
    this.socket?.emit('typing:stop', { chatId });
  }

  // Internal

  /**
   * Forward raw socket.io events to our internal handler sets.
   */
  private _registerSocketListeners(): void {
    if (!this.socket) return;

    const forward = (event: SocketEventType) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.socket!.on(event as string, (payload: any) => this._emit(event, payload));
    };

    // Message events
    forward('message:new');
    forward('messages:read');
    forward('message:edited');
    forward('message:deleted');
    forward('message:reaction');

    // Typing events
    forward('typing:start');
    forward('typing:stop');

    // Presence events
    forward('user:online');
    forward('user:offline');

    // Chat lifecycle
    forward('chat:created');
    forward('discussion:message:new');

    // Connection lifecycle forwarded to handlers
    this.socket.on('connect', () => this._emit('connect'));
    this.socket.on('disconnect', () => this._emit('disconnect'));
    this.socket.on('error', (e) => this._emit('error', e));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _emit(event: SocketEventType, payload?: any): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(payload);
      } catch (e) {
        console.error(`[SocketService] handler error for "${event}"`, e);
      }
    });
  }

  private _getRetryDelay(retryCount: number, base = 1000, max = 10000): number {
    const delay = Math.min(base * 2 ** (retryCount - 1), max);
    const jitter = Math.random() * 0.3 * delay;
    return delay + jitter;
  }
}

// Module-level singleton
let instance: SocketService | null = null;

export const getSocketService = (): SocketService => (instance ??= new SocketService());

export const resetSocketService = (): void => {
  instance?.disconnect();
  instance = null;
};
