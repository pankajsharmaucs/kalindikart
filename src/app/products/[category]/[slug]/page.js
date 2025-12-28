// ProductPage.jsx
'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams } from 'next/navigation';
// Import the new Swiper component
import ProductSwiper from '@/components/ProductSwiper';

import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore'; // ← ADD THIS IMPORT


// *** MOCK DEFINITION FOR Breadcrumb Component ***
// NOTE: Replace this mock with your actual import path for Breadcrumb, e.g., import Breadcrumb from '@/components/Breadcrumb';
const Breadcrumb = ({ product }) => {
    if (!product) return null;

    const categorySlug = product.category_slug?.toLowerCase().replace(/\s+/g, '-');
    const subcategorySlug = product.subcategory_slug?.toLowerCase().replace(/\s+/g, '-');

    return (
        <div className="bg-light border-bottom py-3">
            <div className="container product-page-wrapper">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb mb-1">
                        {/* Home */}
                        <li className="breadcrumb-item">
                            <a href="/">Home</a>
                        </li>

                        {/* Category */}
                        {product.category_name && categorySlug && (
                            <li className="breadcrumb-item">
                                <a href={`/category/${categorySlug}`}>
                                    {product.category_name}
                                </a>
                            </li>
                        )}

                        {/* Subcategory */}
                        {product.subcategory_name && subcategorySlug && (
                            <li className="breadcrumb-item">
                                <a href={`/category/${categorySlug}/${subcategorySlug}`}>
                                    {product.subcategory_name}
                                </a>
                            </li>
                        )}

                        {/* Current Product */}
                        <li className="breadcrumb-item active" aria-current="page">
                            {product.title}
                        </li>
                    </ol>
                </nav>
                <h1 className="h4 fw-bold mb-1 text-dark-gold">{product.title}</h1>
                <p className="text-muted small mb-0">{product.description || 'Explore our curated selection of premium handcrafted products.'}</p>
            </div>
        </div>
    );
};
// *************************************************

