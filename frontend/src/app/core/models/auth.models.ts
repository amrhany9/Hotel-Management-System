export interface AuthResponse {
  token: string;
  userId: number;
  fullName: string;
  email: string;
}

export interface UserInfo {
  userId: number;
  email: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}
