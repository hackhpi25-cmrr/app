import { AuthService } from './AuthService';

export interface Parameter {
  id: number;
  name: string;
  parameter_type: 'Enum' | 'Boolean' | 'Number';
}

export interface EnumOption {
  id: number;
  display: string;
  value: number;
}

export class ParameterService {
  static async getUserParameters(userId: number): Promise<Parameter[]> {
    try {
      const response = await AuthService.getAuthenticatedRequest(
        `${AuthService.API_URL}/users/${userId}/parameters`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch parameters');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching parameters:', error);
      return [];
    }
  }
  
  static async createParameter(userId: number, name: string, type: string): Promise<number | null> {
    try {
      const response = await AuthService.getAuthenticatedRequest(
        `${AuthService.API_URL}/users/${userId}/parameters`,
        'POST',
        {
          name,
          type
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to create parameter');
      }
      
      // If the response doesn't include the ID, we'll need to fetch the parameters and find it
      const parameters = await this.getUserParameters(userId);
      const createdParameter = parameters.find(p => p.name === name);
      return createdParameter?.id || null;
    } catch (error) {
      console.error('Error creating parameter:', error);
      return null;
    }
  }
  
  static async getEnumOptions(userId: number, parameterId: number): Promise<EnumOption[]> {
    try {
      const response = await AuthService.getAuthenticatedRequest(
        `${AuthService.API_URL}/users/${userId}/parameter/${parameterId}/enumtype`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch enum options');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching enum options:', error);
      return [];
    }
  }
  
  static async createEnumOption(userId: number, parameterId: number, display: string): Promise<boolean> {
    try {
      // Get existing options to determine the next value
      const existingOptions = await this.getEnumOptions(userId, parameterId);
      const nextValue = existingOptions.length > 0 
        ? Math.max(...existingOptions.map(option => option.value)) + 1 
        : 1;
        
      const response = await AuthService.getAuthenticatedRequest(
        `${AuthService.API_URL}/users/${userId}/parameter/${parameterId}/enumtype`,
        'POST',
        {
          display,
          value: nextValue
        }
      );
      
      return response.ok;
    } catch (error) {
      console.error('Error creating enum option:', error);
      return false;
    }
  }
  
  static async deleteParameter(userId: number, parameterId: number): Promise<boolean> {
    try {
      const response = await AuthService.getAuthenticatedRequest(
        `${AuthService.API_URL}/users/${userId}/parameter/${parameterId}`,
        'DELETE'
      );
      
      return response.ok;
    } catch (error) {
      console.error('Error deleting parameter:', error);
      return false;
    }
  }
} 