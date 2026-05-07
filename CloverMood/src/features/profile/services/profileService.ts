import type { ProfileData, ApiResponse } from '../types';
import { authService } from '../../auth/services/authService';
import { getAuthHeaders } from '../../../shared/utils/api';
import { API_CONFIG } from '../../../config/api';

export type { ProfileData, ApiResponse };

export const profileService = {
  getProfile: async (email: string): Promise<ApiResponse<ProfileData>> => {
    try {
      const response = await fetch(
        `${API_CONFIG.PROFILE.GET}?email=${encodeURIComponent(email)}`,
        { headers: getAuthHeaders(), credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch profile',
      };
    }
  },

  updateProfile: async (profile: ProfileData): Promise<ApiResponse<ProfileData>> => {
    try {
      const response = await fetch(`${API_CONFIG.PROFILE.UPDATE}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update profile',
      };
    }
  },

  updatePassword: async (
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_CONFIG.PROFILE.UPDATE_PASSWORD}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Update password error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update password',
      };
    }
  },

  getProfilePhoto: async (email: string): Promise<{ success: boolean; image?: string; message?: string }> => {
    try {
      const response = await fetch(
        `${API_CONFIG.PROFILE.PHOTO}?email=${encodeURIComponent(email)}`,
        { headers: getAuthHeaders(), credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Get profile photo error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch profile photo',
      };
    }
  },

  uploadPhoto: async (email: string, file: File): Promise<ApiResponse<null>> => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file);

      const token = authService.getToken();
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.PROFILE.PHOTO}`, {
        method: 'POST',
        headers,
        credentials: 'include',
        body: formData,
      });
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Upload photo error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload photo',
      };
    }
  },
};
