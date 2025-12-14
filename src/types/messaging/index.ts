export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  role: 'student' | 'teacher';
  isOnline: boolean;
  lastSeen: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'file' | 'image';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  timestamp: string;
  status: 'sending' | 'sent' | 'delivered' | 'read';
  replyTo?: string;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  timestamp: string;
}

export interface TypingIndicator {
  userId: string;
  conversationId: string;
  timestamp: string;
}

export interface MessageFilters {
  search: string;
  type: 'all' | 'unread' | 'pinned' | 'archived';
  sortBy: 'recent' | 'unread' | 'name';
}

// export interface Message {
//   id: string;
//   conversationId: string;
//   senderId: string;
//   receiverId?: string; // For DM
//   content: string;
//   type: 'text' | 'voice' | 'file' | 'image' | 'video' | 'system';
//   timestamp: Date;
//   status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

//   // Rich features
//   replyTo?: string; // Message ID
//   editedAt?: Date;
//   deletedAt?: Date;
//   reactions?: MessageReaction[];
//   mentions?: string[]; // User IDs

//   // File metadata
//   fileUrl?: string;
//   fileName?: string;
//   fileSize?: number;
//   fileType?: string;
//   voiceDuration?: number;
//   thumbnailUrl?: string;

//   // Thread
//   threadId?: string;
//   threadCount?: number;

//   // Encryption
//   encrypted?: boolean;
//   encryptionKey?: string;
// }

// export interface MessageReaction {
//   emoji: string;
//   userId: string;
//   timestamp: Date;
// }

export interface Conversation {
  id: string;
  type: 'direct';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;

  // Settings
  isPinned: boolean;
  isMuted: boolean;
  isArchived: boolean;
  mutedUntil?: Date;

  // Status
  isTyping: boolean;
  typingUsers: string[];
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
  | 'conversation_created'
  | 'call_initiated'
  | 'call_ended';

export interface WSMessage {
  type: WSMessageType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload: any;
  timestamp: Date;
}
