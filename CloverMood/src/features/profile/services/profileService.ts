import type { ProfileData, ApiResponse } from '../types';

export type { ProfileData, ApiResponse };

const API_BASE_URL = 'http://localhost:8080/api';

export const profileService = {
  getProfile: async (email: string): Promise<ApiResponse<ProfileData>> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/profile?email=${encodeURIComponent(email)}`
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch profile',
      };
    }
  },

  updateProfile: async (profile: ProfileData): Promise<ApiResponse<ProfileData>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update profile',
      };
    }
  },

  updatePassword: async (
    email: string,
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<null>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to update password',
      };
    }
  },

  getProfilePhoto: async (email: string): Promise<{ success: boolean; image?: string; message?: string }> => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/profile/photo?email=${encodeURIComponent(email)}`
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to fetch profile photo',
      };
    }
  },

  uploadPhoto: async (email: string, file: File): Promise<ApiResponse<null>> => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/profile/photo`, {
        method: 'POST',
        body: formData,
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: 'Failed to upload photo',
      };
    }
  },
};
