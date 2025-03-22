import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Define treatment route types for type safety
type TreatmentRoute = '/(treatments)/sounds' | '/(treatments)/distractions' | '/(treatments)/relaxation' | '/(treatments)/movement' | '/(treatments)/earjaw';

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
  
  // Mapping of treatment names to treatment routes for navigation
  private treatmentRouteMapping: Record<string, TreatmentRoute> = {
    // Sound therapy treatments
    'White Noise': '/(treatments)/sounds',
    'Pink Noise': '/(treatments)/sounds',
    'Nature Sounds': '/(treatments)/sounds',
    
    // Distraction treatments
    'Focused Attention': '/(treatments)/distractions',
    'Background Music': '/(treatments)/distractions',
    
    // Relaxation treatments
    'Deep Breathing': '/(treatments)/relaxation',
    'Progressive Muscle Relaxation': '/(treatments)/relaxation',
    'Meditation': '/(treatments)/relaxation',
    
    // Movement treatments
    'Neck Exercises': '/(treatments)/movement',
    'Yoga': '/(treatments)/movement',
    
    // Ear & Jaw treatments
    'TMJ Exercises': '/(treatments)/earjaw',
    'Ear Massage': '/(treatments)/earjaw',
  };

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
   * Get the appropriate route for a treatment name
   * @param treatmentName The name of the treatment
   * @returns The route to navigate to for this treatment
   */
  private getTreatmentRoute(treatmentName: string): TreatmentRoute {
    // Default to sounds if we don't have a mapping for this treatment
    const defaultRoute: TreatmentRoute = '/(treatments)/sounds';
    
    // Check if we have an exact match
    if (this.treatmentRouteMapping[treatmentName]) {
      return this.treatmentRouteMapping[treatmentName];
    }
    
    // Try to find a partial match (case insensitive)
    const treatmentNameLower = treatmentName.toLowerCase();
    
    if (treatmentNameLower.includes('noise') || treatmentNameLower.includes('sound')) {
      return '/(treatments)/sounds';
    } else if (treatmentNameLower.includes('distract') || treatmentNameLower.includes('attention')) {
      return '/(treatments)/distractions';
    } else if (treatmentNameLower.includes('relax') || treatmentNameLower.includes('breath') || treatmentNameLower.includes('meditat')) {
      return '/(treatments)/relaxation';
    } else if (treatmentNameLower.includes('movement') || treatmentNameLower.includes('exercise') || treatmentNameLower.includes('yoga')) {
      return '/(treatments)/movement';
    } else if (treatmentNameLower.includes('ear') || treatmentNameLower.includes('jaw') || treatmentNameLower.includes('tmj')) {
      return '/(treatments)/earjaw';
    }
    
    return defaultRoute;
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
   * @param treatment The treatment name to suggest
   * @param additionalInfo Optional additional information about the treatment
   * @returns Promise resolving to boolean indicating success
   */
  async sendTreatmentSuggestion(
    treatment: string, 
    additionalInfo: string = ''
  ): Promise<boolean> {
    // Create a more informative message with actionable language
    const bodyText = additionalInfo 
      ? `Try ${treatment} now to help manage your tinnitus symptoms. ${additionalInfo}`
      : `Try ${treatment} now to help manage your tinnitus symptoms. Open the app for detailed instructions.`;
    
    // Get the appropriate route for this treatment type
    const treatmentRoute = this.getTreatmentRoute(treatment);
    
    return this.sendNotification(
      'Personalized Tinnitus Relief Suggestion',
      bodyText,
      { 
        type: 'treatment_suggestion', 
        treatmentName: treatment,
        route: treatmentRoute // Include the route for navigation when notification is tapped
      }
    );
  }
}

// Export a singleton instance
export default new NotificationService(); 