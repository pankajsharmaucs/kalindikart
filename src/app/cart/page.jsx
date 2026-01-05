'use client';

import React from 'react';
import { useCartStore } from '@/stores/cartStore';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const cartItems = useCartStore((state) => state.cartItems);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getCartTotal = useCartStore((state) => state.getCartTotal);
  const router = useRouter();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  if (!cartItems.length)
    return (
      <div className="container py-5 mt-5">
        <div className="text-center p-5 bg-light rounded-3 shadow-sm">
          <div className="display-1 mb-3">🛒</div>
          <h2 className="fw-bold">Your cart is empty</h2>
          <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
          <button onClick={() => router.push('/')} className="btn btn-primary btn-lg px-5">
            Continue Shopping
          </button>
        </div>
      </div>
    );

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
                        {item.images ? (
                          <img
                            src={
                              Array.isArray(item.images)
                                ? item.images[0]
                                : typeof item.images === 'string'
                                  ? JSON.parse(item.images)[0] || item.images // handle JSON string
                                  : item.images // fallback
                            }
                            alt={item.title}
                            className="img-fluid rounded border shadow-sm"
                            style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                          />
                        ) : (
                          <img
                            src="https://via.placeholder.com/80"
                            alt="placeholder"
                            className="img-fluid rounded border shadow-sm"
                          />
                        )}
                      </div>

                      <div className="col-9 col-md-10">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <h5 className="mb-1 fw-bold">{item.title}</h5>
                            <p className="text-muted small mb-2">Product ID: {item.product_id}</p>
                          </div>
                          <button
                            className="btn btn-link text-danger p-0"
                            onClick={() => removeFromCart(item.product_id)}
                            title="Remove item"
                          >
                            <i className="bi bi-trash"></i> Remove
                          </button>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div className="input-group input-group-sm" style={{ maxWidth: '120px' }}>
                            <button
                              className="btn btn-outline-secondary"
                              onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
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
                              onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            >+</button>
                          </div>
                          <div className="text-end">
                            <span className="text-muted small d-block">Price: ₹{item.price.toLocaleString('en-IN')}</span>
                            <span className="fw-bold fs-5 text-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
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
              <h5 className="fw-bold mb-4">Order Summary</h5>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Subtotal</span>
                <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="text-muted">Shipping</span>
                <span className="text-success">FREE</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-4">
                <span className="h5 fw-bold">Total</span>
                <span className="h5 fw-bold text-primary">₹{getCartTotal().toLocaleString('en-IN')}</span>
              </div>
              <button className="btn btn-primary w-100 py-3 fw-bold shadow-sm" onClick={handleCheckout}>
                PROCEED TO CHECKOUT
              </button>
              <div className="mt-4 p-3 bg-light rounded small text-muted">
                <i className="bi bi-shield-check me-2"></i> Secure checkout powered by Stripe.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}