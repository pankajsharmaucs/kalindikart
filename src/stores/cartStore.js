import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      cartCount: 0,          // NEW: total quantity
      isLoggedIn: false,
      userId: null,
      hasHydrated: false,
      hasSyncedGuestCart: false,

      // ----------------------
      // Auth / Login
      // ----------------------
      setAuth: (loggedIn, id) => {
        set({ isLoggedIn: loggedIn, userId: id });
        if (loggedIn && id) {
          get().fetchCartFromDB(id).then(() => {
            if (!get().hasSyncedGuestCart) get().syncLocalCartToDB();
            get().fetchCartCount(id);  // <-- fetch count from DB
          });
        }
      },

      logout: () => {
        set({
          isLoggedIn: false,
          userId: null,
          cartItems: [],
          cartCount: 0,
          hasSyncedGuestCart: false,
        });
      },

      // ----------------------
      // Cart Actions
      // ----------------------
      addToCart: async (product) => {
        const { cartItems, isLoggedIn, userId } = get();
        const productId = product.id;
        let images = [];

        if (Array.isArray(product.images)) images = product.images;
        else if (typeof product.images === 'string') {
          try {
            const parsed = JSON.parse(product.images);
            images = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            images = [product.images];
          }
        }

        const existing = cartItems.find((item) => item.product_id === productId);

        if (isLoggedIn && userId) {
          try {
            const res = await fetch('/api/cart', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                product: {
                  product_id: productId,
                  quantity: existing ? existing.quantity + 1 : 1,
                  price: product.price,
                  title: product.title,
                  images,
                },
              }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message || 'Failed to add to DB cart');
          } catch (err) {
            console.error('DB Add to Cart failed:', err);
            return;
          }
        }

        // Update Zustand state
        set((state) => {
          let newCart;
          if (existing) {
            newCart = state.cartItems.map((item) =>
              item.product_id === productId
                ? { ...item, quantity: item.quantity + 1 }
                : item
            );
          } else {
            newCart = [
              ...state.cartItems,
              { product_id: productId, quantity: 1, title: product.title, price: product.price, images },
            ];
          }
          const newCount = newCart.reduce((sum, i) => sum + i.quantity, 0);
          return { cartItems: newCart, cartCount: newCount }; // update count
        });
      },

      removeFromCart: (productId) =>
        set((state) => {
          const newCart = state.cartItems.filter((item) => item.product_id !== productId);
          const newCount = newCart.reduce((sum, i) => sum + i.quantity, 0);
          return { cartItems: newCart, cartCount: newCount };
        }),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          const newCart = state.cartItems.map((item) =>
            item.product_id === productId ? { ...item, quantity } : item
          );
          const newCount = newCart.reduce((sum, i) => sum + i.quantity, 0);
          return { cartItems: newCart, cartCount: newCount };
        }),

      clearCart: () => set({ cartItems: [], cartCount: 0 }),

      // ----------------------
      // Cart Info
      // ----------------------
      getCartCount: () => get().cartCount,
      getCartTotal: () =>
        get().cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),

      fetchCartCount: async (userId) => {
        if (!userId) return;
        try {
          const res = await fetch(`/api/cart/count?userId=${userId}`);
          const data = await res.json();
          if (data.success) set({ cartCount: data.count || 0 });
        } catch (err) {
          console.error('Failed to fetch cart count:', err);
        }
      },

      // ----------------------
      // Guest Cart Sync
      // ----------------------
      syncLocalCartToDB: async () => {
        const { cartItems, userId, hasSyncedGuestCart } = get();
        if (!userId || !cartItems.length || hasSyncedGuestCart) return;

        try {
          await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, cartItems }),
          });
          set({ hasSyncedGuestCart: true });
          get().fetchCartCount(userId); // update count after sync
        } catch (err) {
          console.error('Cart sync failed:', err);
        }
      },

      fetchCartFromDB: async (userId) => {
        try {
          const res = await fetch(`/api/cart?userId=${userId}`);
          const data = await res.json();
          if (data.success && Array.isArray(data.cartItems)) {
            set({ cartItems: data.cartItems, cartCount: data.cartItems.reduce((sum, i) => sum + i.quantity, 0) });
          } else {
            set({ cartItems: [], cartCount: 0 });
          }
        } catch (err) {
          console.error('Failed to fetch cart:', err);
        }
      },
    }),
    {
      name: 'guest-cart',
      partialize: (state) => ({
        cartItems: state.cartItems,
        cartCount: state.cartCount,
        isLoggedIn: state.isLoggedIn,
        userId: state.userId,
        hasSyncedGuestCart: state.hasSyncedGuestCart,
      }),
      onRehydrateStorage: () => (state) => {
        state.hasHydrated = true;
      },
    }
  )
);
