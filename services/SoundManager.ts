import * as ExpoAV from 'expo-av';

/**
 * Sound Manager Service
 * Handles loading and playback of audio files in the app
 */
class SoundManager {
  private sounds: Map<string, ExpoAV.Audio.Sound>;
  private currentlyPlaying: string | null = null;
  private isAvailable: boolean = true;

  constructor() {
    this.sounds = new Map();
    
    // Check if ExpoAV is available
    this.isAvailable = this.checkAvailability();
  }
  
  /**
   * Check if the audio system is available
   */
  private checkAvailability(): boolean {
    try {
      return !!(ExpoAV && ExpoAV.Audio);
    } catch (e) {
      console.warn('ExpoAV not available:', e);
      return false;
    }
  }

  /**
   * Load a sound into memory
   * @param soundId The unique ID for the sound
   * @param source The require statement or URI for the sound file
   * @returns Boolean indicating if the sound was loaded successfully
   */
  async loadSound(soundId: string, source: any): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('Audio system not available, skipping loadSound');
      return false;
    }
    
    // Skip if source is null (meaning sound doesn't exist)
    if (!source) {
      console.log(`Sound source for ${soundId} is null, skipping load`);
      return false;
    }
    
    try {
      // If sound is already loaded, unload it first
      if (this.sounds.has(soundId)) {
        await this.unloadSound(soundId);
      }

      const { sound } = await ExpoAV.Audio.Sound.createAsync(source, { shouldPlay: false });
      this.sounds.set(soundId, sound);

      // Add onPlaybackStatusUpdate to handle when sound finishes playing
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          this.currentlyPlaying = null;
        }
      });

      console.log(`Sound ${soundId} loaded successfully`);
      return true;
    } catch (error: any) {
      console.log(`Error loading sound ${soundId}: ${error.message || 'Unknown error'}`);
      this.isAvailable = this.checkAvailability();
      
      // Make sure the sound is removed from the map if loading failed
      if (this.sounds.has(soundId)) {
        this.sounds.delete(soundId);
      }
      return false;
    }
  }

  /**
   * Play a sound
   * @param soundId The ID of the sound to play
   * @param loop Whether to loop the sound
   * @returns True if play started successfully, false otherwise
   */
  async playSound(soundId: string, loop: boolean = false): Promise<boolean> {
    if (!this.isAvailable) {
      console.warn('Audio system not available, skipping playSound');
      return false;
    }
    
    try {
      // Check if this is the currently playing sound
      if (this.currentlyPlaying === soundId) {
        // Stop the currently playing sound instead of playing it again
        console.log(`Sound ${soundId} is already playing, stopping it`);
        await this.stopSound(soundId);
        return false; // Indicate that the sound is now stopped
      }

      const sound = this.sounds.get(soundId);
      if (!sound) {
        console.warn(`Attempted to play sound ${soundId} but it's not loaded`);
        return false;
      }

      // If there's another sound playing, stop it
      if (this.currentlyPlaying && this.currentlyPlaying !== soundId) {
        await this.stopSound(this.currentlyPlaying);
      }

      // Get status and play from beginning if it was already played
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        if (status.positionMillis > 0) {
          await sound.setPositionAsync(0);
        }
        
        try {
          await sound.setIsLoopingAsync(loop);
          await sound.playAsync();
          this.currentlyPlaying = soundId;
          console.log(`Playing sound: ${soundId}, loop: ${loop}`);
          return true;
        } catch (playError) {
          console.error(`Error during playback of sound ${soundId}:`, playError);
          // Try to recover by reloading the sound
          return false;
        }
      } else {
        console.warn(`Sound ${soundId} is not loaded properly`);
        return false;
      }
    } catch (error) {
      console.error(`Error playing sound ${soundId}:`, error);
      this.isAvailable = this.checkAvailability();
      return false;
    }
  }

  /**
   * Pause the currently playing sound
   * @param soundId The ID of the sound to pause
   */
  async pauseSound(soundId: string): Promise<void> {
    if (!this.isAvailable) {
      console.warn('Audio system not available, skipping pauseSound');
      return;
    }
    
    try {
      const sound = this.sounds.get(soundId);
      if (sound) {
        await sound.pauseAsync();
        if (this.currentlyPlaying === soundId) {
          this.currentlyPlaying = null;
        }
      }
    } catch (error) {
      console.error(`Error pausing sound ${soundId}:`, error);
      this.isAvailable = this.checkAvailability();
    }
  }

  /**
   * Stop a sound
   * @param soundId The ID of the sound to stop
   */
  async stopSound(soundId: string): Promise<void> {
    if (!this.isAvailable) {
      console.warn('Audio system not available, skipping stopSound');
      return;
    }
    
    try {
      const sound = this.sounds.get(soundId);
      if (sound) {
        await sound.stopAsync();
        if (this.currentlyPlaying === soundId) {
          this.currentlyPlaying = null;
          console.log(`Stopped sound: ${soundId}`);
        }
      }
    } catch (error) {
      console.error(`Error stopping sound ${soundId}:`, error);
      this.isAvailable = this.checkAvailability();
      // Make sure the currentlyPlaying is reset even if there was an error
      if (this.currentlyPlaying === soundId) {
        this.currentlyPlaying = null;
      }
    }
  }

  /**
   * Unload a sound to free memory
   * @param soundId The ID of the sound to unload
   */
  async unloadSound(soundId: string): Promise<void> {
    if (!this.isAvailable) {
      console.warn('Audio system not available, skipping unloadSound');
      return;
    }
    
    try {
      const sound = this.sounds.get(soundId);
      if (sound) {
        await sound.unloadAsync();
        this.sounds.delete(soundId);
        if (this.currentlyPlaying === soundId) {
          this.currentlyPlaying = null;
        }
      }
    } catch (error) {
      console.error(`Error unloading sound ${soundId}:`, error);
      this.isAvailable = this.checkAvailability();
    }
  }

  /**
   * Get current playback status for a sound
   * @param soundId The ID of the sound to check
   * @returns Object with isPlaying status, or null if sound not loaded
   */
  async getPlaybackStatus(soundId: string): Promise<{ isPlaying: boolean } | null> {
    if (!this.isAvailable) {
      console.warn('Audio system not available, skipping getPlaybackStatus');
      return null;
    }
    
    try {
      const sound = this.sounds.get(soundId);
      if (!sound) return null;

      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        return { isPlaying: status.isPlaying };
      }
      return null;
    } catch (error) {
      console.error(`Error getting status for sound ${soundId}:`, error);
      this.isAvailable = this.checkAvailability();
      return null;
    }
  }

  /**
   * Clean up all sounds (call on component unmount)
   */
  async unloadAll(): Promise<void> {
    if (!this.isAvailable) {
      console.warn('Audio system not available, skipping unloadAll');
      return;
    }
    
    try {
      for (const soundId of this.sounds.keys()) {
        await this.unloadSound(soundId);
      }
      this.currentlyPlaying = null;
    } catch (error) {
      console.error('Error unloading all sounds:', error);
      this.isAvailable = this.checkAvailability();
    }
  }
}

// Export a singleton instance
export const soundManager = new SoundManager(); 