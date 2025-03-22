import { AuthService } from '@/services/AuthService';
import { jwtDecode } from '@/utils/jwtHelper';

// Interval in milliseconds (2 minutes instead of 30 seconds to reduce server load)
const DATA_COLLECTION_INTERVAL = 120000; // 2 minutes

/**
 * FallbackEnvironmentalService provides simulated environmental data without relying on native modules.
 * This is a fully JavaScript implementation that can be used when native modules aren't available.
 */
class FallbackEnvironmentalService {
  private timer: NodeJS.Timeout | null = null;
  private userId: number | null = null;
  private isRunning = false;

  // Initialize and start the service
  async start(): Promise<boolean> {
    try {
      // Get user ID from auth token
      await this.getUserId();
      
      if (!this.userId) {
        console.error('Failed to get user ID, cannot start environmental data service');
        return false;
      }
      
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

  // Start periodic data collection
  private startPeriodicCollection(): void {
    this.isRunning = true;
    console.log('Starting fallback environmental data collection (simulated)...');
    
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
      // Get simulated data
      const temperature = this.simulateTemperature();
      const loudness = this.simulateLoudness();
      
      // Format and send data
      await this.sendDataToBackend(temperature, loudness);
      
      console.log(`Simulated data sent: Temperature: ${temperature}°C, Loudness: ${loudness}dB`);
    } catch (error) {
      // Log the error but don't stop the service
      console.error('Error collecting or sending data:', error);
    }
  }

  // Simulate temperature data
  private simulateTemperature(): number {
    // Random temperature between 0 and 35 degrees Celsius
    return Math.max(0, Math.round(Math.random() * 35));
  }

  // Simulate loudness data
  private simulateLoudness(): number {
    // Typical environmental noise ranges from 30dB (quiet room) to 90dB (busy city)
    return Math.round(30 + Math.random() * 60);
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
export default new FallbackEnvironmentalService(); 