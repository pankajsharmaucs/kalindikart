// app/stores/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [], // Array of { product_id, quantity, title, price, images }
      isLoggedIn: false,
      userId: null,
      cartCount: 0,

      setAuth: (loggedIn, id) => set({ isLoggedIn: loggedIn, userId: id }),

      fetchCart: async () => {
        const { isLoggedIn, userId } = get();
        if (isLoggedIn && userId) {
          try {
            const res = await fetch(`/api/cart?user_id=${userId}`);
            if (!res.ok) throw new Error('Failed to fetch cart');
            const data = await res.json();
            set({ cartItems: data });
          } catch (error) {
            console.error(error);
            set({ cartItems: [] });
          }
        }
      },

      addToCart: async (product) => {
        const { isLoggedIn, userId, cartItems } = get();
        const productId = product.id;
        const payload = {
          product_id: productId,
          quantity: 1,
          title: product.title,
          price: product.price,
          images: product.images,
        };

        if (isLoggedIn && userId) {
          // API call for logged-in
          try {
            const existing = cartItems.find((item) => item.product_id === productId);
            const quantityToAdd = existing ? 1 : 1; // Increment by 1 if exists
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ user_id: userId, product_id: productId, quantity: quantityToAdd }),
            });
            await get().fetchCart(); // Refresh from DB
          } catch (error) {
            console.error('Failed to add to cart via API:', error);
          }
        } else {
          // Guest: Update local state
          set((state) => {
            const existing = state.cartItems.find((item) => item.product_id === productId);
            let updatedItems;
            if (existing) {
              updatedItems = state.cartItems.map((item) =>
                item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item
              );
            } else {
              updatedItems = [...state.cartItems, { ...payload, quantity: 1 }];
            }
            return { cartItems: updatedItems };
          });
        }
      },

      isInCart: (productId) => {
        const { cartItems } = get();
        return cartItems.some((item) => item.product_id === productId);
      },

      syncLocalToDB: async () => {
        const { isLoggedIn, userId, cartItems } = get();
        if (!isLoggedIn || !userId || cartItems.length === 0) return;

        try {
          for (const item of cartItems) {
            await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user_id: userId,
                product_id: item.product_id,
                quantity: item.quantity,
              }),
            });
          }
          // Clear local and refresh from DB
          set({ cartItems: [] }); // Temporarily clear to avoid dupes
          await get().fetchCart();
        } catch (error) {
          console.error('Failed to sync cart:', error);
        }
      },

      updateCartCount: () => {
        const { cartItems } = get();
        set({ cartCount: cartItems.reduce((sum, item) => sum + item.quantity, 0) });
      },
    }),
    {
      name: 'guest-cart', // Key for localStorage (only persists for guests)
      partialize: (state) => ({ cartItems: state.cartItems }), // Only persist cartItems
      onRehydrateStorage: () => (state) => {
        if (state) state.updateCartCount();
      },
      // Don't persist if logged in
      skipHydration: (state) => state.isLoggedIn,
    }
  )
);

// Subscribe to changes for cartCount
useCartStore.subscribe((state) => state.updateCartCount());