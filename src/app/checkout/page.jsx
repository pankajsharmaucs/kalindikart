'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Address state
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Total cart amount
  const getCartTotal = () =>
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Resolve image path
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

  // Validate address
  const validateAddressBeforePayment = () => {
    if (!fullname || !mobile || !line1 || !pincode) {
      setToast('Please fill all shipping address details before payment');
      setTimeout(() => setToast(''), 3000);
      return false;
    }
    return true;
  };

  /* ----------------------------------------
     LOAD LOGIN STATUS, CART, USER
  ---------------------------------------- */
  useEffect(() => {
    const loggedIn = localStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);

    const userMobile = localStorage.getItem('userMobile');
    if (!loggedIn || !userMobile) {
      router.push('/login?redirect=/checkout');
      return;
    }

    const fetchCartAndUser = async () => {
      try {
        // Fetch cart from DB
        const cartRes = await fetch(`/api/cart?userId=${userMobile}`);
        const cartData = await cartRes.json();
        if (cartData.success) setCartItems(cartData.cartItems);

        // Fetch user details
        const userRes = await fetch(`/api/user/by-mobile?mobile=${userMobile}`);
        const userData = await userRes.json();
        if (userData.exists) {
          const u = userData.user;
          setFullname(u.fullname || '');
          setEmail(u.email || '');
          setLine1(u.address_line1 || '');
          setLine2(u.address_line2 || '');
          setLine3(u.address_line3 || '');
          setPincode(u.pincode || '');
          setLandmark(u.landmark || '');
          setMobile(u.mobile || '');
        }
      } catch (err) {
        console.error('Checkout fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartAndUser();
  }, [router]);

  /* ----------------------------------------
     SAVE / UPDATE ADDRESS
  ---------------------------------------- */
  const handleSaveAddress = async () => {
    setError('');
    setSuccess('');

    if (!fullname || !mobile || !line1 || !pincode) {
      setError('Please fill all required fields (*)');
      return;
    }

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

    setSuccess('Address saved successfully!');
  };

  if (loading) return <p className="text-center py-5">Loading checkout...</p>;
  if (!cartItems.length) return <p className="text-center py-5">Your cart is empty</p>;

  return (
    <div className="container py-5">
      <h2 className="mb-4 text-dark-gold">Checkout</h2>

      <div className="row g-4">
        {/* ---------------- LEFT: ADDRESS ---------------- */}
        <div className="col-lg-8">
          <div className="card p-4 shadow-sm">
            <h5 className="mb-4 text-dark-gold">Shipping Address</h5>
            <div className="form-floating mb-3">
              <input className="form-control" placeholder="Full Name" value={fullname} onChange={(e) => setFullname(e.target.value)} />
              <label>Full Name *</label>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6 form-floating">
                <input className="form-control" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                <label>Email</label>
              </div>
              <div className="col-md-6 form-floating">
                <input className="form-control" value={mobile} disabled />
                <label>Mobile *</label>
              </div>
            </div>
            <div className="form-floating mb-3">
              <input className="form-control" placeholder="Address Line 1" value={line1} onChange={(e) => setLine1(e.target.value)} />
              <label>Address Line 1 *</label>
            </div>
            <div className="form-floating mb-3">
              <input className="form-control" placeholder="Address Line 2" value={line2} onChange={(e) => setLine2(e.target.value)} />
              <label>Address Line 2</label>
            </div>
            <div className="form-floating mb-3">
              <input className="form-control" placeholder="Address Line 3" value={line3} onChange={(e) => setLine3(e.target.value)} />
              <label>Address Line 3</label>
            </div>
            <div className="row g-3 mb-3">
              <div className="col-md-6 form-floating">
                <input className="form-control" placeholder="Pincode" maxLength={6} value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))} />
                <label>Pincode *</label>
              </div>
              <div className="col-md-6 form-floating">
                <input className="form-control" placeholder="Landmark" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                <label>Landmark</label>
              </div>
            </div>
            {error && <p className="text-danger small">{error}</p>}
            {success && <p className="text-success small">{success}</p>}
            <button className="btn btn-primary-gold w-100 btn-lg mt-3" onClick={handleSaveAddress}>
              Save Address
            </button>
          </div>
        </div>

        {/* ---------------- RIGHT: ORDER SUMMARY ---------------- */}
        <div className="col-lg-4">
          <div className="card p-4 shadow-sm">
            <h5 className="mb-3 text-dark-gold">Order Summary</h5>

            {cartItems.map((item) => (
              <div key={item.product_id} className="d-flex justify-content-between mb-3">
                <div className="d-flex">
                  <img src={resolveImage(item.images)} className="rounded me-2" style={{ width: 50, height: 50, objectFit: 'cover' }} />
                  <div>
                    <div className="fw-semibold">{item.title}</div>
                    <small>Qty: {item.quantity}</small>
                  </div>
                </div>
                <div className="fw-bold text-primary-gold">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}

            <hr />

            <div className="d-flex justify-content-between fw-bold">
              <span>Grand Total</span>
              <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
            </div>

            <button
              className="btn btn-primary-gold w-100 btn-lg mt-3"
              onClick={() => {
                if (!validateAddressBeforePayment()) return;
                router.push('/checkout/payment-processing');
              }}
            >
              Proceed to Payment
            </button>

          </div>
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 9999,
            background: '#dc3545',
            color: '#fff',
            padding: '12px 18px',
            borderRadius: 6,
            fontSize: 14,
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          }}
        >
          {toast}
        </div>
      )}

    </div>
  );
}
