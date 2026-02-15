/* eslint-disable @typescript-eslint/no-explicit-any */
import { io, Socket } from 'socket.io-client';
import { config } from '@/lib/config';
import { getClientAuthToken, authRefreshToken } from '@/lib/auth/auth-client-apis';

import type { Chat, Message } from '@/types/chat';

export type SocketEventType =
  | 'message:new'
  | 'messages:read'
  | 'message:edited'
  | 'message:deleted'
  | 'message:reaction'
  | 'typing:start'
  | 'typing:stop'
  | 'user:online'
  | 'user:offline'
  | 'chat:created'
  | 'connect'
  | 'disconnect'
  | 'error';

export type SocketEmitEventType = 'join:chat' | 'leave:chat' | 'typing:start' | 'typing:stop';

export interface NewMessagePayload {
  message: Message;
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

type EventHandlers = {
  'message:new': (p: NewMessagePayload) => void;
  'messages:read': (p: any) => void;
  'message:edited': (p: MessageEditedPayload) => void;
  'message:deleted': (p: MessageDeletedPayload) => void;
  'message:reaction': (p: MessageReactionPayload) => void;
  'typing:start': (p: TypingPayload) => void;
  'typing:stop': (p: TypingPayload) => void;
  'user:online': (p: UserPresencePayload) => void;
  'user:offline': (p: UserPresencePayload) => void;
  'chat:created': (p: ChatCreatedPayload) => void;
  connect: () => void;
  disconnect: () => void;
  error: (e: Error) => void;
};

export class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private handlers = new Map<string, Set<any>>();
  private connecting = false;

  async connect() {
    if (this.socket?.connected || this.connecting) return;

    this.connecting = true;
    try {
      this.socket = io(`${config.chatWsUrl}/chat`, {
        auth: async (cb) => {
          const token = await getClientAuthToken();
          cb({ token });
        },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.registerListeners();

      await new Promise<void>((resolve, reject) => {
        if (!this.socket) return reject(new Error('Socket init failed'));

        const timer = setTimeout(() => reject(new Error('WS connect timeout')), 10000);

        this.socket.once('connect', () => {
          clearTimeout(timer);
          this.connecting = false;
          this.emit('connect');
          resolve();
        });

        this.socket.once('connect_error', async (err: any) => {
          clearTimeout(timer);

          // token refresh then retry once
          const refreshed = await authRefreshToken().catch(() => null);
          if (refreshed?.token) {
            this.socket?.disconnect();
            this.socket = null;
            this.connecting = false;
            return resolve(this.connect());
          }

          this.connecting = false;
          reject(err);
        });
      });
    } catch (e) {
      this.connecting = false;
      throw e;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
    }

    this.socket = null;
    this.handlers.clear();
  }
  get isConnected() {
    return !!this.socket?.connected;
  }

  on<T extends SocketEventType>(event: T, handler: EventHandlers[T]) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);

    return () => this.handlers.get(event)?.delete(handler);
  }

  joinChat(chatId: string) {
    this.socket?.emit('join:chat', { chatId });
  }

  leaveChat(chatId: string) {
    this.socket?.emit('leave:chat', { chatId });
  }

  startTyping(chatId: string) {
    this.socket?.emit('typing:start', { chatId });
  }

  stopTyping(chatId: string) {
    this.socket?.emit('typing:stop', { chatId });
  }

  private registerListeners() {
    if (!this.socket) return;

    const forward = (event: SocketEventType) => {
      this.socket!.on(event as any, (payload: any) => this.emit(event, payload));
    };

    forward('message:new');
    forward('messages:read');
    forward('message:edited');
    forward('message:deleted');
    forward('message:reaction');
    forward('typing:start');
    forward('typing:stop');
    forward('user:online');
    forward('user:offline');
    forward('chat:created');

    this.socket.on('disconnect', () => this.emit('disconnect'));
    this.socket.on('error', (e) => this.emit('error', e));
  }

  private emit(event: string, payload?: any) {
    const hs = this.handlers.get(event);
    if (!hs) return;
    hs.forEach((h) => {
      try {
        (h as any)(payload);
      } catch (e) {
        console.error(`Socket handler error for event=${event}`, e);
      }
    });
  }
}

let instance: SocketService | null = null;
export const getSocketService = () => (instance ??= new SocketService());
export const resetSocketService = () => {
  instance?.disconnect();
  instance = null;
};
