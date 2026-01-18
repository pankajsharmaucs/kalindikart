'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useRouter } from 'next/navigation';
import '../../app/globals.css';

export default function CartPage() {
  const router = useRouter();

  // Local cart store for guests
  const guestCartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const isLoggedIn = useCartStore((state) => state.isLoggedIn);

  // State to hold cart for logged-in users
  const [cartItems, setCartItems] = useState([]);

  // Fetch cart from DB if user is logged in
  useEffect(() => {
    const fetchCart = async () => {
      if (!isLoggedIn) {
        setCartItems(guestCartItems);
        return;
      }

      const userMobile = localStorage.getItem('userMobile');
      if (!userMobile) return;

      try {
        const res = await fetch(`/api/cart?userId=${userMobile}`);
        const data = await res.json();

        if (data.success && Array.isArray(data.cartItems)) {
          setCartItems(data.cartItems);
        } else {
          setCartItems([]);
        }
      } catch (err) {
        console.error('Error fetching DB cart:', err);
        setCartItems([]);
      }
    };

    fetchCart();
  }, [isLoggedIn, guestCartItems]);

  // Remove item handler
  const handleRemove = (product_id) => {
    if (isLoggedIn) {
      const userMobile = localStorage.getItem('userMobile');
      fetch('/api/cart/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userMobile, productId: product_id }),
      }).then(() => setCartItems(cartItems.filter(item => item.product_id !== product_id)));
    } else {
      removeFromCart(product_id);
      setCartItems(guestCartItems);
    }
  };

  // Update quantity handler
  const handleUpdateQuantity = (product_id, quantity) => {
    if (quantity <= 0) return;

    if (isLoggedIn) {
      const userMobile = localStorage.getItem('userMobile');
      fetch('/api/cart/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userMobile, productId: product_id, quantity }),
      }).then(() => {
        setCartItems(cartItems.map(item => item.product_id === product_id ? { ...item, quantity } : item));
      });
    } else {
      updateQuantity(product_id, quantity);
      setCartItems(guestCartItems);
    }
  };

  if (!cartItems.length)
    return (
      <div className="container py-5 mt-5">
        <div className="text-center p-5 bg-light rounded-3 shadow-sm">
          <div className="display-1 mb-3">🛒</div>
          <h2 className="fw-bold">Your cart is empty</h2>
          <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary-gold btn-lg px-5">
            Continue Shopping
          </button>
        </div>
      </div>
    );

  const handleCheckout = () => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/checkout');
      return;
    }
    router.push('/checkout');
  };

  const resolveImage = (images) => {
    if (!images) return '/placeholder.png';
    let img = images;

    if (typeof img === 'string') {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed)) img = parsed[0];
      } catch { }
    }

    if (Array.isArray(img)) img = img[0];
    if (typeof img !== 'string') return '/placeholder.png';
    if (img.startsWith('http')) return img;
    if (!img.startsWith('/')) return `/${img}`;
    return img;
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="container py-5 mt-4">
      <h2 className="fw-bold mb-4">Shopping Cart ({cartItems.length} items)</h2>

      <div className="row g-4">
        {/* Left Column: Cart Items */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm overflow-hidden">
            <div className="card-body p-0">
              <div className="list-group list-group-flush">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="list-group-item p-4">
                    <div className="row align-items-center">
                      <div className="col-3 col-md-2">
                        <img
                          src={resolveImage(item.images)}
                          alt={item.title}
                          className="img-fluid rounded border shadow-sm"
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                        />
                      </div>

                      <div className="col-9 col-md-10">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1 fw-bold">{item.title}</h5>
                            <p className="text-muted small mb-2">Product ID: {item.product_id}</p>
                          </div>
                          <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => handleRemove(item.product_id)}
                            title="Remove item"
                          >
                            <i className="bi bi-trash"></i> Remove
                          </button>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="input-group input-group-sm" style={{ maxWidth: '120px' }}>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >-</button>
                            <input
                              type="number"
                              className="form-control text-center bg-white"
                              value={item.quantity}
                              readOnly
                            />
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            >+</button>
                          </div>
                          <div className="text-end">
                            <span className="text-muted small d-block">Price: ₹{item.price.toLocaleString('en-IN')}</span>
                            <span className="fw-bold fs-5 text-primary-gold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4 text-dark-gold">Order Summary</h5>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal</span>
                <span>₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>

              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="text-success fw-semibold">FREE</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="h5 fw-bold">Total</span>
                <span className="h5 fw-bold text-primary-gold">₹{totalPrice.toLocaleString('en-IN')}</span>
              </div>

              <button
                className="btn btn-primary-gold text-white btn-lg 
                w-100 d-flex align-items-center justify-content-center gap-2 shadow-sm"
                onClick={handleCheckout}
              >
                <i className="bi bi-lock-fill fs-5"></i>
                PROCEED TO CHECKOUT
              </button>

              {!isLoggedIn && (
                <p className="text-muted small mt-3 text-center">
                  <i className="bi bi-info-circle me-1 text-dark-gold"></i>
                  Login required to place order
                </p>
              )}

              <div className="mt-4 p-3 rounded bg-light small text-muted">
                <i className="bi bi-shield-check me-2 text-primary-gold"></i>
                Secure checkout powered by Stripe
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
