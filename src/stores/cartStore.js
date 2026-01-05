// app/stores/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // Guest login flags
      isLoggedIn: false,
      userId: null,

      setAuth: (loggedIn, id) => set({ isLoggedIn: loggedIn, userId: id }),

      addToCart: (product) => {
        const productId = product.id;

        // Normalize images to always be an array
        let images = [];
        if (Array.isArray(product.images)) {
          images = product.images;
        } else if (typeof product.images === 'string') {
          try {
            images = JSON.parse(product.images);
            if (!Array.isArray(images)) images = [images];
          } catch {
            images = [product.images];
          }
        } else if (product.images) {
          images = [product.images];
        }

        set((state) => {
          const existing = state.cartItems.find((item) => item.product_id === productId);
          let updatedItems;
          if (existing) {
            updatedItems = state.cartItems.map((item) =>
              item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item
            );
          } else {
            updatedItems = [
              ...state.cartItems,
              {
                product_id: productId,
                quantity: 1,
                title: product.title,
                price: product.price,
                images, // always array
              },
            ];
          }
          return { cartItems: updatedItems };
        });
      },

      removeFromCart: (productId) => {
        set((state) => ({
          cartItems: state.cartItems.filter((item) => item.product_id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      isInCart: (productId) => {
        return get().cartItems.some((item) => item.product_id === productId);
      },

      getCartCount: () => {
        return get().cartItems.reduce((sum, item) => sum + item.quantity, 0);
      },

      getCartTotal: () => {
        return get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },
    }),
    {
      name: 'guest-cart', // Persist in localStorage
      partialize: (state) => ({ cartItems: state.cartItems }),
    }
  )
);
