import { authService } from '../../features/auth/services/authService';

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

/**
 * Get authorization headers with JWT token
 */
export const getAuthHeaders = (): Record<string, string> => {
  const token = authService.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

/**
 * Create a fetch request with authorization headers
 */
export const authorizedFetch = (
  url: string,
  options?: FetchOptions
): Promise<Response> => {
  const headers = {
    ...getAuthHeaders(),
    ...options?.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
};
