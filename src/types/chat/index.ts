import type { UserInfo } from '../user';

export interface MessageReaction {
  id: string;
  userId: string;
  emoji: string;
  timestamp: number; // epoch ms
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  sequence: number;
  reactions: MessageReaction[];
}

/**
 * UI-only view model for optimistic rendering
 * This must NOT be sent to backend.
 */
export type OptimisticState = 'pending' | 'failed' | 'sent';

export interface UiMessage extends Message {
  optimisticState?: OptimisticState;
  idempotencyKey?: string;
}

export interface Chat {
  id: string;
  enrollmentId: string;

  studentId: string;
  instructorId: string;

  createdAt: number;
  updatedAt: number;
  lastMessageId?: string;

  // viewer-specific
  isPinned: boolean;
  isArchived: boolean;
  mutedUntil?: number;

  // UI convenience only
  student?: UserInfo;
  instructor?: UserInfo;
}

export interface TypingIndicator {
  userId: string;
  chatId: string;
  timestamp: string;
}

export type MessageFilterType = 'all' | 'unread' | 'pinned' | 'archived';
export type MessageSortType = 'recent' | 'unread' | 'name';

export interface MessageFilters {
  search: string;
  type: MessageFilterType;
  sortBy: MessageSortType;
  dateRange?: {
    from: Date;
    to: Date;
  };
}
export interface MessageFilters {
  search: string;
  type: 'all' | 'unread' | 'pinned' | 'archived';
  sortBy: 'recent' | 'unread' | 'name';
}

export interface CallInfo {
  id: string;
  type: 'video';
  initiatorId: string;
  participants: string[];
  status: 'ringing' | 'active' | 'ended';
  startedAt?: Date;
  endedAt?: Date;
}

// WebSocket Events
export type WSMessageType =
  | 'new_message'
  | 'message_status_update'
  | 'message_deleted'
  | 'message_edited'
  | 'message_reaction'
  | 'typing_start'
  | 'typing_stop'
  | 'user_online'
  | 'user_offline'
  | 'chat_created'
  | 'call_initiated'
  | 'call_ended';

export interface WSMessage {
  type: WSMessageType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: Date;
}
