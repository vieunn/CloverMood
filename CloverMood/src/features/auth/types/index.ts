export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
}

export interface User {
  email: string;
  firstName?: string;
  lastName?: string;
}
