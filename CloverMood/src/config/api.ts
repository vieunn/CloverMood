/**
 * Centralized API Configuration
 * Uses environment variables with fallback to localhost for development
 */

const getApiBaseUrl = (): string => {
  // For Vite, use import.meta.env
  return (import.meta.env.VITE_API_BASE_URL as string) || 'http://localhost:8080/api';
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  
  // Auth endpoints
  AUTH: {
    LOGIN: `${getApiBaseUrl()}/auth/login`,
    REGISTER: `${getApiBaseUrl()}/auth/register`,
  },
  
  // Profile endpoints
  PROFILE: {
    GET: `${getApiBaseUrl()}/profile`,
    UPDATE: `${getApiBaseUrl()}/profile`,
    UPDATE_PASSWORD: `${getApiBaseUrl()}/profile/password`,
    PHOTO: `${getApiBaseUrl()}/profile/photo`,
  },
  
  // Mood endpoints
  MOODS: {
    CREATE: `${getApiBaseUrl()}/moods`,
    CHECK_IN: `${getApiBaseUrl()}/mood/check-in`,
  },
  
  // Statistics endpoints
  STATISTICS: {
    GET: (userId: string) => `${getApiBaseUrl()}/statistics/${userId}`,
  },
  
  // Activity endpoints
  ACTIVITY: {
    HISTORY: `${getApiBaseUrl()}/activity-history`,
  },
};
