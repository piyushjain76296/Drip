'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';

interface WishlistState {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => {
      const storeState: WishlistState = {
        items: [],

        addItem: (product: Product) => {
          set((state: WishlistState) => {
            if (state.items.find((item: Product) => item.id === product.id)) return state;
            return { items: [...state.items, product] };
          });
        },

        removeItem: (productId: string) => {
          set((state: WishlistState) => ({
            items: state.items.filter((item: Product) => item.id !== productId),
          }));
        },

        toggleItem: (product: Product) => {
          const exists = get().items.find((item: Product) => item.id === product.id);
          if (exists) {
            get().removeItem(product.id);
          } else {
            get().addItem(product);
          }
        },

        isInWishlist: (productId: string) => {
          return get().items.some((item: Product) => item.id === productId);
        },

        clearWishlist: () => set({ items: [] }),
      };
      return storeState;
    },
    {
      name: 'drip-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
