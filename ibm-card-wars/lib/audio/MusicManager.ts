/**
 * MusicManager - Singleton service for managing background music
 *
 * Features:
 * - Background music playback with looping
 * - Volume control (0.0 - 1.0)
 * - Smooth crossfade between tracks
 * - Fade in/out effects
 * - Persistent settings via localStorage
 */

class MusicManager {
  private static instance: MusicManager;
  private currentTrack: HTMLAudioElement | null = null;
  private volume: number = 0.5;
  private muted: boolean = false;
  private initialized: boolean = false;
  private tracks: Map<string, string> = new Map();
  private fadeInterval: NodeJS.Timeout | null = null;

  private constructor() {
    // Load settings from localStorage
    if (typeof window !== 'undefined') {
      const savedVolume = localStorage.getItem('music-volume');
      const savedMuted = localStorage.getItem('music-muted');

      if (savedVolume !== null) {
        this.volume = parseFloat(savedVolume);
      }
      if (savedMuted !== null) {
        this.muted = savedMuted === 'true';
      }
    }
  }

  public static getInstance(): MusicManager {
    if (!MusicManager.instance) {
      MusicManager.instance = new MusicManager();
    }
    return MusicManager.instance;
  }

  /**
   * Initialize music tracks
   */
  public init(): void {
    if (this.initialized || typeof window === 'undefined') return;

    // Register music tracks
    this.tracks.set('menu', '/music/menu.mp3');
    this.tracks.set('battle', '/music/battle.mp3');
    this.tracks.set('victory', '/music/victory-theme.mp3');

    this.initialized = true;
  }

  /**
   * Play a music track
   * @param trackId - The ID of the track to play
   * @param loop - Whether to loop the track (default: true)
   * @param fadeIn - Fade in duration in milliseconds (default: 1000)
   */
  public play(trackId: string, loop: boolean = true, fadeIn: number = 1000): void {
    if (typeof window === 'undefined') return;

    const trackPath = this.tracks.get(trackId);
    if (!trackPath) {
      console.warn(`Music track not found: ${trackId}`);
      return;
    }

    // Stop current track if playing
    if (this.currentTrack) {
      this.stop();
    }

    // Create new audio element
    const audio = new Audio(trackPath);
    audio.loop = loop;
    audio.volume = 0; // Start at 0 for fade in

    // Handle errors
    audio.onerror = () => {
      console.warn(`Failed to load music: ${trackId} (${trackPath})`);
    };

    this.currentTrack = audio;

    // Play and fade in
    if (!this.muted) {
      audio.play().catch((error) => {
        console.warn(`Failed to play music: ${trackId}`, error);
      });

      this.fadeIn(fadeIn);
    }
  }

  /**
   * Stop current track
   */
  public stop(): void {
    if (this.currentTrack) {
      this.currentTrack.pause();
      this.currentTrack.currentTime = 0;
      this.currentTrack = null;
    }

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
      this.fadeInterval = null;
    }
  }

  /**
   * Pause current track
   */
  public pause(): void {
    if (this.currentTrack) {
      this.currentTrack.pause();
    }
  }

  /**
   * Resume current track
   */
  public resume(): void {
    if (this.currentTrack && !this.muted) {
      this.currentTrack.play().catch((error) => {
        console.warn('Failed to resume music', error);
      });
    }
  }

  /**
   * Fade out current track
   * @param duration - Fade duration in milliseconds
   */
  public fadeOut(duration: number = 1000): Promise<void> {
    return new Promise((resolve) => {
      if (!this.currentTrack) {
        resolve();
        return;
      }

      const startVolume = this.currentTrack.volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeDecrement = startVolume / steps;

      if (this.fadeInterval) {
        clearInterval(this.fadeInterval);
      }

      let currentStep = 0;
      this.fadeInterval = setInterval(() => {
        currentStep++;

        if (this.currentTrack) {
          this.currentTrack.volume = Math.max(0, startVolume - volumeDecrement * currentStep);
        }

        if (currentStep >= steps) {
          if (this.fadeInterval) {
            clearInterval(this.fadeInterval);
            this.fadeInterval = null;
          }
          this.stop();
          resolve();
        }
      }, stepDuration);
    });
  }

  /**
   * Fade in current track
   * @param duration - Fade duration in milliseconds
   */
  private fadeIn(duration: number): void {
    if (!this.currentTrack) return;

    const targetVolume = this.volume;
    const steps = 20;
    const stepDuration = duration / steps;
    const volumeIncrement = targetVolume / steps;

    if (this.fadeInterval) {
      clearInterval(this.fadeInterval);
    }

    let currentStep = 0;
    this.fadeInterval = setInterval(() => {
      currentStep++;

      if (this.currentTrack) {
        this.currentTrack.volume = Math.min(targetVolume, volumeIncrement * currentStep);
      }

      if (currentStep >= steps && this.fadeInterval) {
        clearInterval(this.fadeInterval);
        this.fadeInterval = null;
      }
    }, stepDuration);
  }

  /**
   * Crossfade to a new track
   * @param trackId - The ID of the new track
   * @param duration - Crossfade duration in milliseconds
   */
  public async crossfade(trackId: string, duration: number = 2000): Promise<void> {
    await this.fadeOut(duration / 2);
    this.play(trackId, true, duration / 2);
  }

  /**
   * Set volume for music (0.0 - 1.0)
   */
  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.currentTrack) {
      this.currentTrack.volume = this.volume;
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('music-volume', this.volume.toString());
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

    if (this.currentTrack) {
      if (muted) {
        this.currentTrack.pause();
      } else {
        this.currentTrack.volume = this.volume;
        this.currentTrack.play().catch((error) => {
          console.warn('Failed to unmute music', error);
        });
      }
    }

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('music-muted', muted.toString());
    }
  }

  /**
   * Get muted state
   */
  public isMuted(): boolean {
    return this.muted;
  }
}

// Export singleton instance
export const musicManager = MusicManager.getInstance();
