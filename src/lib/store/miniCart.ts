"use client";

import { create } from "zustand";
import type { Product } from "@/types";

interface MiniCartStore {
  isOpen: boolean;
  product: Product | null;
  quantity: number;
  open: (product: Product, quantity: number) => void;
  close: () => void;
}

export const useMiniCartStore = create<MiniCartStore>((set) => ({
  isOpen: false,
  product: null,
  quantity: 1,
  open: (product, quantity) => set({ isOpen: true, product, quantity }),
  close: () => set({ isOpen: false }),
}));
