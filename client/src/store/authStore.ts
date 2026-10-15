import { create } from 'zustand';

interface AuthStore {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: localStorage.getItem('orbitaurus_token'),
  setToken: (token) => {
    if (token) localStorage.setItem('orbitaurus_token', token);
    else localStorage.removeItem('orbitaurus_token');
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('orbitaurus_token');
    set({ token: null });
  },
}));
