'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../stores/cartStore';

export default function CheckoutPage() {
  const router = useRouter();

  /* ---------------- ZUSTAND ---------------- */
  const { cartItems, isLoggedIn, userId, hasHydrated } = useCartStore();

  /* ---------------- LOCAL STATE ---------------- */
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  // Address
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  /* ---------------- AUTH GUARD (FIXED) ---------------- */
  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoggedIn || !userId) {
      router.replace('/login?redirect=/checkout');
      return;
    }

    fetchUserDetails();
  }, [hasHydrated, isLoggedIn, userId]);

  /* ---------------- FETCH USER ---------------- */
  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/user/by-mobile?mobile=${userId}`);
      const data = await res.json();

      if (data.exists) {
        const u = data.user;
        setFullname(u.fullname || '');
        setEmail(u.email || '');
        setMobile(u.mobile || '');
        setLine1(u.address_line1 || '');
        setLine2(u.address_line2 || '');
        setLine3(u.address_line3 || '');
        setPincode(u.pincode || '');
        setLandmark(u.landmark || '');
      }
    } catch (err) {
      console.error('Checkout user fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HELPERS ---------------- */
  const getCartTotal = () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const getTotalItems = () => cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const resolveImage = (images) => {
    if (!images) return '/placeholder.png';
    let img = images;

    if (typeof img === 'string') {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed)) img = parsed[0];
      } catch {}
    }

    if (Array.isArray(img)) img = img[0];
    if (!img) return '/placeholder.png';

    if (img.startsWith('http')) return img;
    if (!img.startsWith('/')) return `/${img}`;
    return img;
  };

  const validateAddress = () => {
    if (!fullname || !mobile || !line1 || !pincode) {
      setToast('Please fill all required fields');
      setTimeout(() => setToast(''), 3000);
      return false;
    }
    return true;
  };

  /* ---------------- SAVE ADDRESS ---------------- */
  const handleSaveAddress = async () => {
    setError('');
    setSuccess('');

    if (!validateAddress()) return;

    setSaveLoading(true);

    try {
      const res = await fetch('/api/user/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname,
          email,
          mobile,
          line1,
          line2,
          line3,
          pincode,
          landmark,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save address');
        return;
      }

      setSuccess('Address saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Something went wrong');
    } finally {
      setSaveLoading(false);
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (!hasHydrated || loading) {
    return (
      <div className="container py-5">
        <div className="text-center py-4">
          <div className="spinner-border text-primary" style={{ width: '1.5rem', height: '1.5rem' }}></div>
          <p className="mt-2 text-muted small">Loading...</p>
        </div>
      </div>
    );
  }

  if (!cartItems.length) {
    return (
      <>
        <div className="container py-5">
          <div className="empty-checkout">
            <div className="empty-icon">
              <i className="fas fa-shopping-bag"></i>
            </div>
            <h4>Your cart is empty</h4>
            <p className="text-muted small">Add items before checkout</p>
            <button onClick={() => router.push('/')} className="btn-shop">
              <i className="fas fa-arrow-left me-2"></i>
              Start Shopping
            </button>
          </div>
        </div>

        <style jsx>{`
          .empty-checkout {
            text-align: center;
            padding: 2rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
            max-width: 400px;
            margin: 0 auto;
          }
          .empty-icon {
            width: 60px;
            height: 60px;
            margin: 0 auto 1rem;
            background: #f8f9fa;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .empty-icon i {
            font-size: 1.75rem;
            color: #adb5bd;
          }
          .empty-checkout h4 {
            font-size: 1.25rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          .btn-shop {
            background: linear-gradient(135deg, #178ad6, #27bbc9);
            color: white;
            border: none;
            padding: 0.6rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            margin-top: 1rem;
          }
          .btn-shop:hover {
            opacity: 0.9;
          }
        `}</style>
      </>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="checkout-page-wrapper">
        <div className="container py-3">
          {/* Page Header */}
          <div className="checkout-header">
            <div className="d-flex align-items-center justify-content-between">
              <h3 className="checkout-title">
                <i className="fas fa-shopping-bag me-2"></i>
                Checkout
              </h3>
              <button onClick={() => router.push('/cart')} className="btn-back">
                <i className="fas fa-arrow-left me-1"></i>
                Cart
              </button>
            </div>
          </div>

          <div className="row g-3 mt-1">
            {/* LEFT - Shipping Address */}
            <div className="col-lg-8">
              <div className="address-card">
                <div className="card-header-custom">
                  <i className="fas fa-map-marker-alt me-2"></i>
                  Shipping Address
                </div>

                <div className="card-body-custom">
                  <div className="row g-2">
                    {/* Full Name */}
                    <div className="col-12">
                      <label className="form-label">
                        Full Name <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Enter full name"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                      />
                    </div>

                    {/* Email & Mobile */}
                    <div className="col-md-6">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">
                        Mobile <span className="req">*</span>
                      </label>
                      <input type="text" className="form-input disabled" value={mobile} disabled />
                    </div>

                    {/* Address Lines */}
                    <div className="col-12">
                      <label className="form-label">
                        Address Line 1 <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="House/Flat No."
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address Line 2</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Street, Area"
                        value={line2}
                        onChange={(e) => setLine2(e.target.value)}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address Line 3</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="City, State"
                        value={line3}
                        onChange={(e) => setLine3(e.target.value)}
                      />
                    </div>

                    {/* Pincode & Landmark */}
                    <div className="col-md-6">
                      <label className="form-label">
                        Pincode <span className="req">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="6-digit"
                        maxLength={6}
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">Landmark</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Nearby"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Messages */}
                  {error && (
                    <div className="alert-msg error-msg">
                      <i className="fas fa-exclamation-circle me-1"></i>
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="alert-msg success-msg">
                      <i className="fas fa-check-circle me-1"></i>
                      {success}
                    </div>
                  )}

                  {/* Save Button */}
                  <button className="btn-save" onClick={handleSaveAddress} disabled={saveLoading}>
                    {saveLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-1"></i>
                        Save Address
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT - Order Summary */}
            <div className="col-lg-4">
              <div className="summary-card sticky-top">
                <div className="summary-header">
                  <i className="fas fa-receipt me-2"></i>
                  Order Summary
                </div>

                <div className="summary-body">
                  {/* Cart Items */}
                  <div className="summary-items">
                    {cartItems.map((item) => (
                      <div key={item.product_id} className="summary-item">
                        <img src={resolveImage(item.images)} alt={item.title} className="item-img" />
                        <div className="item-info">
                          <div className="item-name">{item.title}</div>
                          <div className="item-qty">Qty: {item.quantity}</div>
                        </div>
                        <div className="item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                  </div>

                  {/* Price Breakdown */}
                  <div className="divider"></div>

                  <div className="price-row">
                    <span>Subtotal ({getTotalItems()} items)</span>
                    <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                  </div>

                  <div className="price-row">
                    <span>Shipping</span>
                    <span className="text-success fw-bold">FREE</span>
                  </div>

                  <div className="divider"></div>

                  <div className="total-row">
                    <span>Total</span>
                    <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                  </div>

                  {/* Payment Button */}
                  <button
                    className="btn-payment"
                    onClick={() => {
                      if (!validateAddress()) return;
                      router.push('/checkout/payment-processing');
                    }}
                  >
                    <i className="fas fa-lock me-2"></i>
                    Proceed to Payment
                  </button>

                  {/* Security Badge */}
                  <div className="security-badge">
                    <i className="fas fa-shield-alt me-1"></i>
                    100% Secure
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast-msg">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {toast}
        </div>
      )}

      <style jsx global>{`
        /* ============= PAGE WRAPPER ============= */
        .checkout-page-wrapper {
          background: #f8f9fa;
          min-height: 100vh;
          padding: 1rem 0 2rem 0;
        }

        /* ============= HEADER ============= */
        .checkout-header {
          background: white;
          padding: 0.875rem 1rem;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          margin-bottom: 0.75rem;
        }

        .checkout-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .btn-back {
          background: white;
          border: 1px solid #e0e0e0;
          color: #666;
          padding: 0.5rem 1rem;
          border-radius: 5px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .btn-back:hover {
          border-color: #178ad6;
          color: #178ad6;
        }

        /* ============= ADDRESS CARD ============= */
        .address-card {
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .card-header-custom {
          background: #f8f9fa;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-weight: 700;
          color: #333;
          border-bottom: 1px solid #e0e0e0;
        }

        .card-body-custom {
          padding: 1rem;
        }

        /* Form Elements */
        .form-label {
          font-weight: 600;
          color: #333;
          font-size: 0.85rem;
          margin-bottom: 0.35rem;
          display: block;
        }

        .req {
          color: #dc3545;
        }

        .form-input {
          width: 100%;
          padding: 0.6rem 0.75rem;
          border: 1px solid #e0e0e0;
          border-radius: 5px;
          font-size: 0.9rem;
        }

        .form-input:focus {
          outline: none;
          border-color: #178ad6;
          box-shadow: 0 0 0 2px rgba(23, 138, 214, 0.1);
        }

        .form-input.disabled {
          background: #f8f9fa;
          cursor: not-allowed;
          opacity: 0.7;
        }

        /* Alerts */
        .alert-msg {
          padding: 0.6rem 0.75rem;
          border-radius: 5px;
          margin-top: 0.75rem;
          font-size: 0.85rem;
        }

        .error-msg {
          background: rgba(220, 53, 69, 0.1);
          color: #dc3545;
          border: 1px solid rgba(220, 53, 69, 0.2);
        }

        .success-msg {
          background: rgba(40, 167, 69, 0.1);
          color: #28a745;
          border: 1px solid rgba(40, 167, 69, 0.2);
        }

        /* Save Button */
        .btn-save {
          width: 230px;
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
          border: none;
          padding: 0.7rem;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 1rem;
        }

        .btn-save:hover:not(:disabled) {
          opacity: 0.9;
        }

        .btn-save:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* ============= SUMMARY CARD ============= */
        .summary-card {
          background: white;
          border-radius: 6px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          top: 15px;
        }

        .summary-header {
          background: linear-gradient(135deg, #e79e3e,#e95943);
          color: white;
          padding: 0.75rem 1rem;
          font-size: 0.95rem;
          font-weight: 700;
        }

        .summary-body {
          padding: 1rem;
        }

        /* Summary Items */
        .summary-items {
          max-height: 220px;
          overflow-y: auto;
          margin-bottom: 0.75rem;
        }

        .summary-item {
          display: flex;
          gap: 0.6rem;
          padding: 0.6rem;
          background: #f8f9fa;
          border-radius: 5px;
          margin-bottom: 0.5rem;
        }

        .item-img {
          width: 45px;
          height: 45px;
          border-radius: 5px;
          object-fit: cover;
          border: 1px solid #e0e0e0;
        }

        .item-info {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          font-size: 0.85rem;
          color: #333;
          line-height: 1.3;
          margin-bottom: 0.15rem;
        }

        .item-qty {
          font-size: 0.75rem;
          color: #999;
        }

        .item-price {
          font-weight: 700;
          color: #178ad6;
          font-size: 0.9rem;
        }

        .divider {
          height: 1px;
          background: #e0e0e0;
          margin: 0.6rem 0;
        }

        .price-row {
          display: flex;
          justify-content: space-between;
          padding: 0.4rem 0;
          font-size: 0.85rem;
          color: #666;
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 0.6rem 0;
          font-size: 1.05rem;
          font-weight: 700;
          color: #333;
        }

        /* Payment Button */
        .btn-payment {
          width: 100%;
          background: linear-gradient(135deg, #e79e3e,#e95943);
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          margin-top: 0.75rem;
        }

        .btn-payment:hover {
          opacity: 0.9;
        }

        .security-badge {
          text-align: center;
          padding: 0.6rem;
          background: rgba(40, 167, 69, 0.05);
          border-radius: 5px;
          color: #28a745;
          font-weight: 600;
          margin-top: 0.75rem;
          font-size: 0.8rem;
        }

        /* Toast */
        .toast-msg {
          position: fixed;
          top: 15px;
          right: 15px;
          background: #dc3545;
          color: white;
          padding: 0.75rem 1rem;
          border-radius: 6px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          font-weight: 600;
          font-size: 0.85rem;
        }

        /* ============= RESPONSIVE ============= */
        @media (max-width: 991px) {
          .summary-card {
            margin-top: 0.75rem;
          }
        }

        @media (max-width: 576px) {
          .checkout-page-wrapper {
            padding: 0.75rem 0 1.5rem 0;
          }

          .checkout-header {
            padding: 0.75rem;
          }

          .checkout-title {
            font-size: 1.1rem;
          }

          .btn-back {
            font-size: 0.8rem;
            padding: 0.4rem 0.75rem;
          }

          .card-body-custom {
            padding: 0.75rem;
          }

          .item-img {
            width: 40px;
            height: 40px;
          }

          .item-name {
            font-size: 0.8rem;
          }
        }
      `}</style>
    </>
  );
}
