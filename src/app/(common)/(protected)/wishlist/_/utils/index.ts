/* eslint-disable @typescript-eslint/no-explicit-any */
export class AudioManager {
  private static instance: AudioManager;
  private audioContext: AudioContext | null = null;
  private removeSound: AudioBuffer | null = null;

  private constructor() {}

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  async initialize() {
    if (typeof window === 'undefined') return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      await this.loadRemoveSound();
    } catch (error) {
      console.warn('Audio context initialization failed:', error);
    }
  }

  private async loadRemoveSound() {
    if (!this.audioContext) return;

    try {
      // Create a simple "pop" sound programmatically
      const sampleRate = this.audioContext.sampleRate;
      const duration = 0.1; // 100ms
      const length = sampleRate * duration;
      const buffer = this.audioContext.createBuffer(1, length, sampleRate);
      const data = buffer.getChannelData(0);

      // Generate a "pop" sound with frequency sweep
      for (let i = 0; i < length; i++) {
        const t = i / sampleRate;
        const frequency = 800 - 600 * t; // Frequency sweep from 800Hz to 200Hz
        const envelope = Math.exp(-t * 20); // Quick decay
        data[i] = Math.sin(2 * Math.PI * frequency * t) * envelope * 0.3;
      }

      this.removeSound = buffer;
    } catch (error) {
      console.warn('Failed to create remove sound:', error);
    }
  }

  playRemoveSound() {
    if (!this.audioContext || !this.removeSound) return;

    try {
      const source = this.audioContext.createBufferSource();
      const gainNode = this.audioContext.createGain();

      source.buffer = this.removeSound;
      gainNode.gain.value = 0.2; // Lower volume

      source.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      source.start();
    } catch (error) {
      console.warn('Failed to play remove sound:', error);
    }
  }
}

export function triggerHapticFeedback(type: 'light' | 'medium' | 'heavy' = 'medium') {
  if (typeof window === 'undefined') return;

  try {
    // Modern haptic feedback for supported devices
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [50],
        heavy: [100],
      };
      navigator.vibrate(patterns[type]);
    }

    // iOS haptic feedback (if available)
    if ('hapticFeedback' in window && (window as any).hapticFeedback) {
      (window as any).hapticFeedback.impact(type);
    }
  } catch (error) {
    console.warn('Haptic feedback not supported:', error);
  }
}
