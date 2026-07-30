/**
 * SoundManager - Singleton service for managing game sound effects
 *
 * Features:
 * - Preload sounds for instant playback
 * - Volume control (0.0 - 1.0)
 * - Global mute toggle
 * - Prevent overlapping of same sound
 * - Persistent settings via localStorage
 */

class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private volume: number = 0.7;
  private muted: boolean = false;
  private initialized: boolean = false;

  private constructor() {
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('sfx-volume');
      const savedMuted = localStorage.getItem('sfx-muted');

      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
      if (savedMuted !== null) {
        this.muted = savedMuted === 'true';
      }
    }
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /**
   * Initialize and preload all game sounds
   */
  public init(): void {
    if (this.initialized || typeof window === 'undefined') return;

    // Preload all sound effects
    this.preload('card-play', '/sounds/card-play.mp3');
    this.preload('attack', '/sounds/attack.mp3');
    this.preload('damage', '/sounds/damage.mp3');
    this.preload('heal', '/sounds/heal.mp3');
    this.preload('draw', '/sounds/draw.mp3');
    this.preload('button-click', '/sounds/button-click.mp3');
    this.preload('pack-open', '/sounds/pack-open.mp3');
    this.preload('victory', '/sounds/victory.mp3');
    this.preload('defeat', '/sounds/defeat.mp3');
    this.preload('level-up', '/sounds/level-up.mp3');
    this.preload('mission-complete', '/sounds/mission-complete.mp3');

    this.initialized = true;
  }

  /**
   * Preload a sound file
   */
  public preload(soundId: string, path: string): void {
    if (typeof window === 'undefined') return;

    const audio = new Audio(path);
    audio.preload = 'auto';
    audio.volume = this.volume;

    // Handle loading errors gracefully
    audio.onerror = () => {
      console.warn(`Failed to load sound: ${soundId} (${path})`);
    };

    this.sounds.set(soundId, audio);
  }

  /**
   * Play a sound effect
   * @param soundId - The ID of the sound to play
   * @param volumeOverride - Optional volume override for this play (0.0 - 1.0)
   */
  public play(soundId: string, volumeOverride?: number): void {
    if (this.muted || typeof window === 'undefined') return;

    const sound = this.sounds.get(soundId);
    if (!sound) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }

    // Stop current playback if sound is already playing
    if (!sound.paused) {
      sound.currentTime = 0;
    }

    // Set volume
    sound.volume = volumeOverride !== undefined ? volumeOverride : this.volume;

    // Play sound
    sound.play().catch((error) => {
      console.warn(`Failed to play sound: ${soundId}`, error);
    });
  }

  /**
   * Stop a specific sound
   */
  public stop(soundId: string): void {
    const sound = this.sounds.get(soundId);
    if (sound) {
      sound.pause();
      sound.currentTime = 0;
    }
  }

  /**
   * Stop all sounds
   */
  public stopAll(): void {
    this.sounds.forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
  }

  /**
   * Set volume for all sounds (0.0 - 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));

    // Update all loaded sounds
    this.sounds.forEach((sound) => {
      sound.volume = this.volume;
    });

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sfx-volume', this.volume.toString());
    }
  }

  /**
   * Get current volume
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Toggle mute
   */
  public setMuted(muted: boolean): void {
    this.muted = muted;

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('sfx-muted', muted.toString());
    }
  }

  /**
   * Get muted state
   */
  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Play a test sound for settings preview
   */
  public playTest(): void {
    this.play('button-click');
  }
}

// Export singleton instance
export const soundManager = SoundManager.getInstance();
