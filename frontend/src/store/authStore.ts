import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

const savedToken = localStorage.getItem('token');
const savedUserStr = localStorage.getItem('user');
let initialUser: User | null = null;
if (savedUserStr) {
  try {
    initialUser = JSON.parse(savedUserStr);
  } catch (e) {
    console.error(e);
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: savedToken,
  isAuthenticated: !!savedToken && !!initialUser,
  isAdmin: initialUser?.role === 'ROLE_ADMIN',

  setAuth: (user, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      token,
      isAuthenticated: true,
      isAdmin: user.role === 'ROLE_ADMIN',
    });
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },
}));
