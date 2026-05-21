import { create } from "zustand";

export const useCart = create((set) => ({

  items: [],

  add: (producto) =>
    set((state) => {

      const existe = state.items.find(
        i => i.id_repuesto === producto.id_repuesto
      );

      // si ya existe → aumentar cantidad
      if (existe) {

        return {
          items: state.items.map(i =>

            i.id_repuesto === producto.id_repuesto
              ? {
                  ...i,
                  cantidad: i.cantidad + 1,
                }
              : i
          ),
        };
      }

      // si no existe → agregar
      return {
        items: [
          ...state.items,
          {
            ...producto,
            cantidad: 1,
          },
        ],
      };
    }),

  disminuir: (id_repuesto) =>
    set((state) => ({

      items: state.items
        .map(i =>

          i.id_repuesto === id_repuesto
            ? {
                ...i,
                cantidad: i.cantidad - 1,
              }
            : i
        )
        .filter(i => i.cantidad > 0),

    })),

  remove: (id_repuesto) =>
    set((state) => ({

      items: state.items.filter(
        i => i.id_repuesto !== id_repuesto
      ),

    })),

  clear: () =>
    set({
      items: [],
    }),

}));