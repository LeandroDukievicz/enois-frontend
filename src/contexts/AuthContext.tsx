import { createContext, useContext, useState, type ReactNode } from 'react';
import type { AuthUser } from '../lib/api/auth';

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partial: Partial<AuthUser>) => void;
}

const MOCK_TOKEN = 'mock-session-token';

function mockUser(name: string, email: string): AuthUser {
  return {
    id: '1',
    name,
    email,
    username: email.split('@')[0],
    avatar: null,
    headline: 'Profissional · Conexão',
  };
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('current_user');
      if (!stored) return null;
      const u = JSON.parse(stored) as AuthUser;
      // Migrate avatar to persistent key so it survives logout
      if (u.avatar && u.email && !localStorage.getItem(`avatar_${u.email}`)) {
        try { localStorage.setItem(`avatar_${u.email}`, u.avatar); } catch { /* quota */ }
      }
      return u;
    } catch {
      return null;
    }
  });

  const isAuthenticated = !!localStorage.getItem('session_token') && !!user;

  const login = async (email: string, _password: string) => {
    const u = mockUser(email.split('@')[0], email);
    const saved = localStorage.getItem(`avatar_${email}`);
    if (saved) u.avatar = saved;
    localStorage.setItem('session_token', MOCK_TOKEN);
    localStorage.setItem('refresh_token', MOCK_TOKEN);
    localStorage.setItem('current_user', JSON.stringify(u));
    setUser(u);
  };

  const signup = async (name: string, email: string, _password: string) => {
    const u = mockUser(name, email);
    const saved = localStorage.getItem(`avatar_${email}`);
    if (saved) u.avatar = saved;
    localStorage.setItem('session_token', MOCK_TOKEN);
    localStorage.setItem('refresh_token', MOCK_TOKEN);
    localStorage.setItem('current_user', JSON.stringify(u));
    setUser(u);
  };

  const updateUser = (partial: Partial<AuthUser>) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      localStorage.setItem('current_user', JSON.stringify(updated));
      if ('avatar' in partial) {
        if (partial.avatar) localStorage.setItem(`avatar_${prev.email}`, partial.avatar);
        else localStorage.removeItem(`avatar_${prev.email}`);
      }
      return updated;
    });
  };

  const logout = async () => {
    localStorage.removeItem('session_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
