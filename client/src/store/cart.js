// client/src/store/cart.js
// RF4 FIX: único store de carrito — useUIStore.js debe eliminarse
import { create } from "zustand";

export const useCart = create((set, get) => ({
  items: [],

  // RF4 FIX: add() agrega respetando la cantidad recibida
  // No llamar add() en un loop — pasar cantidad directamente
  add: (producto) => {
    const items = get().items;
    const existe = items.find(i => i.id_repuesto === producto.id_repuesto);

    if (existe) {
      set({
        items: items.map(i =>
          i.id_repuesto === producto.id_repuesto
            ? { ...i, cantidad: i.cantidad + (producto.cantidad || 1) }
            : i
        ),
      });
    } else {
      set({
        items: [...items, { ...producto, cantidad: producto.cantidad || 1 }],
      });
    }
  },

  decrease: (id_repuesto) => {
    const items = get().items;
    const item = items.find(i => i.id_repuesto === id_repuesto);
    if (!item) return;

    if (item.cantidad <= 1) {
      set({ items: items.filter(i => i.id_repuesto !== id_repuesto) });
      return;
    }
    set({
      items: items.map(i =>
        i.id_repuesto === id_repuesto ? { ...i, cantidad: i.cantidad - 1 } : i
      ),
    });
  },

  remove: (id_repuesto) => {
    set({ items: get().items.filter(i => i.id_repuesto !== id_repuesto) });
  },

  clear: () => set({ items: [] }),
}));