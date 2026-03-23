import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Inventory, Note } from '../types';

interface AppState {
  user: User | null;
  token: string | null;
  currentInventory: Inventory | null;
  recentInventory: Inventory | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setCurrentInventory: (inventory: Inventory | null) => void;
  setRecentInventory: (inventory: Inventory | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      currentInventory: null,
      recentInventory: null,
      
      setUser: (user) => set({ user }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token });
      },
      setCurrentInventory: (inventory) => set({ currentInventory: inventory }),
      setRecentInventory: (inventory) => set({ recentInventory: inventory }),
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, currentInventory: null, recentInventory: null });
      },
    }),
    {
      name: 'dongxi-storage',
      partialize: (state) => ({ token: state.token, recentInventory: state.recentInventory }),
    }
  )
);
