import { create } from "zustand";

export const useCart = create(set => ({
  items: [],

  add: (item) =>
    set(state => ({
      items: [...state.items, item],
    })),

  clear: () => set({ items: [] }),
}));