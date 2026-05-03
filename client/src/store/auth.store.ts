import { create } from 'zustand';
import { userApi } from '@/api/user.api';
import { clearTokens, getAccessToken, setTokens } from '@/utils/token';
import type { AuthTokens, UserProfile } from '@/types';

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens, user: UserProfile) => void;
  logout: () => void;
  setUser: (user: UserProfile) => void;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: (tokens, user) => {
    setTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),

  hydrate: async () => {
    if (!getAccessToken()) {
      set({ isLoading: false });
      return;
    }
    try {
      const { data } = await userApi.getMe();
      set({ user: data.data, isAuthenticated: true });
    } catch {
      clearTokens();
    } finally {
      set({ isLoading: false });
    }
  },
}));
