import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification settings 
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private hasPermission: boolean = false;

  /**
   * Initialize the notification service 
   */
  async initialize(): Promise<boolean> {
    try {
      // Request permission to send notifications
      const permission = await this.requestPermissions();
      this.hasPermission = permission;
      return permission;
    } catch (error) {
      console.error('Error initializing notification service:', error);
      return false;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Skip permissions on web
      if (Platform.OS === 'web') {
        return false;
      }

      // Check if permissions are already granted
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Only ask for permissions if not already granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      return finalStatus === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  /**
   * Send a local notification
   * @param title The notification title
   * @param body The notification body text
   * @param data Additional data to include with the notification
   */
  async sendNotification(title: string, body: string, data: any = {}): Promise<boolean> {
    try {
      // Check if we have permission
      if (!this.hasPermission) {
        const hasPermission = await this.requestPermissions();
        if (!hasPermission) {
          return false;
        }
      }

      // Schedule immediate notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
        },
        trigger: null, // Null trigger = show immediately
      });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  /**
   * Send treatment suggestion notification
   */
  async sendTreatmentSuggestion(treatment: string): Promise<boolean> {
    return this.sendNotification(
      'Tinnitus Treatment Suggestion',
      treatment,
      { type: 'treatment_suggestion' }
    );
  }
}

// Export a singleton instance
export default new NotificationService(); 