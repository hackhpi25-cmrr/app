import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Network configuration
type NetworkConfig = {
  // Default API URL
  apiUrl: string;
  // If true, use port forwarding (localhost)
  usePortForwarding: boolean;
};


// Make API_URL a static property of AuthService
export const API_URL = 'http://20.3.255.186:80';

export interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  id?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface RegisterData {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export class AuthService {
  static readonly API_URL = API_URL;
  
  static async register(data: RegisterData): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }
    } catch (error) {
      throw error;
    }
  }

  static async getUserByCredentials(username: string, password: string): Promise<number | null> {
    try {
      // Try to login to get user info
      const loginData: LoginData = { username, password };
      const tokens = await this.login(loginData);
      
      // Now use the token to get user info
      const response = await fetch(`${API_URL}/amiauth`, {
        headers: {
          'Authorization': `Bearer ${tokens.access}`,
        },
      });
      
      if (response.ok) {
        // We don't have a direct endpoint to get the user ID, so we'll use the auth token info
        const userProfile = await this.getAuthenticatedRequest(`${API_URL}/profile`);
        if (userProfile.ok) {
          const data = await userProfile.json();
          return data.id || null;
        }
      }
      
      return null;
    } catch (error) {
      return null;
    }
  }

  static async login(data: LoginData): Promise<AuthTokens> {
    try {
      const response = await fetch(`${API_URL}/api/token/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const tokens = await response.json();
      
      // Store the tokens
      await this.storeTokens(tokens);
      
      // Try to get and store the user ID
      await this.storeCurrentUserId(data.username);
      
      return tokens;
    } catch (error) {
      throw error;
    }
  }

  static async storeCurrentUserId(username: string): Promise<void> {
    try {
      const usersResponse = await this.getAuthenticatedRequest(`${API_URL}/users`);
      
      if (usersResponse.ok) {
        const user = await usersResponse.json();
        if (user && user.id) {
          await AsyncStorage.setItem('user_id', user.id.toString());
        } else {
          throw new Error('User ID not found in response');
        }
      } else {
        throw new Error('Failed to retrieve user data');
      }
    } catch (error) {
      // Just rethrow the error without fallback
      throw error;
    }
  }

  static async getCurrentUserId(): Promise<number | null> {
    try {
      const userIdStr = await AsyncStorage.getItem('user_id');
      return userIdStr ? parseInt(userIdStr, 10) : null;
    } catch (error) {
      return null;
    }
  }

  static async refreshUserId(): Promise<number | null> {
    try {
      const tokens = await this.getTokens();
      if (!tokens) {
        return null;
      }
      
      const username = await this.getUsername();
      if (username) {
        await this.storeCurrentUserId(username);
      }
      
      return this.getCurrentUserId();
    } catch (error) {
      return null;
    }
  }
  
  // Helper method to get username from stored token or profile
  static async getUsername(): Promise<string | null> {
    try {
      const usersResponse = await this.getAuthenticatedRequest(`${API_URL}/users`);
      if (usersResponse.ok) {
        const userData = await usersResponse.json();
        return userData.username || null;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_tokens');
    await AsyncStorage.removeItem('user_id');
  }

  static async storeTokens(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.setItem('auth_tokens', JSON.stringify(tokens));
  }

  static async getTokens(): Promise<AuthTokens | null> {
    const tokens = await AsyncStorage.getItem('auth_tokens');
    return tokens ? JSON.parse(tokens) : null;
  }

  static async isAuthenticated(): Promise<boolean> {
    const tokens = await this.getTokens();
    return !!tokens;
  }

  static async getAuthenticatedRequest(url: string, method: string = 'GET', body?: any): Promise<Response> {
    const tokens = await this.getTokens();
    
    if (!tokens) {
      throw new Error('Not authenticated');
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${tokens.access}`,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    return fetch(url, options);
  }

  static async checkAuth(): Promise<boolean> {
    try {
      const response = await this.getAuthenticatedRequest(`${API_URL}/amiauth`);
      return response.ok;
    } catch (error) {
      return false;
    }
  }
} 