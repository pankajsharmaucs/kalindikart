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
  const [loading, setLoading] = useState(true);

  // Fetch cart from DB if user is logged in
  useEffect(() => {
    const fetchCart = async () => {
      setLoading(true);
      if (!isLoggedIn) {
        setCartItems(guestCartItems);
        setLoading(false);
        return;
      }

      const userMobile = localStorage.getItem('userMobile');
      if (!userMobile) {
        setLoading(false);
        return;
      }

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
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [isLoggedIn, guestCartItems]);

  // Remove item handler
  const handleRemove = async (product_id) => {
    if (isLoggedIn) {
      const userMobile = localStorage.getItem('userMobile');
      await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userMobile, productId: product_id }),
      });
      setCartItems(cartItems.filter((item) => item.product_id !== product_id));
    } else {
      removeFromCart(product_id);
      setCartItems(guestCartItems);
    }
  };

  // Update quantity
  const handleUpdateQuantity = async (product_id, quantity) => {
    if (quantity <= 0) return;

    if (isLoggedIn) {
      const userMobile = localStorage.getItem('userMobile');
      await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userMobile, productId: product_id, quantity }),
      });
      setCartItems(cartItems.map((item) => (item.product_id === product_id ? { ...item, quantity } : item)));
    } else {
      updateQuantity(product_id, quantity);
      setCartItems(guestCartItems);
    }
  };


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
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Loading State
  if (loading) {
    return (
      <div className="container py-5 mt-5">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" style={{ width: '2rem', height: '2rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted small">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Empty Cart State
  if (!cartItems.length) {
    return (
      <>
        <div className="container py-5 mt-5">
          <div className="empty-cart-container">
            <div className="empty-cart-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>
            <h3 className="empty-cart-title">Your Cart is Empty</h3>
            <p className="empty-cart-text">Start adding items to your cart!</p>
            <button onClick={() => router.push('/')} className="btn-continue-shopping">
              <i className="fas fa-arrow-left me-2"></i>
              Continue Shopping
            </button>
          </div>
        </div>

        <style jsx>{`
          .empty-cart-container {
            text-align: center;
            padding: 3rem 1.5rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            max-width: 500px;
            margin: 0 auto;
          }

          .empty-cart-icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 1.5rem;
            background: linear-gradient(135deg, #f8f9fa, #e9ecef);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .empty-cart-icon i {
            font-size: 2.5rem;
            color: #adb5bd;
          }

          .empty-cart-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333;
            margin-bottom: 0.75rem;
          }

          .empty-cart-text {
            color: #666;
            margin-bottom: 1.5rem;
            font-size: 0.95rem;
          }

          .btn-continue-shopping {
            background: linear-gradient(135deg, #178ad6, #27bbc9);
            color: white;
            border: none;
            padding: 0.75rem 1.75rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-continue-shopping:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(23, 138, 214, 0.3);
          }
        `}</style>
      </>
    );
  }

  return (
    <>
      <div className="cart-page-wrapper">
        <div className="container py-4">
          {/* Page Header */}
          <div className="cart-header">
            <h3 className="cart-title">
              <i className="fas fa-shopping-cart me-2"></i>
              Shopping Cart <span className="item-count">({totalItems})</span>
            </h3>
          </div>

          <div className="row g-3 mt-2">
            {/* Left Column: Cart Items */}
            <div className="col-lg-8">
              <div className="cart-items-container">
                {cartItems.map((item) => (
                  <div key={item.product_id} className="cart-item">
                    <div className="row g-2 align-items-center">
                      {/* Product Image */}
                      <div className="col-auto">
                        <div className="cart-item-image">
                          <img
                            src={resolveImage(item.images)}
                            alt={item.title}
                            onError={(e) => (e.currentTarget.src = '/placeholder.png')}
                          />
                        </div>
                      </div>

                      {/* Product Details */}
                      <div className="col">
                        <h6 className="cart-item-title">{item.title}</h6>
                        <p className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</p>

                        {/* Quantity & Remove */}
                        <div className="d-flex align-items-center gap-3 mt-2">
                          {/* Quantity Controls */}
                          <div className="quantity-controls">
                            <button
                              className="qty-btn"
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <span className="qty-display">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={() => handleUpdateQuantity(item.product_id, item.quantity + 1)}
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>

                          {/* Remove */}
                          <button
                            className="btn-remove-link"
                            onClick={() => handleRemove(item.product_id)}
                          >
                            <i className="far fa-trash-alt me-1"></i>Remove
                          </button>
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="col-auto text-end">
                        <div className="cart-item-subtotal">
                          ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Continue Shopping Link */}
              <button onClick={() => router.push('/')} className="btn-back-shopping mt-3">
                <i className="fas fa-arrow-left me-2"></i>
                Continue Shopping
              </button>
            </div>

            {/* Right Column: Order Summary */}
            <div className="col-lg-4">
              <div className="order-summary">
                <div className="summary-header">
                  <i className="fas fa-receipt me-2"></i>
                  Order Summary
                </div>

                <div className="summary-body">
                  {/* Price Breakdown */}
                  <div className="summary-row">
                    <span>Subtotal</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="summary-row">
                    <span>Shipping</span>
                    <span className="text-success fw-bold">FREE</span>
                  </div>

                  <div className="summary-divider"></div>

                  {/* Total */}
                  <div className="summary-total">
                    <span>Total</span>
                    <span>₹{totalPrice.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Checkout Button */}
                  <button className="btn-checkout" onClick={handleCheckout}>
                    <i className="fas fa-lock me-2"></i>
                    Proceed to Checkout
                  </button>

                  {!isLoggedIn && (
                    <div className="login-notice">
                      <i className="fas fa-info-circle me-1"></i>
                      Login required
                    </div>
                  )}

                  {/* Security Badge */}
                  <div className="security-badge">
                    <i className="fas fa-shield-alt me-2"></i>
                    Secure Checkout
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* ============= PAGE WRAPPER ============= */
        .cart-page-wrapper {
          background: #f8f9fa;
          min-height: 100vh;
          padding: 1.5rem 0 3rem 0;
        }

        /* ============= CART HEADER ============= */
        .cart-header {
          background: white;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
          margin-bottom: 1rem;
        }

        .cart-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .item-count {
          color: #178ad6;
          font-size: 1.1rem;
        }

        /* ============= CART ITEMS ============= */
        .cart-items-container {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .cart-item {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .cart-item:hover {
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
        }

        .cart-item-image {
          width: 70px;
          height: 70px;
          border-radius: 6px;
          overflow: hidden;
          border: 1px solid #e0e0e0;
        }

        .cart-item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .cart-item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 0.25rem 0;
          line-height: 1.3;
        }

        .cart-item-price {
          color: #666;
          font-size: 0.9rem;
          font-weight: 500;
          margin: 0;
        }

        .cart-item-subtotal {
          font-size: 1.1rem;
          font-weight: 700;
          color: #178ad6;
        }

        /* Quantity Controls */
        .quantity-controls {
          display: inline-flex;
          align-items: center;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }

        .qty-btn {
          width: 28px;
          height: 28px;
          background: white;
          border: none;
          color: #333;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
        }

        .qty-btn:hover:not(:disabled) {
          background: #178ad6;
          color: white;
        }

        .qty-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .qty-display {
          min-width: 35px;
          text-align: center;
          font-weight: 600;
          color: #333;
          border-left: 1px solid #e0e0e0;
          border-right: 1px solid #e0e0e0;
          font-size: 0.9rem;
        }

        /* Remove Link */
        .btn-remove-link {
          background: none;
          border: none;
          color: #dc3545;
          font-size: 0.85rem;
          cursor: pointer;
          padding: 0;
          transition: all 0.3s ease;
        }

        .btn-remove-link:hover {
          color: #c82333;
          text-decoration: underline;
        }

        /* Continue Shopping Button */
        .btn-back-shopping {
          background: white;
          border: 1px solid #e0e0e0;
          color: #666;
          padding: 0.6rem 1.25rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-back-shopping:hover {
          border-color: #178ad6;
          color: #178ad6;
          background: rgba(23, 138, 214, 0.05);
        }

        /* ============= ORDER SUMMARY ============= */
        .order-summary {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          position: sticky;
          top: 20px;
        }

        .summary-header {
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
          padding: 0.9rem 1.25rem;
          font-size: 1rem;
          font-weight: 700;
        }

        .summary-body {
          padding: 1.25rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 0.9rem;
          color: #666;
        }

        .summary-divider {
          height: 1px;
          background: #e0e0e0;
          margin: 0.75rem 0;
        }

        .summary-total {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          font-size: 1.15rem;
          font-weight: 700;
          color: #333;
        }

        .btn-checkout {
          width: 100%;
          background: linear-gradient(135deg,#e79e3e,#e95943);
          color: white;
          border: none;
          padding: 0.85rem;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.75rem;
        }

        .btn-checkout:hover {
          background: linear-gradient(135deg, #e79e3e,#e95943);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
        }

        .login-notice {
          text-align: center;
          color: #666;
          font-size: 0.8rem;
          padding: 0.6rem;
          background: rgba(23, 138, 214, 0.05);
          border-radius: 4px;
          margin-top: 0.75rem;
        }

        .security-badge {
          text-align: center;
          padding: 0.75rem;
          background: rgba(40, 167, 69, 0.05);
          border-radius: 6px;
          color: #28a745;
          font-weight: 600;
          margin-top: 0.75rem;
          font-size: 0.85rem;
        }

        /* ============= RESPONSIVE ============= */
        @media (max-width: 991px) {
          .cart-item-image {
            width: 60px;
            height: 60px;
          }

          .cart-item-title {
            font-size: 0.9rem;
          }

          .cart-item-subtotal {
            font-size: 1rem;
          }
        }

        @media (max-width: 576px) {
          .cart-page-wrapper {
            padding: 1rem 0 2rem 0;
          }

          .cart-header {
            padding: 0.75rem 1rem;
          }

          .cart-title {
            font-size: 1.2rem;
          }

          .cart-item {
            padding: 0.75rem;
          }

          .cart-item-image {
            width: 55px;
            height: 55px;
          }

          .qty-btn {
            width: 26px;
            height: 26px;
          }

          .qty-display {
            min-width: 30px;
            font-size: 0.85rem;
          }

          .order-summary {
            margin-top: 1rem;
          }
        }
      `}</style>
    </>
  );
}
