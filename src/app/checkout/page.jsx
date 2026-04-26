'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../stores/cartStore';
import './checkout.css'
import Swal from "sweetalert2";

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
  const [lastFetchedPin, setLastFetchedPin] = useState('');

  // Address
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');

  const [city, setCity] = useState('');           // ID
  const [state, setState] = useState('');         // ID
  const [cityName, setCityName] = useState('');   // DISPLAY
  const [stateName, setStateName] = useState(''); // DISPLAY

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

  const fetchLocationFromPincode = async (pin) => {
    if (pin.length !== 6) return;

    try {
      const res = await fetch(`/api/master/pincode?pincode=${pin}`);
      const data = await res.json();

      if (data.success) {
        setCity(data.data.city_id);         // ✅ ID
        setState(data.data.state_id);       // ✅ ID
        setCityName(data.data.city_name);   // ✅ NAME
        setStateName(data.data.state_name);
      }
    } catch (err) {
      console.error("Pincode fetch error:", err);
    }
  };

  /* ---------------- FETCH USER ---------------- */
  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/user/by-mobile?identifier=${userId}`);
      const data = await res.json();

      if (data.exists) {
        const u = data.user;

        setFullname(u.fullname || '');
        setEmail(u.email || '');
        setMobile(u.mobile || '');
        setLine1(u.address_line1 || '');
        setLine2(u.address_line2 || '');
        setLine3(u.address_line3 || '');
        setCity(u.city || '');
        setState(u.state || '');
        setCityName(u.city_name || '');
        setStateName(u.state_name || '');
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
      } catch { }
    }

    if (Array.isArray(img)) img = img[0];
    if (!img) return '/placeholder.png';

    if (img.startsWith('http')) return img;
    if (!img.startsWith('/')) return `/${img}`;
    return img;
  };

  const validateAddress = () => {
    if (!fullname || !mobile || !line1 || !pincode) {
      Swal.fire({
        toast: true,
        position: "bottom-start",
        icon: "error",
        title: "Please fill all address ",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
      });
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
          line3,   // ✅ include this
          city,
          state,
          pincode,
          landmark,
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to save address');
        return;
      }

      setSuccess('Address saved successfully');
      setTimeout(() => setSuccess(''), 3000);

      // close modal
      const modalElement = document.getElementById("editAddressModal");
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal.hide();

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
      <div className="checkout-page-wrapper px-md-4 px-3">
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
              <div className="address-card border shadow-sm ">
                <div className="card-header-custom d-flex justify-content-between align-items-center">
                  <span>
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Shipping Address
                  </span>
                  {/* Edit Button - Triggers Modal */}
                  <button
                    className="btn btn-sm btn-light text-primary fw-bold"
                    data-bs-toggle="modal"
                    data-bs-target="#editAddressModal"
                    style={{ fontSize: '0.75rem' }}
                  >
                    <i className="fas fa-edit me-1 "></i> Add/Edit Address
                  </button>
                </div>

                {
                  fullname && mobile && email && pincode && (
                    <div className="card-body-custom p-4">
                      <div className="row">

                        <div className="col-12 mb-3">
                          <h6 className="fw-bold mb-1 text-capitalize">{fullname}</h6>
                          <p className="text-muted small mb-0">
                            <i className="fas fa-phone-alt me-2"></i>{mobile}
                            <br />
                            <i className="fas fa-envelope me-2"></i>{email}
                          </p>
                        </div>


                        <div className="col-12">
                          <p className="mb-1" style={{ fontSize: '0.95rem', color: '#333' }}>
                            {line1}, {line2},   {line3}
                          </p>
                          <p className="mb-1" style={{ fontSize: '0.95rem', color: '#333' }}>
                            {cityName}, {stateName}
                          </p>
                          <p className="fw-bold" >
                            PIN: {pincode} {landmark && `(Near ${landmark})`}
                          </p>
                        </div>


                      </div>
                    </div>
                  )
                }


              </div>

              {/* BOOTSTRAP 5 MODAL */}
              <div className="modal fade py-5" id="editAddressModal" tabIndex="-1"
                style={{ zIndex: "99999999999999999991060", background: "#000000d1" }}
                aria-labelledby="editAddressModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content border-0">
                    <div className="modal-header border-bottom-0">
                      <h5 className="modal-title fw-bold" id="editAddressModalLabel">Update Shipping Address</h5>
                      <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                      <div className="row g-3">

                        <div className="flex-grow-1">
                          <div style={{ fontSize: '0.7rem', color: '#666', textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>
                            Deleivery Details
                          </div>
                        </div>



                        {/* --- YOUR EXISTING FORM START --- */}

                        <div className="col-12">
                          <label className="form-label small fw-bold">Full Name</label>
                          <input type="text" className="custom-input" value={fullname} onChange={(e) => setFullname(e.target.value)} />
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-bold">Mobile</label>
                          <input
                            type="tel"
                            className="custom-input"
                            placeholder="Enter mobile"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            maxLength={10}
                            value={mobile}
                            onChange={(e) =>
                              setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))
                            }
                          />
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-bold">Email Address</label>
                          <input
                            type="email"
                            className="custom-input"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                          />
                        </div>


                        <div className="col-12">
                          <label className="form-label small fw-bold">Address Line 1</label>
                          <input type="text" className="custom-input" value={line1} onChange={(e) => setLine1(e.target.value)} />
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-bold">Address Line 2</label>
                          <input type="text" className="custom-input" value={line2} onChange={(e) => setLine2(e.target.value)} />
                        </div>

                        <div className="col-12">
                          <label className="form-label small fw-bold">Address Line 3</label>
                          <input type="text" className="custom-input" value={line3} onChange={(e) => setLine3(e.target.value)} />
                        </div>

                        <div className="col-6">
                          <label className="form-label small fw-bold">Pincode</label>
                          <input
                            className="custom-input"
                            type="text"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              setPincode(val);

                              // ✅ only call if exactly 6 AND not already fetched
                              if (val.length === 6 && val !== lastFetchedPin) {
                                fetchLocationFromPincode(val);
                                setLastFetchedPin(val);
                              }
                            }}
                          />
                        </div>

                        <div className="col-6">
                          <label className="form-label small fw-bold">City/Town</label>
                          <input
                            type="text"
                            className="custom-input"
                            value={cityName}
                            onChange={(e) => setCity(e.target.value)}
                          />
                        </div>

                        <div className="col-6">
                          <label className="form-label small fw-bold">State</label>
                          <input
                            type="text"
                            className="custom-input"
                            value={stateName}
                            onChange={(e) => setState(e.target.value)}
                          />
                        </div>


                        <div className="col-md-6">
                          <label className="form-label small fw-bold">Landmark</label>
                          <input type="text" className="custom-input" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                        </div>

                        {/* --- YOUR EXISTING FORM END --- */}
                      </div>

                      {error && <div className="text-danger small mt-2"><i className="fas fa-exclamation-circle me-1"></i>{error}</div>}
                      {success && <div className="text-success small mt-2"><i className="fas fa-check-circle me-1"></i>{success}</div>}
                    </div>

                    <div className="modal-footer border-top-0 justify-content-center">
                      <button
                        type="button"
                        className="btn btn-success px-4"
                        onClick={handleSaveAddress}
                        disabled={saveLoading}
                        style={{ backgroundColor: 'var(--primary-gold)', border: 'none', minWidth: '160px' }}
                      >
                        {saveLoading ? 'Updating...' : 'Update Address'}
                      </button>
                    </div>

                  </div>
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
                        <img
                          src={`/assets/products/${item.product_id}/${resolveImage(item.images)}`}
                          alt={item.title}
                          style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                        />
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
      </div >

      {/* Toast */}
      {toast && (
        <div className="toast-message">
          {toast}
        </div>
      )}

    </>
  );
}
