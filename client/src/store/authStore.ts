import { create } from 'zustand';
import type { User, AuthResponse } from '@/types/auth';

const TOKEN_KEY = 'docmirror_token';

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;

  setAuth: (data: AuthResponse) => void;
  setToken: (token: string) => void;
  logout: () => void;
  loadUser: () => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  isLoading: false,

  setAuth: ({ token, user }) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token, user });
  },

  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token);
    set({ token });
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ token: null, user: null });
  },

  loadUser: async () => {
    const token = get().token;
    if (!token) return false;

    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        get().logout();
        return false;
      }
      const data = await res.json();
      set({ user: data.user, isLoading: false });
      return true;
    } catch {
      get().logout();
      set({ isLoading: false });
      return false;
    }
  },

  register: async (name, email, password) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Registration failed');
    get().setAuth(data as AuthResponse);
  },

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? 'Login failed');
    get().setAuth(data as AuthResponse);
  },
}));

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

/** Base URL for full-page redirects (Google OAuth). Empty = same origin. */
export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL ?? '';
}
