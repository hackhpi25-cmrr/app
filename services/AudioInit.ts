import * as ExpoAV from 'expo-av';
import { Platform } from 'react-native';

let isAudioInitialized = false;
let initializationPromise: Promise<boolean> | null = null;

/**
 * Initialize the Audio system
 * This should be called early in the app lifecycle
 */
export async function initializeAudio(): Promise<boolean> {
  // Return existing initialization if it's already complete
  if (isAudioInitialized) {
    return true;
  }
  
  // Use existing promise if initialization is in progress
  if (initializationPromise) {
    return initializationPromise;
  }
  
  // Start new initialization
  initializationPromise = _initializeAudio();
  return initializationPromise;
}

/**
 * Private implementation of audio initialization
 */
async function _initializeAudio(): Promise<boolean> {
  try {
    console.log('Initializing audio system...');
    
    // Check if ExpoAV is available
    if (!ExpoAV || !ExpoAV.Audio) {
      console.warn('ExpoAV or Audio module is not available. Audio features will be disabled.');
      return false;
    }
    
    // Verify the native module is available
    try {
      // This will throw if the native module is not available
      await ExpoAV.Audio.getPermissionsAsync();
    } catch (err) {
      console.warn('Native audio module not available:', err);
      return false;
    }
    
    // Request permissions if needed (Android)
    if (Platform.OS === 'android') {
      try {
        const permissionResponse = await ExpoAV.Audio.requestPermissionsAsync();
        console.log('Audio permission response:', permissionResponse);
      } catch (permErr) {
        console.warn('Error requesting audio permissions:', permErr);
        // Continue anyway as this might not be fatal
      }
    }
    
    // Configure audio session with a small delay to ensure everything is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Configure audio session with safe fallbacks
    const audioConfig = {
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
      allowsRecordingIOS: false
    };
    
    // Add interruption modes if available
    if (ExpoAV.Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX) {
      audioConfig.interruptionModeIOS = ExpoAV.Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX;
    }
    
    if (ExpoAV.Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX) {
      audioConfig.interruptionModeAndroid = ExpoAV.Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX;
    }
    
    await ExpoAV.Audio.setAudioModeAsync(audioConfig);
    
    console.log('Audio system initialized successfully');
    isAudioInitialized = true;
    return true;
  } catch (error) {
    console.error('Failed to initialize audio system:', error);
    initializationPromise = null; // Allow retry
    return false;
  }
}

/**
 * Check if audio is initialized
 */
export function isAudioReady(): boolean {
  return isAudioInitialized;
} 