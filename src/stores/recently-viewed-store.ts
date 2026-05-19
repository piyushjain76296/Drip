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
    (set: any) => ({
      items: [],

      addItem: (product: Product) => {
        set((state: RecentlyViewedState) => {
          const filtered = state.items.filter((item: Product) => item.id !== product.id);
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
