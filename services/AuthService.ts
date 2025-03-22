import AsyncStorage from '@react-native-async-storage/async-storage';

// For iOS simulator
// const API_URL = 'http://127.0.0.1:8000';
// For Android emulator, use: 'http://10.0.2.2:8000'
// For physical device with ADB reverse port mapping, use localhost
// Otherwise, use your computer's actual IP address on the same network
// Example: 'http://192.168.1.5:8000'
const API_URL = 'http://localhost:8000';

export interface User {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
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

export class AuthService {
  static async register(data: RegisterData): Promise<void> {
    try {
      console.log('Registering user:', data);
      console.log('API URL:', `${API_URL}/register`);
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
      console.error('Registration error:', error);
      throw error;
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
      
      return tokens;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    await AsyncStorage.removeItem('auth_tokens');
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