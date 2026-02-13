import { WebSocketMessage } from '../types';

/**
 * MessageQueue - Queues messages to be sent when WebSocket is reconnected
 *
 * Features:
 * - FIFO queue
 * - Size limit to prevent memory issues
 * - Automatic expiration of old messages
 * - Priority support
 */
export class MessageQueue {
  private queue: Array<{
    message: WebSocketMessage;
    timestamp: number;
    priority: number;
  }> = [];

  constructor(
    private maxSize: number = 100,
    private maxAge: number = 5 * 60 * 1000 // 5 minutes
  ) {}

  /**
   * Add a message to the queue
   */
  enqueue(message: WebSocketMessage, priority: number = 0): boolean {
    // Remove expired messages
    this.removeExpired();

    // Check if queue is full
    if (this.queue.length >= this.maxSize) {
      // Remove lowest priority message if queue is full
      const lowestPriorityIndex = this.queue.findIndex(
        (item) => item.priority === Math.min(...this.queue.map((q) => q.priority))
      );
      if (lowestPriorityIndex !== -1) {
        this.queue.splice(lowestPriorityIndex, 1);
      } else {
        // If all have same priority, remove oldest
        this.queue.shift();
      }
    }

    // Insert message in priority order (higher priority first)
    const index = this.queue.findIndex((item) => item.priority < priority);
    if (index === -1) {
      this.queue.push({ message, timestamp: Date.now(), priority });
    } else {
      this.queue.splice(index, 0, { message, timestamp: Date.now(), priority });
    }

    return true;
  }

  /**
   * Get and remove the next message from the queue
   */
  dequeue(): WebSocketMessage | null {
    this.removeExpired();
    const item = this.queue.shift();
    return item?.message ?? null;
  }

  /**
   * Get all queued messages without removing them
   */
  peekAll(): WebSocketMessage[] {
    this.removeExpired();
    return this.queue.map((item) => item.message);
  }

  /**
   * Get the number of queued messages
   */
  size(): number {
    this.removeExpired();
    return this.queue.length;
  }

  /**
   * Check if queue is empty
   */
  isEmpty(): boolean {
    this.removeExpired();
    return this.queue.length === 0;
  }

  /**
   * Clear all messages from the queue
   */
  clear(): void {
    this.queue = [];
  }

  /**
   * Remove expired messages based on maxAge
   */
  private removeExpired(): void {
    const now = Date.now();
    this.queue = this.queue.filter((item) => now - item.timestamp < this.maxAge);
  }
}
