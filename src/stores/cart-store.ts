'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/types';
import { api } from '@/lib/api';
import { useAuthStore } from './auth-store';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product, size: string, color: string, quantity?: number) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
  syncCart: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size, color, quantity = 1) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) => item.product.id === product.id && item.size === size && item.color === color
          );

          let newItems;
          if (existingIndex > -1) {
            newItems = [...state.items];
            newItems[existingIndex] = {
              ...newItems[existingIndex],
              quantity: newItems[existingIndex].quantity + quantity,
            };
          } else {
            newItems = [...state.items, { product, quantity, size, color }];
          }
          
          // Background sync
          useAuthStore.getState().getToken().then(token => {
            if (token) api.cart.add({ productId: product.id, quantity, size, color }, token).catch(() => {});
          });

          return { items: newItems, isOpen: true };
        });
      },

      removeItem: (productId, size, color) => {
        set((state) => {
          // Background sync
          useAuthStore.getState().getToken().then((token) => {
            if (token) api.cart.remove(productId, size, color, token).catch(() => {});
          });

          return {
            items: state.items.filter(
              (item) => !(item.product.id === productId && item.size === size && item.color === color)
            ),
          };
        });
      },

      updateQuantity: (productId, size, color, quantity) => {
        set((state) => {
          // Background sync
          useAuthStore.getState().getToken().then((token) => {
            if (token) api.cart.update(productId, size, color, quantity, token).catch(() => {});
          });

          return {
            items: state.items.map((item) =>
              item.product.id === productId && item.size === size && item.color === color
                ? { ...item, quantity: Math.max(1, quantity) }
                : item
            ),
          };
        });
      },

      clearCart: () => {
        set({ items: [] });
        void useAuthStore
          .getState()
          .getToken()
          .then((token) => {
            if (token) api.cart.clear(token).catch(() => {});
          });
      },
      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),

      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
        
      syncCart: async () => {
        const token = await useAuthStore.getState().getToken();
        if (!token) return;
        try {
          const serverCart = await api.cart.get(token);
          if (!serverCart || !Array.isArray(serverCart)) return;

          const localItems = get().items;

          // Guest bag → first authenticated visit: push local lines up so checkout/cart stay coherent
          if (serverCart.length === 0 && localItems.length > 0) {
            await Promise.all(
              localItems.map((row) =>
                api.cart.add(
                  { productId: row.product.id, quantity: row.quantity, size: row.size, color: row.color },
                  token
                )
              )
            );
            return;
          }

          if (serverCart.length > 0) {
            const items = serverCart.map((item: any) => ({
              product: item.product,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
            }));
            set({ items });
          }
        } catch (error) {
          console.error('Failed to sync cart', error);
        }
      },
    }),
    {
      name: 'drip-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
