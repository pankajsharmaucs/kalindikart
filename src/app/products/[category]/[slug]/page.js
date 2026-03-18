'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductSwiper from '../../../../components/ProductSwiper';
import { useCartStore } from '../../../../stores/cartStore';
import "./product_desc.css"

export default function ProductPage() {
    const router = useRouter();
    const params = useParams();
    const { category, slug } = params;

    const addToCart = useCartStore((state) => state.addToCart);
    const cartItems = useCartStore((state) => state.cartItems);
    const cartCount = useCartStore((state) => state.getCartCount());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [product, setProduct] = useState(null);
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const [pincode, setPincode] = useState('');
    const [deliveryInfo, setDeliveryInfo] = useState(null);
    const [delLoading, setDelLoading] = useState(false);

    const [delError, setdelError] = useState('');


    const alreadyInCart = useMemo(() => {
        return product ? cartItems.some(item => item.product_id === product.id) : false;
    }, [product, cartItems]);

    const handleImageChange = useCallback((newImageUrl) => {
        setMainImage(newImageUrl);
    }, []);

    const checkDelivery = async (e) => {
        if (e) e.preventDefault();

        // ✅ Empty check
        if (!pincode) {
            setdelError('Please enter pincode');
            setDeliveryInfo(null);
            return;
        }

        // ✅ 6-digit numeric validation
        if (!/^[0-9]{6}$/.test(pincode)) {
            setdelError('Enter valid 6-digit pincode');
            setDeliveryInfo(null);
            return;
        }

        try {
            setDelLoading(true);
            setdelError('');

            // delay
            await new Promise((resolve) => setTimeout(resolve, 500));

            const res = await fetch(`/api/pincode-delivery?pincode=${pincode}`);
            const data = await res.json();

            // ✅ INVALID PINCODE (404)
            if (res.status === 404) {
                setdelError('Invalid pincode');
                setDeliveryInfo(null);
                localStorage.removeItem('deliveryInfo');
                return;
            }

            // ✅ OTHER ERRORS
            if (!res.ok) {
                setdelError(data.error || 'Something went wrong');
                setDeliveryInfo(null);
                return;
            }

            // ✅ SUCCESS
            setDeliveryInfo(data);
            setdelError('');

            localStorage.setItem('deliveryInfo', JSON.stringify(data));

        } catch (err) {
            setdelError('Network error. Please try again.');
            setDeliveryInfo(null);
        } finally {
            setDelLoading(false);
        }
    };

    // Fetch Product Data (Using your existing logic)
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/products?slug=${slug}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                setProduct(data);

                // Set initial image
                const imgs = typeof data.images === 'string' ? JSON.parse(data.images) : data.images;
                if (imgs?.[0]) setMainImage(imgs[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    useEffect(() => {
        const savedData = localStorage.getItem('deliveryInfo');

        if (savedData) {
            const parsed = JSON.parse(savedData);
            setDeliveryInfo(parsed);
            setPincode(parsed.pincode); // 👈 prefill input
        }
    }, []);

    const { currentPrice, originalPrice, discountPercentage, imageList, specifications, productRating, totalRatings } = useMemo(() => {
        if (!product) return {};
        const productId = product.id || product.product_id;
        const rawImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
        const imageList = rawImages.map(img => img.startsWith('http') ? img : `assets/products/${productId}/${img}`);

        const price = Number(product.price) || 0;
        const discount = Number(product.discount) || 0;
        const oldPrice = discount > 0 ? Math.round(price / (1 - discount / 100)) : price;

        return {
            currentPrice: price,
            originalPrice: oldPrice,
            discountPercentage: discount,
            imageList,
            productRating: product.rating || 4.5,
            totalRatings: product.total_ratings || 1250
        };
    }, [product]);

    if (loading) return <div className="loading-state">Loading Premium Product...</div>;
    if (error || !product) return <div className="error-state">Error: {error}</div>;

    return (
        <main className="product-page-v2" style={{ backgroundColor: '#fff', color: 'var(--text-dark)' }}>
            <div className="container py-4 px-md-4 px-3">
                {/* BREADCRUMBS */}
                <nav className="breadcrumb-nav mb-3 text-capitalize" style={{ fontSize: '0.85rem', color: '#888' }}>
                    Home / {product.category_slug} / <span style={{ fontWeight: '600' }}>{product.title}</span>
                </nav>

                <div className="row g-5">
                    {/* LEFT COLUMN: IMAGES */}
                    <div className="col-lg-6">
                        <div className="sticky-top" style={{ top: '20px' }}>
                            <ProductSwiper
                                imageList={imageList}
                                productTitle={product.title}
                                onImageChange={handleImageChange}
                            />
                        </div>
                    </div>

                    {/* RIGHT COLUMN: PRODUCT INFO */}
                    <div className="col-lg-6">
                        <div className="product-info-panel">
                            <div className="text-uppercase mb-1" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#00bfa5', letterSpacing: '1px' }}>
                                {product.category_slug}
                            </div>
                            <h1 className="product-main-title" style={{ fontSize: '2rem', fontWeight: '600' }}>
                                {product.title}
                            </h1>

                            {/* STAR RATING SECTION */}
                            <div className="rating-row mb-2 d-flex align-items-center gap-2">
                                <div className="stars" style={{ color: '#FFB400', fontSize: '1.1rem' }}>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                    <i className="fa fa-star"></i>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                                    {productRating} ({totalRatings} Reviews)
                                </span>
                            </div>


                            {/* PRICING */}
                            <div className="d-flex align-items-center gap-2 mb-md-4 mb-1">
                                <span style={{ fontSize: '1.8rem', color: '#07913c', fontWeight: '700' }}>
                                    ₹{currentPrice.toLocaleString('en-IN')}
                                </span>
                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                                    ₹{originalPrice.toLocaleString('en-IN')}
                                </span>
                                <span style={{ color: '#ff5252', fontSize: '0.8rem', fontWeight: '600' }}>
                                    ({discountPercentage}% OFF)
                                </span>
                            </div>


                            {/* =====Features=== */}
                            {/* BRAND TRUST FEATURES */}
                            <div className="features-row mt-4 py-3 px-2 mb-md-5 mb-2 border rounded" style={{ backgroundColor: '#fdfdfd' }}>
                                <div className="row g-2 align-items-center"> {/* Added align-items-center */}

                                    {/* Feature 1: Free Shipping */}
                                    <div className="col-4 border-end">
                                        <div className="text-center">
                                            {/* Replace with your actual image path */}
                                            <img
                                                src="/icons/delivery.png"
                                                alt="Free Shipping"
                                                style={{ width: '32px', height: '32px', objectFit: 'contain', marginBottom: '8px' }}
                                            />
                                            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#333' }}>
                                                Free
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#888' }}>
                                                Shipping
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feature 2: 100% Secure Payment */}
                                    <div className="col-4 border-end">
                                        <div className="text-center">
                                            {/* Replace with your actual image path */}
                                            <img
                                                src="/icons/payment.png"
                                                alt="Secure Payment"
                                                style={{ width: '32px', height: '32px', objectFit: 'contain', marginBottom: '8px' }}
                                            />
                                            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#333' }}>
                                                100% Secure
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#888' }}>
                                                Payment
                                            </div>
                                        </div>
                                    </div>

                                    {/* Feature 3: Easy Returns */}
                                    <div className="col-4">
                                        <div className="text-center">
                                            {/* Replace with your actual image path */}
                                            <img
                                                src="/icons/return.png"
                                                alt="Easy Returns"
                                                style={{ width: '32px', height: '32px', objectFit: 'contain', marginBottom: '8px' }}
                                            />
                                            <div style={{ fontSize: '0.7rem', fontWeight: '700', textTransform: 'uppercase', color: '#333' }}>
                                                Easy
                                            </div>
                                            <div style={{ fontSize: '0.65rem', color: '#888' }}>
                                                Returns
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* CHECK DELIVERY SECTION */}
                            <div className="delivery-check-section mb-md-3 mb-4 col-md-8">

                                <label
                                    className="form-label fw-bold text-uppercase mb-2"
                                    style={{ fontSize: '0.75rem', color: '#666' }}
                                >
                                    Check Delivery & Services
                                </label>

                                <div className="input-group mb-2" style={{ maxWidth: '350px' }}>
                                    <input
                                        type="tel" // ✅ shows number keypad on mobile
                                        inputMode="numeric" // ✅ stronger hint for numeric keyboard
                                        pattern="[0-9]*" // ✅ allows only digits
                                        maxLength={6} // ✅ limit to 6 digits
                                        className="form-control"
                                        placeholder="Enter Pincode"
                                        value={pincode}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, ''); // ✅ remove non-digits
                                            setPincode(value);
                                            setdelError('');
                                        }}
                                        style={{
                                            fontSize: '0.9rem',
                                            padding: '10px 15px',
                                            border: '1px solid #ddd'
                                        }}
                                    />

                                    <button
                                        className="btn fw-bold px-4"
                                        type="button"
                                        onClick={checkDelivery}
                                        style={{
                                            backgroundColor: 'transparent',
                                            color: '#01A9E6',
                                            border: '1px solid #ddd',
                                            borderLeft: 'none',
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        CHECK
                                    </button>
                                </div>

                                {/* ✅ Status Section */}
                                <div style={{ fontSize: '0.85rem' }}>

                                    {delLoading && (
                                        <span style={{ color: '#888' }}>Checking...</span>
                                    )}

                                    {!delLoading && deliveryInfo && (
                                        <div className="d-flex flex-column gap-1">

                                            <div style={{ color: 'green', fontWeight: '600' }}>
                                                ✅ Delivery in {deliveryInfo.delivery_days}
                                            </div>

                                            <div style={{ color: '#666' }}>
                                                📍 {deliveryInfo.city}, {deliveryInfo.state}
                                            </div>

                                        </div>
                                    )}

                                    {!deliveryInfo && !delLoading && !delError && (
                                        <div
                                            className="d-flex align-items-center gap-2"
                                            style={{ color: '#888' }}
                                        >
                                            <i className="fa fa-map-marker-alt"></i>
                                            <span>
                                                Please enter PIN code to check delivery time.
                                            </span>
                                        </div>
                                    )}
                                    {delError && (
                                        <div
                                            className="d-flex align-items-center gap-2"
                                            style={{ color: '#888' }}
                                        >
                                            <i className="fa fa-map-marker-alt"></i>
                                            <span>
                                                Invalid Pincode.
                                            </span>
                                        </div>
                                    )}

                                </div>

                            </div>

                            {/* ACTIONS */}
                            <div className="d-flex col-md-6 mb-md-4 mb-2">

                                {alreadyInCart ? (
                                    <button className="btn-checkout" onClick={() => router.push('/cart')}>
                                        GO TO CART <i className="fa fa-chevron-right me-2"></i>
                                    </button>
                                ) : (
                                    <button className="btn-add-cart" onClick={() => addToCart(product)}>
                                        <i className="fa fa-shopping-cart me-2"></i> ADD TO CART
                                    </button>
                                )}
                            </div>

                            {/* PAYMENT & TRUST SECTION */}
                            <div className="payment-trust-section p-3 rounded mb-4" style={{ backgroundColor: '#f9f9f9', border: '1px solid #eee' }}>
                                <div className="row align-items-center">
                                    <div className="col-md-6">
                                        <div className="d-flex align-items-center gap-2 mb-2 mb-md-0">
                                            <div style={{ color: '#00739D' }}>
                                                <i className="fa fa-shield-alt fa-2x"></i>
                                            </div>
                                            <div>
                                                <h6 className="mb-0 fw-bold" style={{ fontSize: '0.85rem' }}>100% SECURE PAYMENT</h6>
                                                <p className="mb-0 text-muted" style={{ fontSize: '0.75rem' }}>All major credit & debit cards supported</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-md-6 text-md-end">
                                        <div className="payment-icons-container">
                                            <img
                                                src="/icons/logo_razorpay.webp"
                                                alt="Payment Options"
                                                style={{
                                                    maxWidth: '100%',
                                                    height: 'auto',
                                                    maxHeight: '66px',
                                                    filter: 'grayscale(0.2)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                            </div>






                        </div>
                    </div>
                </div>


                {/* ====Section 2=== */}
                <div className="row p-md-4 py-3 bg-white shadow-sm my-md-5 my-2 rounded">
                    <div className="col-12">
                        {/* TAB NAVIGATION */}
                        <ul className="nav nav-tabs border-0 mb-4 gap-4" id="productTab" role="tablist">
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link active fw-bold text-uppercase p-3 border-0"
                                    id="spec-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#spec-pane"
                                    type="button"
                                    role="tab"
                                >
                                    Product Specification
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link fw-bold text-uppercase p-3 border-0"
                                    id="description-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#description-pane"
                                    type="button"
                                    role="tab"
                                >
                                    Description
                                </button>
                            </li>
                            <li className="nav-item" role="presentation">
                                <button
                                    className="nav-link fw-bold text-uppercase p-3 border-0"
                                    id="review-tab"
                                    data-bs-toggle="tab"
                                    data-bs-target="#review-pane"
                                    type="button"
                                    role="tab"
                                >
                                    Reviews ({product.total_ratings || 0})
                                </button>
                            </li>
                        </ul>

                        {/* TAB CONTENT */}
                        <div className="tab-content px-2" id="productTabContent">

                            {/* Pane 1: Specification */}
                            <div className="tab-pane fade show active" id="spec-pane" role="tabpanel" aria-labelledby="spec-tab" tabIndex="0">
                                <div className="specifications-section">
                                    <h6 className="text-uppercase fw-bold mb-4" style={{ fontSize: '0.8rem', color: '#888' }}>Technical Specifications</h6>
                                    {product.specifications?.length > 0 ? (
                                        <div className="row g-4">
                                            {product.specifications.map((spec, index) => (
                                                <div className="col-6 col-md-4 col-lg-3" key={index}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <i className={`bi ${spec.icon || 'bi-patch-check'}`} style={{ color: 'var(--primary-gold)', fontSize: '1.1rem' }}></i>
                                                        <div>
                                                            <small className="d-block text-muted text-uppercase" style={{ fontSize: '0.65rem', fontWeight: '600' }}>{spec.title}</small>
                                                            <span className="fw-medium" style={{ fontSize: '0.95rem', color: '#333' }}>{spec.value}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-muted">No specifications available for this product.</p>
                                    )}
                                </div>
                            </div>

                            {/* Pane 2: Description */}
                            <div className="tab-pane fade" id="description-pane" role="tabpanel" aria-labelledby="description-tab" tabIndex="0">
                                <div className="details-section">
                                    <h6 className="text-uppercase fw-bold mb-3" style={{ fontSize: '0.8rem', color: '#888' }}>About this item</h6>
                                    <p style={{ fontSize: '0.95rem', lineHeight: '1.7', color: '#444' }}>
                                        {product.description || `${product.title} - Premium quality item designed for comfort and style.`}
                                    </p>
                                </div>
                            </div>

                            {/* Pane 3: Reviews */}
                            <div className="tab-pane fade" id="review-pane" role="tabpanel" aria-labelledby="review-tab" tabIndex="0">
                                <div className="review-section">
                                    <h5 className="mb-3">Customer Ratings</h5>
                                    <div className="d-flex align-items-center gap-3 mb-4 p-3 rounded" style={{ backgroundColor: 'var(--light-bg)' }}>
                                        <h2 className="mb-0 fw-bold" style={{ color: 'var(--text-dark)' }}>{product.rating || 4.5}</h2>
                                        <div>
                                            <div className="text-warning">
                                                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-half"></i>
                                            </div>
                                            <small className="text-muted">Based on {product.total_ratings || 0} reviews</small>
                                        </div>
                                    </div>
                                    <p className="text-muted small italic">Only registered users who have purchased this product may leave a review.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </main>
    );
}