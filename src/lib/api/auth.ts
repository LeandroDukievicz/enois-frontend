import { api } from '../api-client';

export interface SignupInput { name: string; email: string; password: string; }
export interface LoginInput { email: string; password: string; }

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  headline: string;
  email: string;
  avatar?: string | null;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  refreshExpiresAt: string;
  user: AuthUser;
}

export const authApi = {
  signup: (data: SignupInput) => api.post<AuthResponse>('/auth/signup', data),
  login: (data: LoginInput) => api.post<AuthResponse>('/auth/login', data),
  logout: () => api.post<void>('/auth/logout'),
  me: () => api.get<AuthUser>('/auth/me'),
  forgotPassword: (email: string) =>
    api.post<{ status: string }>('/auth/password/forgot', { email }),
};
