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
