// // src/stores/cartStore.js
// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';

// export const useCartStore = create(
//   persist(
//     (set, get) => ({
//       cartItems: [],

//       // Auth state
//       isLoggedIn: false,
//       userId: null, // mobile number as user_id

//       /* ---------------- AUTH ---------------- */
//       setAuth: (loggedIn, id) => {
//         set({ isLoggedIn: loggedIn, userId: id });
//         if (loggedIn && id) {
//           // Fetch cart from DB on login
//           get().fetchCartFromDB(id);
//         }
//       },

//       /* ---------------- CART ACTIONS ---------------- */
//       addToCart: (product) => {
//         const productId = product.id;

//         // Normalize images to array
//         let images = [];
//         if (Array.isArray(product.images)) {
//           images = product.images;
//         } else if (typeof product.images === 'string') {
//           try {
//             const parsed = JSON.parse(product.images);
//             images = Array.isArray(parsed) ? parsed : [parsed];
//           } catch {
//             images = [product.images];
//           }
//         } else if (product.images) {
//           images = [product.images];
//         }

//         set((state) => {
//           const existing = state.cartItems.find(
//             (item) => item.product_id === productId
//           );

//           if (existing) {
//             return {
//               cartItems: state.cartItems.map((item) =>
//                 item.product_id === productId
//                   ? { ...item, quantity: item.quantity + 1 }
//                   : item
//               ),
//             };
//           }

//           return {
//             cartItems: [
//               ...state.cartItems,
//               {
//                 product_id: productId,
//                 quantity: 1,
//                 title: product.title,
//                 price: product.price,
//                 images,
//               },
//             ],
//           };
//         });
//       },

//       removeFromCart: (productId) =>
//         set((state) => ({
//           cartItems: state.cartItems.filter(
//             (item) => item.product_id !== productId
//           ),
//         })),

//       updateQuantity: (productId, quantity) =>
//         set((state) => ({
//           cartItems: state.cartItems.map((item) =>
//             item.product_id === productId
//               ? { ...item, quantity }
//               : item
//           ),
//         })),

//       clearCart: () => set({ cartItems: [] }),

//       /* ---------------- HELPERS ---------------- */
//       isInCart: (productId) =>
//         get().cartItems.some((item) => item.product_id === productId),

//       getCartCount: () =>
//         get().cartItems.reduce((sum, item) => sum + item.quantity, 0),

//       getCartTotal: () =>
//         get().cartItems.reduce(
//           (sum, item) => sum + item.price * item.quantity,
//           0
//         ),

//       /* ---------------- SYNC LOCAL → DB ---------------- */
//       syncLocalCartToDB: async () => {
//         const { cartItems, userId, clearCart } = get();

//         if (!userId || !cartItems.length) return;

//         try {
//           const res = await fetch('/api/cart/sync', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({
//               userId,
//               cartItems,
//             }),
//           });

//           const data = await res.json();

//           if (data.success) {
//             clearCart(); // remove localStorage cart
//           }
//         } catch (err) {
//           console.error('Cart sync failed:', err);
//         }
//       },

//       /* ---------------- FETCH CART FROM DB ---------------- */
//       fetchCartFromDB: async (userId) => {
//         if (!userId) return;

//         try {
//           const res = await fetch(`/api/cart?userId=${userId}`);
//           const data = await res.json();
//           if (data.success && Array.isArray(data.cartItems)) {
//             set({ cartItems: data.cartItems });
//           }
//         } catch (err) {
//           console.error('Failed to fetch cart from DB:', err);
//         }
//       },
//     }),
//     {
//       name: 'guest-cart',
//       partialize: (state) => ({
//         cartItems: state.cartItems, // ONLY cart persists
//       }),
//     }
//   )
// );


// src/stores/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],

      // Auth state
      isLoggedIn: false,
      userId: null, // mobile number as user_id

      /* ---------------- AUTH ---------------- */
      setAuth: (loggedIn, id) => {
        set({ isLoggedIn: loggedIn, userId: id });

        if (loggedIn && id) {
          // ✅ Logged in → fetch DB cart
          get().fetchCartFromDB(id);
        } else {
          // ✅ Logged out / guest → keep local cart
          get().loadLocalCart();
        }
      },

      /* ---------------- LOCAL CART (NEW – ADD ONLY) ---------------- */
      loadLocalCart: () => {
        const localCart =
          JSON.parse(localStorage.getItem('guest-cart'))?.state?.cartItems || [];
        set({ cartItems: localCart });
      },

      /* ---------------- CART ACTIONS ---------------- */
      addToCart: (product) => {
        const productId = product.id;

        // Normalize images to array
        let images = [];
        if (Array.isArray(product.images)) {
          images = product.images;
        } else if (typeof product.images === 'string') {
          try {
            const parsed = JSON.parse(product.images);
            images = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            images = [product.images];
          }
        } else if (product.images) {
          images = [product.images];
        }

        set((state) => {
          const existing = state.cartItems.find(
            (item) => item.product_id === productId
          );

          if (existing) {
            return {
              cartItems: state.cartItems.map((item) =>
                item.product_id === productId
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }

          return {
            cartItems: [
              ...state.cartItems,
              {
                product_id: productId,
                quantity: 1,
                title: product.title,
                price: product.price,
                images,
              },
            ],
          };
        });
      },

      removeFromCart: (productId) =>
        set((state) => ({
          cartItems: state.cartItems.filter(
            (item) => item.product_id !== productId
          ),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          cartItems: state.cartItems.map((item) =>
            item.product_id === productId
              ? { ...item, quantity }
              : item
          ),
        })),

      clearCart: () => set({ cartItems: [] }),

      /* ---------------- HELPERS ---------------- */
      isInCart: (productId) =>
        get().cartItems.some((item) => item.product_id === productId),

      getCartCount: () =>
        get().cartItems.reduce((sum, item) => sum + item.quantity, 0),

      getCartTotal: () =>
        get().cartItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        ),

      /* ---------------- SYNC LOCAL → DB ---------------- */
      syncLocalCartToDB: async () => {
        const { cartItems, userId, clearCart } = get();

        if (!userId || !cartItems.length) return;

        try {
          const res = await fetch('/api/cart/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              cartItems,
            }),
          });

          const data = await res.json();

          if (data.success) {
            clearCart(); // clear local after successful sync
          }
        } catch (err) {
          console.error('Cart sync failed:', err);
        }
      },

      /* ---------------- FETCH CART FROM DB ---------------- */
      fetchCartFromDB: async (userId) => {
        if (!userId) return;

        try {
          const res = await fetch(`/api/cart?userId=${userId}`);
          const data = await res.json();

          if (data.success && Array.isArray(data.cartItems)) {
            set({ cartItems: data.cartItems });
          }
        } catch (err) {
          console.error('Failed to fetch cart from DB:', err);
        }
      },
    }),
    {
      name: 'guest-cart',
      partialize: (state) => ({
        cartItems: state.cartItems, // persist only cart
      }),
    }
  )
);