export default function ProductPage() {
    const router = useRouter();

    // Get from Zustand
    const addToCart = useCartStore((state) => state.addToCart);
    const isInCart = useCartStore((state) => state.isInCart);
    const cartCount = useCartStore((state) => state.cartCount);

   

    // --- State Hooks ---
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const [mainImage, setMainImage] = useState(null); // Retained for utility purposes

     const alreadyInCart = product?.id ? isInCart(product.id) : false;

    const handleAddToCart = async () => {
        if (!product) return;
        await addToCart(product);
        // Optional: add toast notification later
    };

    const handleGoToCart = () => {
        router.push('/cart');
    };

    const params = useParams();
    const { category, slug } = params;
    
    // Callback function passed to Swiper to update the mainImage state
    const handleImageChange = useCallback((newImageUrl) => {
        setMainImage(newImageUrl);
    }, []);

    // --- Data Fetching Effect (Retaining your API logic) ---
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            setProduct(null);

            try {
                // Mock API call (Replace with actual backend fetching logic)
                const res = await fetch(`/api/products?slug=${slug}`);
                if (!res.ok) throw new Error('Product not found or network error.');

                const data = await res.json();
                if (!data || Object.keys(data).length === 0) {
                    throw new Error('Product data is empty.');
                }

                let productCategorySlug = data.category_slug?.toLowerCase();
                productCategorySlug = productCategorySlug.replace(' ', '-');

                // console.log(productCategorySlug);

                if (productCategorySlug !== category) throw new Error('Invalid category URL');



                setProduct(data);

                let initialImages = [];
                try {
                    // Assuming data.images is a JSON string of image URLs
                    initialImages = typeof data.images === 'string' ? JSON.parse(data.images) : data.images || [];
                } catch {
                    // Fallback to check if it's already an array or a single string
                    initialImages = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []);
                }

                if (initialImages.length > 0) {
                    setMainImage(initialImages[0]);
                }

            } catch (err) {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [slug, category]);

    // --- Pincode Check Handler (Mock Logic Retained) ---
    const handlePincodeCheck = (e) => {
        e.preventDefault();
        // ... (Pincode check logic remains the same)
        if (!pincode || pincode.length !== 6 || isNaN(pincode)) {
            setDeliveryStatus({ message: 'Please enter a valid 6-digit Pincode.', type: 'danger' });
            return;
        }
        setDeliveryStatus({ message: 'Checking...', type: 'info' });
        setTimeout(() => {
            if (['110001', '400001', '560001'].includes(pincode)) {
                setDeliveryStatus({
                    message: 'Delivery available in 2-3 days. Cash on Delivery available.',
                    type: 'success',
                });
            } else {
                setDeliveryStatus({
                    message: 'Currently, delivery is not available for this Pincode.',
                    type: 'warning',
                });
            }
        }, 1000);
    };

    // --- Utility Calculations & Memos ---
    const { currentPrice, originalPrice, discountPercentage, imageList, specifications, productRating, totalRatings } = useMemo(() => {
        let images = [];
        try {
            // Re-parse images safely
            images = typeof product?.images === 'string' ? JSON.parse(product.images) : product?.images || [];
            // Ensure single string image is also handled if it wasn't parsed
            images = Array.isArray(images) ? images : (images ? [images] : []);
        } catch { /* ignored */ }

        const fallbackImage = 'https://via.placeholder.com/600x600/01A9E6/FFFFFF?text=Product+Image';
        const imageList = images.length ? images : [fallbackImage];

        const discountPercentage = Number(product?.discount) || 0;
        const currentPrice = Number(product?.price) || 0;
        const originalPrice =
            discountPercentage > 0 && discountPercentage < 100
                ? Math.round(currentPrice / (1 - discountPercentage / 100))
                : currentPrice; // If no discount, original price is current price

        const specifications = [
            { key: 'Brand', value: product?.brand_name || 'N/A' },
            { key: 'Color', value: product?.color || 'Blue' },
            { key: 'Material', value: product?.material || 'Synthetic' },
            { key: 'Weight', value: product?.weight || 'N/A' },
            { key: 'Model Number', value: product?.sku || 'N/A' },
        ];

        const productRating = Number(product?.rating) || 4.5;
        const totalRatings = Number(product?.total_ratings) || 12987;

        return { currentPrice, originalPrice, discountPercentage, imageList, specifications, productRating, totalRatings };
    }, [product]);


    // --- Mock Data for UI Sections ---
    const keyFeatures = [
        "Lightweight and optimized for comfort.",
        "Water-resistant material for all weather.",
        "Ergonomic design with padded straps.",
        "Available in multiple color options.",
    ];

    const reviewDistribution = [
        { stars: 5, count: 8500, percentage: 65 },
        { stars: 4, count: 3000, percentage: 23 },
        { stars: 3, count: 1000, percentage: 8 },
        { stars: 2, count: 300, percentage: 2 },
        { stars: 1, count: 187, percentage: 1.5 },
    ];


    // --- Render Status ---
    if (loading)
        return <div className="container py-5 text-center">
            <div className="spinner-border text-primary-gold" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Fetching product details...</p>
        </div>;

    if (error)
        return <div className="container py-5 text-center text-danger">🛑 Error: {error}</div>;

    if (!product) return <div className="container py-5 text-center text-muted">Product not available.</div>;

    // --- Main Render (Integrated UI) ---
    return (
        <>
            {/* REPLACED HEADER WITH BREADCRUMB COMPONENT
            <header className="bg-white shadow-sm py-2 sticky-top" style={{ zIndex: 1030 }}>...</header> 
            */}
            <Breadcrumb
                title={product.title || "Product Detail"}
                current={product.title || "Product"}
                description="Explore our curated selection of premium handcrafted products."
            />

            {/* Main Content Area */}
            <main className="product-page-wrapper p-3 p-lg-0">
                <div className="container-fluid px-0">
                    <div className="row g-4 pt-4 px-3 px-lg-4">

                        {/* ========================================================== */}
                        {/* LEFT COLUMN: SWIPER IMAGE GALLERY (col-lg-6) */}
                        {/* ========================================================== */}
                        <div className="col-12 col-lg-6">
                            {/* ProductSwiper handles main image and vertical/horizontal thumbnails */}
                            <ProductSwiper
                                imageList={imageList}
                                productTitle={product.title}
                                onImageChange={handleImageChange}
                            />
                        </div>

                        {/* ========================================================== */}
                        {/* RIGHT COLUMN: STICKY INFO PANEL (col-lg-6) */}
                        {/* ========================================================== */}
                        <div className="col-12 col-lg-6 "> {/* Added sticky-info-panel class for desktop sticky behavior */}
                            <div className="p-3 border rounded shadow-sm bg-white product-info-card">

                                <h1 className="h3 fw-bold mb-1">{product.title}</h1>

                                {/* Rating */}
                                <div className="d-flex align-items-center mb-3">
                                    <span className="badge rating-badge me-2 py-1"><i className="bi bi-star-fill me-1"></i>{productRating.toFixed(1)}</span>
                                    <span className="text-muted small">({totalRatings.toLocaleString()} Reviews)</span>
                                </div>

                                {/* Price */}
                                <div className="mb-3 border-bottom pb-2">
                                    <span className="price-text me-2">₹{currentPrice.toLocaleString('en-IN')}</span>
                                    {discountPercentage > 0 && (
                                        <>
                                            <span className="text-muted text-decoration-line-through me-2">₹{originalPrice.toLocaleString('en-IN')}</span>
                                            <span className="discount-badge badge p-2">{discountPercentage}% OFF</span>
                                        </>
                                    )}
                                </div>

                                {/* Key Features */}
                                <div className="mb-4 small text-dark">
                                    <h6 className="fw-bold text-dark-gold mb-2">Key Features:</h6>
                                    <ul className="list-unstyled product-features">
                                        {keyFeatures.map((feature, index) => (
                                            <li key={index} className="mb-1">
                                                <i className="bi bi-check-circle-fill me-2 feature-icon"></i>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Pincode Check (Interactive) */}
                                <div className="p-3 border rounded mb-4 shadow-sm-light delivery-check-box">
                                    <p className="fw-semibold mb-2 text-dark-gold">Check Delivery Estimate</p>
                                    <form onSubmit={handlePincodeCheck}>
                                        <div className="input-group mb-2">
                                            <input
                                                type="text"
                                                className="form-control"
                                                placeholder="Enter Pincode"
                                                maxLength="6"
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                            />
                                            <button className="btn btn-outline-dark-gold" type="submit">CHECK</button>
                                        </div>
                                    </form>

                                    {deliveryStatus && (
                                        <p className={`small mb-0 text-${deliveryStatus.type === 'success' ? 'success' : 'danger'}`}>
                                            <i className={`bi bi-${deliveryStatus.type === 'success' ? 'truck' : 'exclamation-octagon'} me-1`}></i>
                                            {deliveryStatus.message}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {/* Actions */}
                                <div className="d-grid gap-2 mb-3">
                                    {alreadyInCart ? (
                                        <button
                                            className="btn btn-success btn-lg"
                                            onClick={handleGoToCart}
                                        >
                                            <i className="bi bi-cart-check me-2"></i>
                                            GO TO CART ({cartCount})
                                        </button>
                                    ) : (
                                        <>
                                            <button className="btn btn-primary-gold btn-lg">
                                                <i className="bi bi-lightning-fill me-2"></i>
                                                BUY NOW
                                            </button>
                                            <button
                                                className="btn btn-warning btn-lg"
                                                onClick={handleAddToCart}
                                                disabled={!product}
                                            >
                                                <i className="bi bi-cart-plus me-2"></i>
                                                ADD TO CART
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Additional Info */}
                                <div className="mt-3 small text-muted border-top pt-3">
                                    <p className="mb-1"><i className="bi bi-gift me-1"></i>Free gift wrapping available.</p>
                                    <p className="mb-1"><i className="bi bi-shield-check me-1"></i>{product.return_policy || '10-Day Easy Return Policy'}</p>
                                </div>
                            </div>
                        </div>

                        {/* ========================================================== */}
                        {/* MAIN SCROLLABLE CONTENT (Full width below product box) */}
                        {/* ========================================================== */}
                        <div className="col-12 px-3 px-lg-4">

                            {/* Description */}
                            <div className="product-content-section pt-4">
                                <h4 className="fw-bold mb-3 border-bottom pb-1 text-dark-gold">Product Description</h4>
                                <div className="text-secondary" dangerouslySetInnerHTML={{ __html: product.description || '<p>No detailed description available.</p>' }} />
                            </div>

                            {/* Specifications */}
                            <div className="product-content-section pt-4">
                                <h4 className="fw-bold mb-3 border-bottom pb-1 text-dark-gold">Technical Specifications</h4>
                                <table className="table table-borderless specs-table">
                                    <tbody>
                                        {specifications.map((spec, index) => (
                                            <tr key={index}>
                                                <td className="fw-semibold" style={{ width: '40%' }}>{spec.key}</td>
                                                <td>{spec.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* LIFESTYLE FULL-WIDTH BANNER */}
                            <div className="col-12 px-0">
                                <div className="lifestyle-banner rounded">
                                    <h2 className="display-5 text-white shadow-text">Performance Meets Style</h2>
                                </div>
                            </div>

                            {/* REVIEWS SECTION */}
                            <div className="product-content-section pt-5">
                                <h4 className="fw-bold mb-4 border-bottom pb-1 text-dark-gold" id="reviews">Customer Reviews & Ratings</h4>

                                <div className="row mb-5">
                                    {/* Rating Summary */}
                                    <div className="col-md-4 text-center border-end rating-summary-box">
                                        <h1 className="display-3 fw-bold text-primary-gold">{productRating.toFixed(1)}</h1>
                                        <div className="text-warning mb-2 h5">
                                            {/* Star icons based on rating */}
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`bi bi-star${i + 1 <= Math.floor(productRating) ? '-fill' : (i < productRating && i + 1 > productRating ? '-half' : '')}`}></i>
                                            ))}
                                        </div>
                                        <p className="small text-muted mb-0">Based on {totalRatings.toLocaleString()} ratings</p>
                                    </div>

                                    {/* Distribution Bars */}
                                    <div className="col-md-8 p-3 rating-distribution-bars">
                                        {reviewDistribution.map((dist) => (
                                            <div key={dist.stars} className="d-flex align-items-center mb-1">
                                                <span className="small me-2" style={{ width: '30px' }}>{dist.stars} <i className="bi bi-star-fill text-warning"></i></span>
                                                <div className="progress flex-grow-1 me-2" style={{ height: '8px' }}>
                                                    <div
                                                        className="progress-bar bg-success"
                                                        role="progressbar"
                                                        style={{ width: `${dist.percentage}%` }}
                                                        aria-valuenow={dist.percentage}
                                                        aria-valuemin="0"
                                                        aria-valuemax="100"
                                                    ></div>
                                                </div>
                                                <span className="small text-muted" style={{ width: '60px', textAlign: 'right' }}>{dist.count.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <h5 className="fw-bold mb-3">Top Customer Reviews</h5>
                                <div className="row g-4">
                                    {/* Mock Review 1 */}
                                    <div className="col-md-6">
                                        <div className="card review-card h-100 p-3">
                                            <h6 className="fw-bold text-dark-gold">Solid Build Quality</h6>
                                            <div className="text-warning mb-2">
                                                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i>
                                            </div>
                                            <p className="card-text small text-muted">"The backpack is robust and handles heavy loads well. The blue color is vibrant and stylish."</p>
                                            <p className="card-text small fw-semibold mb-0">Riya Sharma, 1 week ago</p>
                                        </div>
                                    </div>
                                    {/* Mock Review 2 */}
                                    <div className="col-md-6">
                                        <div className="card review-card h-100 p-3">
                                            <h6 className="fw-bold text-dark-gold">Comfortable for Hiking</h6>
                                            <div className="text-warning mb-2">
                                                <i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-fill"></i><i className="bi bi-star-half"></i>
                                            </div>
                                            <p className="card-text small text-muted">"Excellent padding on the shoulders makes it comfortable even on long treks. Highly recommended for outdoor use."</p>
                                            <p className="card-text small fw-semibold mb-0">Vikram K., 3 days ago</p>
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-primary-gold mt-4 text-white">View All {totalRatings.toLocaleString()} Reviews</button>
                            </div>

                            {/* Related Products (Placeholder) */}
                            <div className="product-content-section border-top pt-5">
                                <h4 className="fw-bold mb-4 border-bottom pb-1 text-dark-gold">More Products You May Like</h4>
                                <div className="row row-cols-2 row-cols-md-4 g-3">
                                    {/* Map over related products data here */}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            {/* Global Styles (Updated for the Bright Blue palette and corrected gallery layout) */}
            <style jsx global>{`
                /* --- New Color Palette --- */
                :root {
                    --primary-gold: #01A9E6; /* Base color - Bright Blue */
                    --dark-gold: #00739D;    /* Headers/darker accents */
                    --light-bg: #f0f8ff;     /* Light blue tint for background */
                    --border-color: #00739D;
                    --text-dark: #333;
                    --hero-gradient-center: #5FD3FD;
                    --hero-gradient-edge: #01A9E6;
                }

                .text-primary-gold { color: var(--primary-gold) !important; }
                .text-dark-gold { color: var(--dark-gold) !important; }
                
                .product-page-wrapper {
                    max-width: 1300px;
                    margin: auto;
                    background-color: #fff;
                    box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
                }

                /* --- BUTTON STYLES (Retained) --- */
                .btn-primary-gold {
                    background-color: var(--primary-gold);
                    border-color: var(--primary-gold);
                    color: #fff;
                    font-weight: 600;
                }
                .btn-primary-gold:hover {
                    background-color: var(--dark-gold);
                    border-color: var(--dark-gold);
                }

                .btn-dark-gold {
                    background-color: var(--dark-gold);
                    border-color: var(--dark-gold);
                    color: #fff;
                    font-weight: 600;
                }
                .btn-dark-gold:hover {
                    background-color: var(--primary-gold);
                    border-color: var(--primary-gold);
                }

                .btn-outline-dark-gold {
                    color: var(--dark-gold);
                    border-color: var(--dark-gold);
                }
                .btn-outline-dark-gold:hover {
                    background-color: var(--dark-gold);
                    color: #fff;
                }
                
                /* --- SWIPER GALLERY STYLES (Fixed Alignment) --- */
                
                .product-gallery-container {
                    /* Removed fixed height. Auto-adjusts based on the main image size */
                    min-height: 450px; 
                }
                
                /* Thumbnails Wrapper (Horizontal on Mobile, Vertical on Desktop) */
                .product-thumbs-wrap {
                    flex-shrink: 0; 
                    height: 100%;
                    width: 80px; /* Fixed width for vertical column */
                }
                .product-thumbs-swiper {
                    height: 100%;
                }
                .product-thumb-item {
                    width: 80px;
                    height: 80px;
                    border: 1px solid #ddd;
                    margin-bottom: 10px; /* Spacing for vertical layout */
                    cursor: pointer;
                    padding: 2px;
                    opacity: 0.7;
                }
                .product-thumb-item.swiper-slide-thumb-active {
                    border-color: var(--primary-gold);
                    opacity: 1;
                }
                .product-thumb-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                
                /* Main Image Slider */
                .product-main-wrap {
                    flex-grow: 1;
                    position: relative;
                    /* Use aspect ratio for clean look. You might need to adjust this. */
                    padding-bottom: 100%; /* Creates 1:1 aspect ratio container */
                    height: 0; 
                    overflow: hidden;
                    border: 1px solid #eee;
                }
                .product-main-swiper {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                .product-main-slide {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background-color: #fff;
                    padding: 10px;
                }
                .main-product-image {
                    max-height: 100%;
                    width: auto;
                    object-fit: contain;
                }

                /* Swiper Navigation */
                .swiper-button-next, .swiper-button-prev {
                    color: var(--dark-gold) !important;
                    background-color: rgba(255, 255, 255, 0.9);
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    --swiper-navigation-size: 16px;
                }


                /* Mobile/Small Screen Overrides for Swiper */
                @media (max-width: 991px) {
                    .product-gallery-container {
                        min-height: auto;
                        flex-direction: column;
                    }
                    .product-thumbs-wrap {
                        width: 100%; /* Full width for horizontal scroll */
                        height: 90px;
                        margin-bottom: 15px !important;
                    }
                    .product-thumbs-swiper .swiper-wrapper {
                        /* Force horizontal display */
                        display: flex;
                        flex-direction: row; 
                    }
                    .product-thumb-item {
                        width: 80px;
                        height: 80px;
                        margin-bottom: 0; 
                        margin-right: 8px; /* Spacing for horizontal layout */
                    }
                    .product-main-wrap {
                        padding-bottom: 75%; /* Adjust main image aspect ratio on mobile (e.g., 4:3) */
                    }
                }
                
                /* Desktop Sticky Panel */
                @media (min-width: 992px) {
                    .sticky-info-panel {
                        position: sticky;
                        top: 80px; 
                        z-index: 100;
                        align-self: flex-start;
                    }
                }
            `}</style>
        </>
    );
}