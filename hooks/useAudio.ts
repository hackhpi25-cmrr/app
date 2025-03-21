import { useState, useEffect, useCallback } from 'react';
import { soundManager } from '@/services/SoundManager';
import * as ExpoAV from 'expo-av';
import { initializeAudio, isAudioReady as checkAudioReady } from '@/services/AudioInit';

/**
 * Custom hook for audio playback functionality
 * @returns Audio playback controls and state
 */
export function useAudio() {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isAudioReady, setIsAudioReady] = useState(checkAudioReady());

  // Initialize Audio on component mount
  useEffect(() => {
    let isMounted = true;
    
    async function setupAudio() {
      try {
        const success = await initializeAudio();
        if (isMounted && success) {
          setIsAudioReady(true);
        } else if (isMounted) {
          // Make sure to update state if audio initialization failed
          setIsAudioReady(false);
        }
      } catch (error) {
        console.error('Error setting up audio:', error);
        if (isMounted) {
          setIsAudioReady(false);
        }
      }
    }

    if (!isAudioReady) {
      setupAudio();
    }

    // Clean up on unmount
    return () => {
      isMounted = false;
      if (playingId) {
        // Try to cleanup playing sounds but don't crash if ExpoAV isn't available
        try {
          soundManager.pauseSound(playingId);
        } catch (err) {
          console.warn('Error cleaning up audio:', err);
        }
      }
    };
  }, [isAudioReady, playingId]);

  // Load a sound file
  const loadSound = useCallback(async (soundId: string, source: any) => {
    try {
      if (!isAudioReady) {
        const success = await initializeAudio();
        if (!success) return false;
      }
      
      await soundManager.loadSound(soundId, source);
      return true;
    } catch (error) {
      console.error(`Error loading sound ${soundId}:`, error);
      return false;
    }
  }, [isAudioReady]);

  // Play a sound
  const playSound = useCallback(async (soundId: string, loop: boolean = false) => {
    try {
      // If audio isn't ready, initialize it first
      if (!isAudioReady) {
        const success = await initializeAudio();
        if (!success) return false;
      }
      
      // Check if this is the currently playing sound
      if (playingId === soundId) {
        // Get current status
        const status = await soundManager.getPlaybackStatus(soundId);
        if (status?.isPlaying) {
          // If it's already playing, pause it
          await soundManager.pauseSound(soundId);
          setPlayingId(null);
          return false;
        }
      }

      // Play the requested sound
      const success = await soundManager.playSound(soundId, loop);
      if (success) {
        setPlayingId(soundId);
      } else {
        // If playback failed, try reloading the sound
        console.log(`Playback failed for ${soundId}, attempting to reload`);
      }
      return success;
    } catch (error) {
      console.error(`Error in playSound for ${soundId}:`, error);
      return false;
    }
  }, [playingId, isAudioReady]);

  // Stop a sound
  const stopSound = useCallback(async (soundId: string) => {
    try {
      if (!isAudioReady) return;
      await soundManager.stopSound(soundId);
      if (playingId === soundId) {
        setPlayingId(null);
      }
    } catch (error) {
      console.error(`Error stopping sound ${soundId}:`, error);
    }
  }, [playingId, isAudioReady]);

  // Check if a specific sound is playing
  const isPlaying = useCallback((soundId: string) => {
    if (!isAudioReady) return false;
    return playingId === soundId;
  }, [playingId, isAudioReady]);

  return {
    isAudioReady,
    loadSound,
    playSound,
    stopSound,
    isPlaying,
    currentlyPlaying: playingId,
  };
} 