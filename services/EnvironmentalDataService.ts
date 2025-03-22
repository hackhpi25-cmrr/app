import { Platform } from 'react-native';
import { AuthService } from '@/services/AuthService';
import { jwtDecode } from '@/utils/jwtHelper';
import { Audio } from 'expo-av';

// Try importing Location, but provide fallback if it fails
let Location: any = null;
try {
  // Dynamic import to handle missing module
  Location = require('expo-location');
} catch (error) {
  console.warn('expo-location module could not be loaded, using simulation fallback', error);
}

// Interval in milliseconds (2 minutes instead of 30 seconds to reduce server load)
const DATA_COLLECTION_INTERVAL = 120000; // 2 minutes

class EnvironmentalDataService {
  private timer: NodeJS.Timeout | null = null;
  private userId: number | null = null;
  private isRunning = false;
  private weatherApiKey = ''; // You would need to get an API key from a weather service
  private hasLocationModule: boolean = !!Location;

  // Initialize and start the service
  async start(): Promise<boolean> {
    try {
      // Get user ID from auth token
      await this.getUserId();
      
      if (!this.userId) {
        console.error('Failed to get user ID, cannot start environmental data service');
        return false;
      }

      // Request necessary permissions
      await this.requestPermissions();
      
      // Start collection timer if not already running
      if (!this.isRunning) {
        this.startPeriodicCollection();
        return true;
      }
      
      return this.isRunning;
    } catch (error) {
      console.error('Error starting environmental data service:', error);
      return false;
    }
  }

