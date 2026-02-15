import { WebSocketMessage } from '../types';
import { type Notification } from '@/types/notification';

/**
 * NotificationMessageParser - Parses and validates WebSocket messages
 *
 * Features:
 * - Safe JSON parsing with error handling
 * - Message validation
 * - Type conversion for Notification objects
 */
export class NotificationMessageParser {
  /**
   * Parse raw WebSocket message string to WebSocketMessage object
   */
  parse(rawMessage: string | Blob | ArrayBuffer): WebSocketMessage | null {
    try {
      let data: string;

      // Handle different message types
      if (typeof rawMessage === 'string') {
        data = rawMessage;
      } else if (rawMessage instanceof Blob) {
        // For blob messages, we'd need async handling, but for now return null
        // In a real implementation, you might want to handle this differently
        console.warn('Blob messages not yet supported');
        return null;
      } else {
        // ArrayBuffer - convert to string
        const decoder = new TextDecoder();
        data = decoder.decode(rawMessage);
      }

      const parsed = JSON.parse(data);

      // Basic validation
      if (!parsed || typeof parsed !== 'object') {
        console.warn('Invalid message format: not an object');
        return null;
      }

      if (!parsed.type || typeof parsed.type !== 'string') {
        console.warn('Invalid message format: missing or invalid type');
        return null;
      }

      return parsed as WebSocketMessage;
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      return null;
    }
  }

  /**
   * Convert WebSocketMessage to Notification object
   */
  toNotification(data: WebSocketMessage): Notification | null {
    if (data.type !== 'notification') return null;

    try {
      // Validate required fields
      if (!data.id || !data.subject || !data.message) {
        console.warn('Invalid notification: missing required fields');
        return null;
      }

      const timestamp = data.timestamp
        ? new Date(data.timestamp).toISOString()
        : new Date().toISOString();

      // Convert metadata if present
      const metadata: Record<string, string> = {};
      if (data.metadata && typeof data.metadata === 'object') {
        Object.entries(data.metadata).forEach(([key, value]) => {
          metadata[key] = String(value);
        });
      }

      return {
        id: String(data.id),
        type: String(data.notificationType || data.type || 'system'),
        userId: String(data.userId || ''),
        subject: String(data.subject),
        message: String(data.message),
        recipient: String(data.recipient || ''),
        isRead: Boolean(data.isRead || false),
        createdAt: timestamp,
        priority: this.parsePriority(data.priority),
        actionUrl: data.actionUrl ? String(data.actionUrl) : '',
        category: String(data.notificationType || 'system'),
        metadata,
      };
    } catch (error) {
      console.error('Failed to transform message to notification:', error);
      return null;
    }
  }

  /**
   * Parse and validate priority value
   */
  private parsePriority(priority: unknown): 'low' | 'medium' | 'high' {
    if (priority === 'low' || priority === 'high') {
      return priority;
    }
    return 'medium';
  }
}
