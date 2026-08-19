"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: string;
  quantity: number;
  stock?: number | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (productId: string, quantity?: number, stock?: number | null) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  syncStock: (products: Record<string, number | null>) => void;
}

const MAX_QUANTITY = 99;

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (productId, quantity = 1, stock = null) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === productId);
          if (existing) {
            const maxQty = existing.stock != null ? Math.min(existing.stock, MAX_QUANTITY) : MAX_QUANTITY;
            const newQty = Math.min(existing.quantity + quantity, maxQty);
            return {
              items: state.items.map((i) =>
                i.productId === productId
                  ? { ...i, quantity: newQty, stock: existing.stock ?? stock }
                  : i,
              ),
            };
          }
          const maxQty = stock != null ? Math.min(stock, MAX_QUANTITY) : MAX_QUANTITY;
          const safeQty = Math.min(quantity, maxQty);
          return { items: [...state.items, { productId, quantity: safeQty, stock }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId !== productId) return i;
            const maxQty = i.stock != null ? Math.min(i.stock, MAX_QUANTITY) : MAX_QUANTITY;
            return { ...i, quantity: Math.min(quantity, maxQty) };
          }),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      syncStock: (products) => {
        set((state) => ({
          items: state.items.map((item) => {
            const stock = products[item.productId];
            if (stock === undefined) return item;
            const maxQty = stock != null ? Math.min(stock, MAX_QUANTITY) : MAX_QUANTITY;
            return {
              ...item,
              stock,
              quantity: Math.min(item.quantity, maxQty),
            };
          }),
        }));
      },
    }),
    {
      name: "spice-cart",
    },
  ),
);
