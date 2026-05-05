import { authService } from "../features/auth/services/authService";
import { getAuthHeaders } from "../shared/utils/api";
import { API_CONFIG } from "../config/api";

export interface ProfileData {
  email: string;
  fullName: string;
  gender: string;
  hasPhoto?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export const profileService = {
  getProfile: async (email: string): Promise<ApiResponse<ProfileData>> => {
    try {
      const response = await fetch(
        `${API_CONFIG.PROFILE.GET}?email=${encodeURIComponent(email)}`,
        { headers: getAuthHeaders() }
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch profile",
      };
    }
  },

  updateProfile: async (profile: ProfileData): Promise<ApiResponse<ProfileData>> => {
    try {
      const response = await fetch(`${API_CONFIG.PROFILE.UPDATE}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(profile),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to update profile",
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
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ email, currentPassword, newPassword }),
      });
      return await response.json();
    } catch (error) {
      return {
        success: false,
        message: "Failed to update password",
      };
    }
  },

  uploadPhoto: async (
    email: string,
    file: File
  ): Promise<ApiResponse<null>> => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = authService.getToken();
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_CONFIG.PROFILE.PHOTO}?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: responseData.message || responseData.error || `Upload failed (${response.status})`,
        };
      }

      return {
        success: responseData.success !== false,
        message: responseData.message || "Photo uploaded successfully",
        data: responseData.data,
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to upload photo. Please try again.",
      };
    }
  },

  getProfilePhoto: async (email: string): Promise<{ success: boolean; hasPhoto: boolean; image?: string }> => {
    try {
      const response = await fetch(
        `${API_CONFIG.PROFILE.PHOTO}?email=${encodeURIComponent(email)}`,
        { headers: getAuthHeaders() }
      );
      return await response.json();
    } catch (error) {
      return {
        success: false,
        hasPhoto: false,
      };
    }
  },
};
