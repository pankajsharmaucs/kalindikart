// ProductPage.jsx
'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductSwiper from '../../../../components/ProductSwiper';
import { useCartStore } from '../../../../stores/cartStore';

export default function ProductPage() {
    const router = useRouter();
    const params = useParams();
    const { category, slug } = params;

    // Zustand Store
    const addToCart = useCartStore((state) => state.addToCart);
    const cartCount = useCartStore((state) => state.getCartCount());

    // State Management
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const alreadyInCart = useCartStore((state) =>
        product ? state.cartItems.some(item => item.product_id === product.id) : false
    );

    const handleImageChange = useCallback((newImageUrl) => {
        setMainImage(newImageUrl);
    }, []);

    // Fetch Product
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(`/api/products?slug=${slug}`);
                if (!res.ok) throw new Error('Product not found');
                const data = await res.json();
                if (!data || Object.keys(data).length === 0) throw new Error('Product data is empty');

                let productCategorySlug = data.category_slug?.toLowerCase().replace(' ', '-');
                if (productCategorySlug !== category) throw new Error('Invalid category URL');

                setProduct(data);

                let initialImages = [];
                try {
                    initialImages = typeof data.images === 'string' ? JSON.parse(data.images) : data.images || [];
                } catch {
                    initialImages = Array.isArray(data.images) ? data.images : (data.images ? [data.images] : []);
                }
                if (initialImages.length > 0) setMainImage(initialImages[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [slug, category]);

    // Pincode Check
    const handlePincodeCheck = (e) => {
        e.preventDefault();
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

    // Calculated Values
    const { currentPrice, originalPrice, discountPercentage, imageList, specifications, productRating, totalRatings } = useMemo(() => {
        let images = [];
        try {
            images = typeof product?.images === 'string' ? JSON.parse(product.images) : product?.images || [];
            images = Array.isArray(images) ? images : (images ? [images] : []);
        } catch { }

        const fallbackImage = 'https://via.placeholder.com/600x600/01A9E6/FFFFFF?text=Product+Image';
        const imageList = images.length ? images : [fallbackImage];
        const discountPercentage = Number(product?.discount) || 0;
        const currentPrice = Number(product?.price) || 0;
        const originalPrice = discountPercentage > 0 && discountPercentage < 100
            ? Math.round(currentPrice / (1 - discountPercentage / 100))
            : currentPrice;

        const specifications = [
            { key: 'Brand', value: product?.brand_name || 'N/A' },
            { key: 'Color', value: product?.color || 'Blue' },
            { key: 'Material', value: product?.material || 'Synthetic' },
            { key: 'Weight', value: product?.weight || 'N/A' },
            { key: 'SKU', value: product?.sku || 'N/A' },
        ];

        return {
            currentPrice,
            originalPrice,
            discountPercentage,
            imageList,
            specifications,
            productRating: Number(product?.rating) || 4.5,
            totalRatings: Number(product?.total_ratings) || 12987
        };
    }, [product]);

    const keyFeatures = [
        "Premium Quality Materials",
        "Expertly Handcrafted Design",
        "Perfect for Gifting",
        "Durable & Long-lasting",
    ];

    const reviewDistribution = [
        { stars: 5, count: 8500, percentage: 65 },
        { stars: 4, count: 3000, percentage: 23 },
        { stars: 3, count: 1000, percentage: 8 },
        { stars: 2, count: 300, percentage: 2 },
        { stars: 1, count: 187, percentage: 1.5 },
    ];

    const handleAddToCart = async () => {
        await addToCart(product);
    };

    const handleGoToCart = () => {
        router.push('/cart');
    };

    // Loading State
    if (loading)
        return (
            <div className="loading-container">
                <div className="spinner-wrapper">
                    <div className="spinner-border text-primary-gold" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading product details...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="error-container">
                <i className="bi bi-exclamation-circle text-danger display-1 mb-3"></i>
                <h3>Oops! Something went wrong</h3>
                <p className="text-muted">{error}</p>
            </div>
        );

    if (!product) return null;

    return (
        <>
            <main className="product-page-premium">
                <div className="container-fluid px-0">
                    {/* Breadcrumb */}
                    <div className="breadcrumb-wrapper">
                        <div className="container">
                            <nav aria-label="breadcrumb">
                                <ol className="breadcrumb mb-0">
                                    <li className="breadcrumb-item"><a href="/">Home</a></li>
                                    {product.category_name && (
                                        <li className="breadcrumb-item">
                                            <a href={`/category/${product.category_slug?.toLowerCase().replace(/\s+/g, '-')}`}>
                                                {product.category_name}
                                            </a>
                                        </li>
                                    )}
                                    <li className="breadcrumb-item active">{product.title}</li>
                                </ol>
                            </nav>
                        </div>
                    </div>

                    <div className="container product-container">
                        <div className="row g-5">
                            {/* LEFT: Image Gallery */}
                            <div className="col-lg-6">
                                <div className="product-gallery-section fade-in">
                                    <ProductSwiper
                                        imageList={imageList}
                                        productTitle={product.title}
                                        onImageChange={handleImageChange}
                                    />
                                    
                                    {/* Trust Badges */}
                                    <div className="trust-badges mt-4">
                                        <div className="badge-item">
                                            <i className="bi bi-shield-check"></i>
                                            <span>Secure Payment</span>
                                        </div>
                                        <div className="badge-item">
                                            <i className="bi bi-truck"></i>
                                            <span>Fast Delivery</span>
                                        </div>
                                        <div className="badge-item">
                                            <i className="bi bi-award"></i>
                                            <span>Premium Quality</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* RIGHT: Product Details */}
                            <div className="col-lg-6">
                                <div className="product-details-section fade-in-delay">
                                    {/* Title */}
                                    <h1 className="product-title">{product.title}</h1>

                                    {/* Rating */}
                                    <div className="rating-section">
                                        <div className="stars">
                                            {[...Array(5)].map((_, i) => (
                                                <i key={i} className={`bi bi-star${i < Math.floor(productRating) ? '-fill' : ''}`}></i>
                                            ))}
                                            <span className="rating-value">{productRating}</span>
                                        </div>
                                        <span className="review-count">({totalRatings.toLocaleString()} reviews)</span>
                                    </div>

                                    {/* Price */}
                                    <div className="price-section">
                                        <div className="price-main">₹{currentPrice.toLocaleString('en-IN')}</div>
                                        {discountPercentage > 0 && (
                                            <>
                                                <div className="price-original">₹{originalPrice.toLocaleString('en-IN')}</div>
                                                <div className="price-discount">{discountPercentage}% OFF</div>
                                            </>
                                        )}
                                    </div>

                                    <div className="divider"></div>

                                    {/* Key Features */}
                                    <div className="features-section">
                                        <h6 className="section-label">Key Highlights</h6>
                                        <ul className="features-list">
                                            {keyFeatures.map((feature, index) => (
                                                <li key={index}>
                                                    <i className="bi bi-check-circle-fill"></i>
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Quantity Selector */}
                                    <div className="quantity-section">
                                        <h6 className="section-label">Quantity</h6>
                                        <div className="quantity-selector">
                                            <button 
                                                className="qty-btn"
                                                onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                                            >
                                                <i className="bi bi-dash"></i>
                                            </button>
                                            <input 
                                                type="text" 
                                                value={selectedQuantity} 
                                                readOnly 
                                                className="qty-input"
                                            />
                                            <button 
                                                className="qty-btn"
                                                onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                                            >
                                                <i className="bi bi-plus"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Pincode Check */}
                                    <div className="pincode-section">
                                        <h6 className="section-label">
                                            <i className="bi bi-geo-alt me-2"></i>Check Delivery
                                        </h6>
                                        <form onSubmit={handlePincodeCheck} className="pincode-form">
                                            <input
                                                type="text"
                                                className="pincode-input"
                                                placeholder="Enter Pincode"
                                                maxLength="6"
                                                value={pincode}
                                                onChange={(e) => setPincode(e.target.value)}
                                            />
                                            <button type="submit" className="pincode-btn">CHECK</button>
                                        </form>
                                        {deliveryStatus && (
                                            <div className={`delivery-status status-${deliveryStatus.type}`}>
                                                <i className={`bi bi-${deliveryStatus.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i>
                                                {deliveryStatus.message}
                                            </div>
                                        )}
                                    </div>

                                    <div className="divider"></div>

                                    {/* Action Buttons */}
                                    <div className="action-buttons">
                                        {alreadyInCart ? (
                                            <button className="btn-go-cart" onClick={handleGoToCart}>
                                                <i className="bi bi-cart-check me-2"></i>
                                                GO TO CART
                                                <span className="cart-badge">{cartCount}</span>
                                            </button>
                                        ) : (
                                            <button className="btn-add-cart" onClick={handleAddToCart}>
                                                <i className="bi bi-cart-plus me-2"></i>
                                                ADD TO CART
                                            </button>
                                        )}
                                    </div>

                                    {/* Additional Info */}
                                    <div className="info-tags">
                                        <div className="info-tag">
                                            <i className="bi bi-gift"></i>
                                            <span>Free Gift Wrapping</span>
                                        </div>
                                        <div className="info-tag">
                                            <i className="bi bi-arrow-repeat"></i>
                                            <span>{product.return_policy || '10-Day Easy Return'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tabs Section */}
                        <div className="product-tabs-section mt-5">
                            <ul className="nav nav-tabs premium-tabs" role="tablist">
                                <li className="nav-item">
                                    <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#description">
                                        Description
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#specifications">
                                        Specifications
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button className="nav-link" data-bs-toggle="tab" data-bs-target="#reviews">
                                        Reviews ({totalRatings})
                                    </button>
                                </li>
                            </ul>

                            <div className="tab-content premium-tab-content">
                                {/* Description */}
                                <div className="tab-pane fade show active" id="description">
                                    <div className="tab-content-inner">
                                        <div dangerouslySetInnerHTML={{ __html: product.description || '<p>No description available.</p>' }} />
                                    </div>
                                </div>

                                {/* Specifications */}
                                <div className="tab-pane fade" id="specifications">
                                    <div className="tab-content-inner">
                                        <table className="specs-table">
                                            <tbody>
                                                {specifications.map((spec, index) => (
                                                    <tr key={index}>
                                                        <td className="spec-key">{spec.key}</td>
                                                        <td className="spec-value">{spec.value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Reviews */}
                                <div className="tab-pane fade" id="reviews">
                                    <div className="tab-content-inner">
                                        <div className="reviews-summary">
                                            <div className="rating-overview">
                                                <div className="overall-rating">
                                                    <div className="rating-number">{productRating}</div>
                                                    <div className="stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className={`bi bi-star${i < Math.floor(productRating) ? '-fill' : ''}`}></i>
                                                        ))}
                                                    </div>
                                                    <div className="total-reviews">{totalRatings.toLocaleString()} ratings</div>
                                                </div>
                                            </div>

                                            <div className="rating-bars">
                                                {reviewDistribution.map((dist) => (
                                                    <div key={dist.stars} className="rating-bar-row">
                                                        <span className="star-label">{dist.stars} <i className="bi bi-star-fill"></i></span>
                                                        <div className="progress-wrapper">
                                                            <div className="progress-bar-custom" style={{ width: `${dist.percentage}%` }}></div>
                                                        </div>
                                                        <span className="count-label">{dist.count.toLocaleString()}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="reviews-list">
                                            <h6 className="mb-4">Customer Reviews</h6>
                                            <div className="review-card">
                                                <div className="review-header">
                                                    <div className="reviewer-info">
                                                        <div className="reviewer-avatar">RS</div>
                                                        <div>
                                                            <div className="reviewer-name">Riya Sharma</div>
                                                            <div className="review-date">1 week ago</div>
                                                        </div>
                                                    </div>
                                                    <div className="review-stars">
                                                        {[...Array(5)].map((_, i) => (
                                                            <i key={i} className="bi bi-star-fill"></i>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="review-body">
                                                    <h6 className="review-title">Excellent Product!</h6>
                                                    <p className="review-text">The quality is outstanding and the craftsmanship is evident. Perfect for gifting!</p>
                                                </div>
                                            </div>

                                            <div className="review-card">
                                                <div className="review-header">
                                                    <div className="reviewer-info">
                                                        <div className="reviewer-avatar">VK</div>
                                                        <div>
                                                            <div className="reviewer-name">Vikram Kumar</div>
                                                            <div className="review-date">3 days ago</div>
                                                        </div>
                                                    </div>
                                                    <div className="review-stars">
                                                        {[...Array(4)].map((_, i) => (
                                                            <i key={i} className="bi bi-star-fill"></i>
                                                        ))}
                                                        <i className="bi bi-star"></i>
                                                    </div>
                                                </div>
                                                <div className="review-body">
                                                    <h6 className="review-title">Great Value</h6>
                                                    <p className="review-text">Very happy with my purchase. Fast delivery and secure packaging.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                /* ========== PREMIUM PRODUCT PAGE STYLES ========== */
                
                :root {
                    --primary: #01A9E6;
                    --primary-dark: #00739D;
                    --success: #10b981;
                    --warning: #f59e0b;
                    --danger: #ef4444;
                    --text-primary: #1f2937;
                    --text-secondary: #6b7280;
                    --border: #e5e7eb;
                    --bg-light: #f9fafb;
                    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.1);
                    --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
                    --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
                    --radius: 12px;
                    --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                /* Loading & Error States */
                .loading-container, .error-container {
                    min-height: 60vh;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 3rem 1rem;
                }

                .spinner-wrapper {
                    text-align: center;
                }

                /* Main Container */
                .product-page-premium {
                    background: #fff;
                    min-height: 100vh;
                    padding-bottom: 4rem;
                }

                /* Breadcrumb */
                .breadcrumb-wrapper {
                    background: var(--bg-light);
                    padding: 1rem 0;
                    border-bottom: 1px solid var(--border);
                }

                .breadcrumb {
                    margin: 0;
                    font-size: 0.875rem;
                }

                .breadcrumb-item a {
                    color: var(--text-secondary);
                    text-decoration: none;
                    transition: var(--transition);
                }

                .breadcrumb-item a:hover {
                    color: var(--primary);
                }

                .breadcrumb-item.active {
                    color: var(--text-primary);
                }

                /* Product Container */
                .product-container {
                    max-width: 1400px;
                    padding-top: 2rem;
                }

                /* Animations */
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .fade-in {
                    animation: fadeIn 0.6s ease-out;
                }

                .fade-in-delay {
                    animation: fadeIn 0.6s ease-out 0.2s backwards;
                }

                /* Gallery Section */
                .product-gallery-section {
                    position: sticky;
                    top: 100px;
                }

                /* Trust Badges */
                .trust-badges {
                    display: flex;
                    gap: 1rem;
                    padding: 1.5rem;
                    background: var(--bg-light);
                    border-radius: var(--radius);
                }

                .badge-item {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                    text-align: center;
                }

                .badge-item i {
                    font-size: 1.5rem;
                    color: var(--primary);
                }

                /* Product Details */
                .product-details-section {
                    padding: 0 1rem;
                }

                .product-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 1rem;
                    line-height: 1.3;
                }

                /* Rating Section */
                .rating-section {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .stars {
                    display: flex;
                    align-items: center;
                    gap: 0.25rem;
                }

                .stars i {
                    color: #fbbf24;
                    font-size: 1.125rem;
                }

                .rating-value {
                    margin-left: 0.5rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .review-count {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                /* Price Section */
                .price-section {
                    display: flex;
                    align-items: baseline;
                    gap: 1rem;
                    margin-bottom: 1.5rem;
                }

                .price-main {
                    font-size: 2.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .price-original {
                    font-size: 1.5rem;
                    color: var(--text-secondary);
                    text-decoration: line-through;
                }

                .price-discount {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 6px;
                    font-weight: 600;
                    font-size: 0.875rem;
                }

                /* Divider */
                .divider {
                    height: 1px;
                    background: var(--border);
                    margin: 1.5rem 0;
                }

                /* Features Section */
                .section-label {
                    font-size: 0.875rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 1rem;
                }

                .features-list {
                    list-style: none;
                    padding: 0;
                    margin: 0 0 1.5rem 0;
                    display: grid;
                    gap: 0.75rem;
                }

                .features-list li {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    color: var(--text-primary);
                }

                .features-list i {
                    color: var(--success);
                    font-size: 1.25rem;
                    flex-shrink: 0;
                }

                /* Quantity Selector */
                .quantity-section {
                    margin-bottom: 1.5rem;
                }

                .quantity-selector {
                    display: inline-flex;
                    align-items: center;
                    border: 2px solid var(--border);
                    border-radius: var(--radius);
                    overflow: hidden;
                }

                .qty-btn {
                    width: 3rem;
                    height: 3rem;
                    border: none;
                    background: white;
                    color: var(--text-primary);
                    font-size: 1.25rem;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .qty-btn:hover {
                    background: var(--bg-light);
                }

                .qty-input {
                    width: 4rem;
                    height: 3rem;
                    border: none;
                    border-left: 2px solid var(--border);
                    border-right: 2px solid var(--border);
                    text-align: center;
                    font-weight: 600;
                    font-size: 1.125rem;
                }

                /* Pincode Section */
                .pincode-section {
                    margin-bottom: 1.5rem;
                }

                .pincode-form {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 0.75rem;
                }

                .pincode-input {
                    flex: 1;
                    padding: 0.75rem 1rem;
                    border: 2px solid var(--border);
                    border-radius: var(--radius);
                    font-size: 0.938rem;
                    transition: var(--transition);
                }

                .pincode-input:focus {
                    outline: none;
                    border-color: var(--primary);
                }

                .pincode-btn {
                    padding: 0.75rem 1.5rem;
                    background: white;
                    border: 2px solid var(--primary);
                    color: var(--primary);
                    border-radius: var(--radius);
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .pincode-btn:hover {
                    background: var(--primary);
                    color: white;
                }

                .delivery-status {
                    padding: 0.75rem 1rem;
                    border-radius: var(--radius);
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .status-success {
                    background: #d1fae5;
                    color: #065f46;
                }

                .status-danger, .status-warning {
                    background: #fee2e2;
                    color: #991b1b;
                }

                /* Action Buttons */
                .action-buttons {
                    display: grid;
                    gap: 0.75rem;
                    margin-bottom: 1.5rem;
                }

                .btn-add-cart, .btn-go-cart {
                    padding: 1rem 2rem;
                    border: none;
                    border-radius: var(--radius);
                    font-size: 1.125rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: var(--transition);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    position: relative;
                }

                .btn-add-cart {
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    color: white;
                    box-shadow: var(--shadow-md);
                }

                .btn-add-cart:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }

                .btn-go-cart {
                    background: linear-gradient(135deg, #10b981, #059669);
                    color: white;
                    box-shadow: var(--shadow-md);
                }

                .btn-go-cart:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-lg);
                }

                .cart-badge {
                    position: absolute;
                    top: -8px;
                    right: -8px;
                    background: white;
                    color: var(--success);
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.875rem;
                    font-weight: 700;
                    box-shadow: var(--shadow-md);
                }

                /* Info Tags */
                .info-tags {
                    display: flex;
                    gap: 1.5rem;
                    padding: 1rem;
                    background: var(--bg-light);
                    border-radius: var(--radius);
                }

                .info-tag {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .info-tag i {
                    color: var(--primary);
                    font-size: 1.25rem;
                }

                /* Tabs */
                .product-tabs-section {
                    padding: 2rem 0;
                }

                .premium-tabs {
                    border-bottom: 2px solid var(--border);
                    gap: 2rem;
                }

                .premium-tabs .nav-link {
                    border: none;
                    background: none;
                    padding: 1rem 0;
                    font-weight: 600;
                    color: var(--text-secondary);
                    position: relative;
                    cursor: pointer;
                    transition: var(--transition);
                }

                .premium-tabs .nav-link:hover {
                    color: var(--primary);
                }

                .premium-tabs .nav-link.active {
                    color: var(--primary);
                }

                .premium-tabs .nav-link.active::after {
                    content: '';
                    position: absolute;
                    bottom: -2px;
                    left: 0;
                    right: 0;
                    height: 3px;
                    background: var(--primary);
                    border-radius: 3px 3px 0 0;
                }

                .premium-tab-content {
                    padding: 2rem 0;
                }

                .tab-content-inner {
                    max-width: 900px;
                }

                /* Specifications Table */
                .specs-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .specs-table tr {
                    border-bottom: 1px solid var(--border);
                }

                .specs-table td {
                    padding: 1rem 0;
                }

                .spec-key {
                    font-weight: 600;
                    color: var(--text-secondary);
                    width: 40%;
                }

                .spec-value {
                    color: var(--text-primary);
                }

                /* Reviews */
                .reviews-summary {
                    display: grid;
                    grid-template-columns: 1fr 2fr;
                    gap: 3rem;
                    margin-bottom: 3rem;
                    padding: 2rem;
                    background: var(--bg-light);
                    border-radius: var(--radius);
                }

                .overall-rating {
                    text-align: center;
                }

                .rating-number {
                    font-size: 4rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    line-height: 1;
                }

                .overall-rating .stars {
                    justify-content: center;
                    margin: 0.5rem 0;
                }

                .total-reviews {
                    color: var(--text-secondary);
                    font-size: 0.875rem;
                }

                .rating-bars {
                    display: grid;
                    gap: 0.75rem;
                }

                .rating-bar-row {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }

                .star-label {
                    width: 3rem;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .star-label i {
                    color: #fbbf24;
                    font-size: 0.75rem;
                }

                .progress-wrapper {
                    flex: 1;
                    height: 8px;
                    background: var(--border);
                    border-radius: 4px;
                    overflow: hidden;
                }

                .progress-bar-custom {
                    height: 100%;
                    background: linear-gradient(90deg, #fbbf24, #f59e0b);
                    border-radius: 4px;
                    transition: var(--transition);
                }

                .count-label {
                    width: 4rem;
                    text-align: right;
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                /* Review Cards */
                .reviews-list {
                    display: grid;
                    gap: 1.5rem;
                }

                .review-card {
                    padding: 1.5rem;
                    border: 1px solid var(--border);
                    border-radius: var(--radius);
                    transition: var(--transition);
                }

                .review-card:hover {
                    box-shadow: var(--shadow-md);
                }

                .review-header {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1rem;
                }

                .reviewer-info {
                    display: flex;
                    gap: 1rem;
                    align-items: center;
                }

                .reviewer-avatar {
                    width: 3rem;
                    height: 3rem;
                    border-radius: 50%;
                    background: linear-gradient(135deg, var(--primary), var(--primary-dark));
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: 700;
                    font-size: 1.125rem;
                }

                .reviewer-name {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .review-date {
                    font-size: 0.875rem;
                    color: var(--text-secondary);
                }

                .review-stars i {
                    color: #fbbf24;
                }

                .review-title {
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 0.5rem;
                }

                .review-text {
                    color: var(--text-secondary);
                    line-height: 1.6;
                }

                /* Responsive */
                @media (max-width: 991px) {
                    .product-gallery-section {
                        position: static;
                    }

                    .trust-badges {
                        gap: 0.5rem;
                    }

                    .badge-item {
                        font-size: 0.75rem;
                    }

                    .badge-item i {
                        font-size: 1.25rem;
                    }

                    .product-title {
                        font-size: 1.5rem;
                    }

                    .price-main {
                        font-size: 2rem;
                    }

                    .reviews-summary {
                        grid-template-columns: 1fr;
                        gap: 2rem;
                    }
                }

                @media (max-width: 576px) {
                    .price-section {
                        flex-wrap: wrap;
                    }

                    .info-tags {
                        flex-direction: column;
                        gap: 0.75rem;
                    }

                    .premium-tabs {
                        gap: 1rem;
                    }
                }
            `}</style>
        </>
    );
}
