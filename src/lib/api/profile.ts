import { api } from '../api-client';

export interface Profile {
  id: string;
  username: string;
  name: string;
  headline: string | null;
  email: string;
  company: string | null;
  location: string | null;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  skills: string[];
  goals: string[];
  openToWork: boolean;
  isMentor: boolean;
  connectionsCount?: number;
  followersCount?: number;
}

export const profileApi = {
  me: () => api.get<Profile>('/me'),
  get: (username: string) => api.get<Profile>(`/users/${username}`),
  update: (data: Partial<Profile>) => api.patch<Profile>('/me/profile', data),
};
