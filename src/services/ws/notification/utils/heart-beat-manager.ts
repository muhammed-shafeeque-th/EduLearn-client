/**
 * HeartbeatManager - Manages WebSocket heartbeat/ping-pong mechanism
 *
 * Features:
 * - Automatic heartbeat sending
 * - Configurable interval
 * - Missing heartbeat detection
 * - Proper cleanup
 */
export class HeartbeatManager {
  private intervalId: NodeJS.Timeout | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  private lastPongReceived: number = 0;

  constructor(
    private interval: number,
    private onHeartbeat: () => void,
    private onTimeout?: () => void,
    private timeoutThreshold: number = interval * 2 // Default: 2x interval
  ) {}

  /**
   * Start the heartbeat mechanism
   */
  start(): void {
    this.stop();
    this.lastPongReceived = Date.now();

    this.intervalId = setInterval(() => {
      this.onHeartbeat();
      this.checkTimeout();
    }, this.interval);
  }

  /**
   * Stop the heartbeat mechanism
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Mark that a pong was received
   */
  markPongReceived(): void {
    this.lastPongReceived = Date.now();
  }

  /**
   * Check if heartbeat timeout has been exceeded
   */
  private checkTimeout(): void {
    const timeSinceLastPong = Date.now() - this.lastPongReceived;

    if (timeSinceLastPong > this.timeoutThreshold && this.onTimeout) {
      this.onTimeout();
    }
  }

  /**
   * Check if heartbeat is currently running
   */
  isRunning(): boolean {
    return this.intervalId !== null;
  }

  /**
   * Reset the heartbeat state
   */
  reset(): void {
    this.lastPongReceived = Date.now();
  }
}
