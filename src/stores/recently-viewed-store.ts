'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';

interface RecentlyViewedState {
  items: Product[];
  addItem: (product: Product) => void;
  clearAll: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (product) => {
        set((state) => {
          const filtered = state.items.filter((item) => item.id !== product.id);
          return { items: [product, ...filtered].slice(0, 20) };
        });
      },

      clearAll: () => set({ items: [] }),
    }),
    {
      name: 'drip-recently-viewed',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
