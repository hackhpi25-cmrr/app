/**
 * Sound files module
 * Provides a centralized way to access sound files with fallbacks
 */

import { Platform } from 'react-native';

// Define a dummy object for when sounds can't be loaded
const DUMMY_SOUND = { uri: 'dummy' };

// Sound file registry - each sound will be loaded on demand
const SOUND_FILES = {
  // White Noise sounds
  'wn1': () => require('@/assets/sounds/white-noise.mp3'),
  'wn2': () => require('@/assets/sounds/pink-noise.mp3'),
  'wn3': () => require('@/assets/sounds/brown-noise.mp3'),
  
  // Nature sounds
  'nt1': () => require('@/assets/sounds/ocean-waves.mp3'),
  'nt2': () => require('@/assets/sounds/gentle-rain.mp3'),
};

// Cache for loaded sounds
const loadedSounds: Record<string, any> = {};

/**
 * Check if a sound file exists by ID
 */
export function soundExists(soundId: string): boolean {
  return !!SOUND_FILES[soundId];
}

/**
 * Get a sound file by ID, returns null if not available
 */
export function getSoundFile(soundId: string): any {
  try {
    // Try to get from cache first
    if (loadedSounds[soundId]) {
      return loadedSounds[soundId];
    }
    
    // Get from static imports
    if (SOUND_FILES[soundId]) {
      try {
        loadedSounds[soundId] = SOUND_FILES[soundId]();
        console.log(`Loaded sound: ${soundId}`);
        return loadedSounds[soundId];
      } catch (requireError) {
        // Sound file exists in registry but couldn't be loaded
        // Return null instead of dummy sound to indicate it should be skipped
        console.log(`Sound ${soundId} couldn't be loaded, skipping`);
        return null;
      }
    }
    
    // Return null for sounds that don't exist instead of fallback dummy
    console.log(`Sound ID not found: ${soundId}, skipping`);
    return null;
  } catch (error) {
    console.log(`Error in getSoundFile for ${soundId}, skipping`);
    return null;
  }
} 