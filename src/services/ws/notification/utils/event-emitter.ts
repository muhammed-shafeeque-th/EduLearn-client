export type EventCallback<T = unknown> = (data: T) => void;

interface ListenerMetadata {
  callback: EventCallback<unknown>;
  once: boolean;
}

/**
 * TypedEventEmitter - A type-safe event emitter with enhanced features
 *
 * Features:
 * - Type-safe event handling
 * - Once() support for single-fire listeners
 * - Error handling isolation
 * - Memory leak prevention
 * - Listener count tracking
 */
export class TypedEventEmitter<Events extends Record<string, unknown>> {
  private listeners = new Map<keyof Events, Set<ListenerMetadata>>();

  /**
   * Subscribe to an event
   * @returns Unsubscribe function
   */
  on<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const metadata: ListenerMetadata = {
      callback: callback as EventCallback<unknown>,
      once: false,
    };

    this.listeners.get(event)!.add(metadata);

    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event that fires only once
   * @returns Unsubscribe function
   */
  once<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const metadata: ListenerMetadata = {
      callback: callback as EventCallback<unknown>,
      once: true,
    };

    this.listeners.get(event)!.add(metadata);

    return () => this.off(event, callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof Events>(event: K, callback: EventCallback<Events[K]>): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    for (const metadata of eventListeners) {
      if (metadata.callback === callback) {
        eventListeners.delete(metadata);
        break;
      }
    }

    // Clean up empty listener sets
    if (eventListeners.size === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Remove all listeners for an event or all events
   */
  removeAllListeners<K extends keyof Events>(event?: K): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Emit an event to all subscribers
   */
  emit<K extends keyof Events>(event: K, data: Events[K]): void {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners || eventListeners.size === 0) return;

    // Collect listeners to remove (once listeners)
    const toRemove: ListenerMetadata[] = [];

    // Invoke all listeners
    eventListeners.forEach((metadata) => {
      try {
        metadata.callback(data);
        if (metadata.once) {
          toRemove.push(metadata);
        }
      } catch (error) {
        console.error(`Error in event handler for ${String(event)}:`, error);
        // Optionally emit an error event here if needed
      }
    });

    // Remove once listeners
    toRemove.forEach((metadata) => eventListeners.delete(metadata));

    // Clean up empty listener sets
    if (eventListeners.size === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Get the number of listeners for an event
   */
  listenerCount<K extends keyof Events>(event: K): number {
    return this.listeners.get(event)?.size ?? 0;
  }

  /**
   * Check if there are any listeners for an event
   */
  hasListeners<K extends keyof Events>(event: K): boolean {
    return this.listenerCount(event) > 0;
  }

  /**
   * Clear all listeners
   */
  clear(): void {
    this.listeners.clear();
  }

  /**
   * Get all event names that have listeners
   */
  eventNames(): Array<keyof Events> {
    return Array.from(this.listeners.keys());
  }
}
