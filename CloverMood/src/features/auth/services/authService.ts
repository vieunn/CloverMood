import type { LoginCredentials, RegisterCredentials, AuthResponse } from '../types';
import { API_CONFIG } from '../../../config/api';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(API_CONFIG.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || `HTTP Error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to login',
      };
    }
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(API_CONFIG.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.message || `HTTP Error: ${response.status}`,
        };
      }
      
      return await response.json();
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to register',
      };
    }
  },

  logout: (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('user');
  },

  getToken: (): string | null => {
    return localStorage.getItem('authToken');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  },
};
