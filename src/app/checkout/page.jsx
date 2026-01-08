'use client';

import React, { useEffect, useState } from 'react';
import { useCartStore } from '../../stores/cartStore';
import { useRouter } from 'next/navigation';

export default function CheckoutPage() {
    const router = useRouter();
    const cartItems = useCartStore((state) => state.cartItems);
    const getCartTotal = useCartStore((state) => state.getCartTotal);

    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Address form state
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

    useEffect(() => {
        const logged = localStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(logged);

        if (!logged) {
            router.push('/login?redirect=/checkout');
            return;
        }

        // Prefill from localStorage
        setMobile(localStorage.getItem('userMobile') || '');
        setEmail(localStorage.getItem('userEmail') || '');
        setFullname(localStorage.getItem('userFullname') || '');
    }, [router]);

    if (!cartItems.length) return <p className="text-center py-5">Your cart is empty</p>;

    const handleSaveAddress = () => {
        if (!fullname || !mobile || !line1 || !pincode) {
            setError('Please fill all required fields (*)');
            setSuccess('');
            return;
        }

        const addressData = { fullname, email, mobile, line1, line2, line3, pincode, landmark };
        localStorage.setItem('checkoutAddress', JSON.stringify(addressData));
        setError('');
        setSuccess('Address saved successfully!');
    };

    const resolveImage = (images) => images?.[0] || '/placeholder.png';

    return (
        <div className="container py-5">
            <h2 className="mb-4 text-dark-gold">Checkout</h2>
            <div className="row g-4">
                {/* Left: Address Form */}
                <div className="col-lg-8">
                    <div className="card p-4 shadow-sm">
                        <h5 className="mb-4 text-dark-gold">Shipping Address</h5>

                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="fullname"
                                placeholder="Full Name"
                                value={fullname}
                                onChange={(e) => setFullname(e.target.value)}
                            />
                            <label htmlFor="fullname">Full Name *</label>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-6 form-floating">
                                <input
                                    type="email"
                                    className="form-control"
                                    id="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <label htmlFor="email">Email</label>
                            </div>
                            <div className="col-md-6 form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="mobile"
                                    placeholder="Mobile Number"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/, ''))}
                                    maxLength={10}
                                />
                                <label htmlFor="mobile">Mobile *</label>
                            </div>
                        </div>

                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="line1"
                                placeholder="Address Line 1"
                                value={line1}
                                onChange={(e) => setLine1(e.target.value)}
                            />
                            <label htmlFor="line1">Address Line 1 *</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="line2"
                                placeholder="Address Line 2"
                                value={line2}
                                onChange={(e) => setLine2(e.target.value)}
                            />
                            <label htmlFor="line2">Address Line 2</label>
                        </div>
                        <div className="form-floating mb-3">
                            <input
                                type="text"
                                className="form-control"
                                id="line3"
                                placeholder="Address Line 3"
                                value={line3}
                                onChange={(e) => setLine3(e.target.value)}
                            />
                            <label htmlFor="line3">Address Line 3</label>
                        </div>

                        <div className="row g-3 mb-3">
                            <div className="col-md-6 form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="pincode"
                                    placeholder="Pincode"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value.replace(/\D/, ''))}
                                    maxLength={6}
                                />
                                <label htmlFor="pincode">Pincode *</label>
                            </div>
                            <div className="col-md-6 form-floating">
                                <input
                                    type="text"
                                    className="form-control"
                                    id="landmark"
                                    placeholder="Landmark"
                                    value={landmark}
                                    onChange={(e) => setLandmark(e.target.value)}
                                />
                                <label htmlFor="landmark">Landmark</label>
                            </div>
                        </div>

                        {error && <p className="text-danger small">{error}</p>}
                        {success && <p className="text-success small">{success}</p>}

                        <button
                            className="btn btn-primary-gold w-100 btn-lg mt-3 btn-primary-gold-shadow"
                            onClick={handleSaveAddress}
                        >
                            Save Address
                        </button>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <div className="col-lg-4">
                    <div className="card p-4 shadow-sm " style={{ top: '20px' }}>
                        <h5 className="mb-3 text-dark-gold">Order Summary</h5>

                        {cartItems.map((item) => (
                            <div key={item.product_id} className="d-flex align-items-center justify-content-between mb-3">
                                <div className="d-flex align-items-center">
                                    <img
                                        src={resolveImage(item.images)}
                                        alt={item.title}
                                        className="rounded me-2"
                                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div className="fw-semibold">{item.title}</div>
                                        <div className="small text-muted">Qty: {item.quantity}</div>
                                    </div>
                                </div>
                                <div className="fw-bold text-primary-gold">
                                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                </div>
                            </div>
                        ))}

                        <hr />

                        <div className="d-flex justify-content-between fw-bold text-dark-gold mb-2">
                            <span>Total Items</span>
                            <span>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                        </div>

                        <div className="d-flex justify-content-between fw-bold text-primary-gold mb-3 fs-5">
                            <span>Grand Total</span>
                            <span>₹{getCartTotal().toLocaleString('en-IN')}</span>
                        </div>

                        <button
                            className="btn btn-primary-gold w-100 btn-lg d-flex align-items-center justify-content-center gap-2 btn-primary-gold-shadow"
                            onClick={() => router.push('/checkout/payment-processing')}
                        >
                            <i className="bi bi-credit-card-2-front-fill fs-5"></i>
                            Proceed to Payment
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