  // Stop the service
  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log('Environmental data service stopped');
  }

  // Get user ID from authentication token
  private async getUserId(): Promise<void> {
    try {
      const tokens = await AuthService.getTokens();
      if (!tokens) {
        console.error('No auth tokens available');
        return;
      }

      // Extract user ID from token
      const payload = jwtDecode(tokens.access);
      if (payload && payload.user_id) {
        this.userId = payload.user_id;
      } else if (payload && payload.sub && typeof payload.sub === 'string') {
        try {
          const parsedId = parseInt(payload.sub, 10);
          if (!isNaN(parsedId)) {
            this.userId = parsedId;
          }
        } catch {
          console.error('Failed to parse user ID from token');
        }
      }
    } catch (error) {
      console.error('Error retrieving user ID:', error);
    }
  }

  // Request necessary permissions for location and audio
  private async requestPermissions(): Promise<void> {
    try {
      // Request location permissions for weather data
      if (this.hasLocationModule) {
        try {
          const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
          if (locationStatus !== 'granted') {
            console.warn('Location permission denied. Weather data will be simulated.');
          }
        } catch (error) {
          console.warn('Failed to request location permissions:', error);
        }
      }

      // Request audio permissions for loudness measurement
      if (Platform.OS !== 'web') {
        try {
          const { status: audioStatus } = await Audio.requestPermissionsAsync();
          if (audioStatus !== 'granted') {
            console.warn('Audio permission denied. Loudness data will be simulated.');
          }
        } catch (error) {
          console.warn('Failed to request audio permissions:', error);
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  }

  // Start periodic data collection
  private startPeriodicCollection(): void {
    this.isRunning = true;
    console.log('Starting environmental data collection...');
    
    // Collect data immediately
    this.collectAndSendData();
    
    // Set up periodic collection
    this.timer = setInterval(() => {
      this.collectAndSendData();
    }, DATA_COLLECTION_INTERVAL);
  }

  // Collect and send environmental data
  private async collectAndSendData(): Promise<void> {
    try {
      // Get temperature data
      const temperature = await this.getTemperature();
      
      // Get loudness data
      const loudness = await this.getLoudness();
      
      // Format and send data
      await this.sendDataToBackend(temperature, loudness);
      
      console.log(`Data sent: Temperature: ${temperature}°C, Loudness: ${loudness}dB`);
    } catch (error) {
      // Log the error but don't stop the service
      console.error('Error collecting or sending data:', error);
    }
  }

  // Get temperature data from weather API or simulate
  private async getTemperature(): Promise<number> {
    try {
      if (!this.weatherApiKey || !this.hasLocationModule) {
        return this.simulateTemperature();
      }

      try {
        // Get location
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Call weather API (example using OpenWeatherMap)
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${this.weatherApiKey}`
        );

        if (!response.ok) {
          return this.simulateTemperature();
        }

        const data = await response.json();
        const temperature = Math.max(0, Math.round(data.main.temp)); // Celsius, minimum 0
        
        return temperature;
      } catch (error) {
        console.warn('Error getting temperature, using simulated data:', error);
        return this.simulateTemperature();
      }
    } catch (error) {
      console.warn('Fatal error getting temperature, using simulated data:', error);
      return this.simulateTemperature();
    }
  }

  // Measure or simulate loudness
  private async getLoudness(): Promise<number> {
    try {
      if (Platform.OS === 'web') {
        return this.simulateLoudness();
      }

      try {
        // Initialize audio recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: '.m4a',
            outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 44100,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
        });

        await recording.startAsync();
        
        // Record for a short period to measure ambient sound
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get recording status which includes metering info
        const status = await recording.getStatusAsync();
        
        // Stop and clean up recording
        await recording.stopAndUnloadAsync();
        
        // Calculate loudness from metering info (if available)
        let loudness = 40; // Default fallback value
        
        if (status.metering !== undefined) {
          // Convert from dBFS to dB SPL (approximate conversion)
          // dBFS typically ranges from -160 to 0, with 0 being max volume
          // Adding 60-80 to convert to dB SPL (ambient sound is typically 40-80 dB)
          loudness = Math.round(Math.max(0, (status.metering || -60) + 80));
        } else {
          // If metering isn't available, use simulated data
          return this.simulateLoudness();
        }
        
        return loudness;
      } catch (error) {
        console.warn('Error measuring loudness, using simulated data:', error);
        return this.simulateLoudness();
      }
    } catch (error) {
      console.warn('Fatal error measuring loudness, using simulated data:', error);
      return this.simulateLoudness();
    }
  }

  // Simulate loudness data (for fallback)
  private simulateLoudness(): number {
    // Typical environmental noise ranges from 30dB (quiet room) to 90dB (busy city)
    return Math.round(30 + Math.random() * 60);
  }

  // Simulate temperature data (for fallback)
  private simulateTemperature(): number {
    // Random temperature between 0 and 35 degrees Celsius
    return Math.max(0, Math.round(Math.random() * 35));
  }

  // Helper function to create a fetch request with timeout
  private fetchWithTimeout(url: string, options: RequestInit, timeout = 10000): Promise<Response> {
    return new Promise((resolve, reject) => {
      // Set up timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`Request timed out after ${timeout}ms`));
      }, timeout);
      
      // Modify options to include the signal
      const fetchOptions = {
        ...options,
        signal: controller.signal
      };
      
      // Make the fetch request
      fetch(url, fetchOptions)
        .then(response => {
          clearTimeout(timeoutId);
          resolve(response);
        })
        .catch(error => {
          clearTimeout(timeoutId);
          reject(error);
        });
    });
  }

  // Send collected data to backend
  private async sendDataToBackend(temperature: number, loudness: number): Promise<void> {
    if (!this.userId) {
      console.error('No user ID available, cannot send data');
      return;
    }

    try {
      // Format data for the API
      const entries = [
        {
          parameter_id: 15, // Temperature parameter ID
          answer: temperature,
          normalised_answer: temperature / 100 // Normalize to 0-1 range (assuming max temp 100°C)
        },
        {
          parameter_id: 16, // Loudness parameter ID
          answer: loudness,
          normalised_answer: loudness / 120 // Normalize to 0-1 range (assuming max 120dB)
        }
      ];

      // The API expects this exact structure
      const payload = { 
        entries,
        is_auto_generated: true  // This will trigger passive treatment suggestions in the backend
      };

      console.log(`Sending to backend: ${JSON.stringify(payload)}`);

      // Send data to backend with timeout
      const apiUrl = `${AuthService.API_URL}/users/${this.userId}/logs`;
      const response = await this.fetchWithTimeout(
        apiUrl,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        },
        10000 // 10 second timeout
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error(`Server error (${response.status}): ${errorText}`);
        throw new Error(`Server responded with ${response.status}`);
      }

      // The backend might return a suggestion for passive data
      try {
        const data = await response.json();
        if (data && data.treatment) {
          console.log(`Received treatment suggestion: ${data.treatment}`);
        }
      } catch (e) {
        // No treatment data returned, which is fine
      }
    } catch (error) {
      if (error instanceof TypeError || (error instanceof Error && error.message.includes('Network'))) {
        console.warn('Network connectivity issue, will retry on next interval:', error);
      } else {
        console.error('Failed to send environmental data to backend:', error);
      }
    }
  }
}

// Export singleton instance
export default new EnvironmentalDataService(); 