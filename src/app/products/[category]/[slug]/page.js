'use client';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductSwiper from '../../../../components/ProductSwiper';
import { useCartStore } from '../../../../stores/cartStore';

export default function ProductPage() {
    const router = useRouter();
    const params = useParams();
    const { category, slug } = params;

    const addToCart = useCartStore((state) => state.addToCart);
    const cartItems = useCartStore((state) => state.cartItems);
    const cartCount = useCartStore((state) => state.getCartCount());

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pincode, setPincode] = useState('');
    const [deliveryStatus, setDeliveryStatus] = useState(null);
    const [mainImage, setMainImage] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);

    const alreadyInCart = useMemo(() => {
        return product ? cartItems.some(item => item.product_id === product.id) : false;
    }, [product, cartItems]);

    const handleImageChange = useCallback((newImageUrl) => {
        setMainImage(newImageUrl);
    }, []);

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
        <main className="product-page-v2">
            <div className="container py-4">
                <div className="row g-4">
                    {/* LEFT SECTION: Images & Bottom Badges */}
                    <div className="col-lg-6">
                        <div className="sticky-top" style={{ top: '20px' }}>
                            <ProductSwiper
                                imageList={imageList}
                                productTitle={product.title}
                                onImageChange={handleImageChange}
                            />

                            {/* BOTTOM SLIDER BADGES (As per image) */}
                            <div className="trust-strip-icons">
                                <div className="icon-box">
                                    <i className="bi bi-shield-check"></i>
                                    <span>Secure Payment</span>
                                </div>
                                <div className="icon-box">
                                    <i className="bi bi-truck"></i>
                                    <span>Fast Delivery</span>
                                </div>
                                <div className="icon-box">
                                    <i className="bi bi-arrow-repeat"></i>
                                    <span>Easy Returns</span>
                                </div>
                                <div className="icon-box">
                                    <i className="bi bi-patch-check"></i>
                                    <span>Quality Assured</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SECTION: Info & Pricing */}
                    <div className="col-lg-6 ">
                        <div className="product-info-panel px-md-3">
                            <h1 className="product-main-title">{product.title}</h1>

                            <div className="rating-row">
                                <div className="badge bg-success me-2">{productRating} <i className="bi bi-star-fill"></i></div>
                                <span className="text-muted small">{totalRatings} Ratings & Reviews</span>
                            </div>

                            {/* PRICE BOX (As per image) */}
                            <div className="price-card-custom">
                                <div className="d-flex align-items-center gap-3">
                                    <span className="curr-price text-success">₹{currentPrice.toLocaleString('en-IN')}</span>
                                    <span className="orig-price">₹{originalPrice.toLocaleString('en-IN')}</span>
                                    <span className="disc-percent">{discountPercentage}% OFF</span>
                                </div>
                                <div className="inclusive-tax">Inclusive of all taxes</div>
                            </div>

                            {/* MINIMALIST TRUST STRIP - IMAGE STYLE */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                alignItems: 'center',
                                padding: '12px 24px',
                                backgroundColor: 'var(--light-bg, #f0f8ff)',
                                borderRadius: '12px',
                                border: '1px solid var(--border-color, #00739D)',
                                maxWidth: '600px',
                                gap: '20px'
                            }}>
                                {[
                                    { icon: 'bi-patch-check', title: 'Verified', sub: 'Business' },
                                    { icon: 'bi-shield-lock', title: 'Secured', sub: 'Payments' },
                                    { icon: 'bi-arrow-counterclockwise', title: 'Prompt', sub: 'Support' }
                                ].map((item, index) => (
                                    <div key={index} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        {/* ICON SECTION */}
                                        <i className={`bi ${item.icon}`} style={{
                                            fontSize: '1.8rem',
                                            color: 'var(--primary-gold, #01A9E6)',
                                            display: 'flex'
                                        }}></i>

                                        {/* TEXT SECTION */}
                                        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                                            <span style={{
                                                fontWeight: '700',
                                                fontSize: '0.95rem',
                                                color: '#1a1a1a'
                                            }}>
                                                {item.title}
                                            </span>
                                            <span style={{
                                                fontSize: '0.85rem',
                                                color: '#666',
                                                fontWeight: '500'
                                            }}>
                                                {item.sub}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>


                            {/* PINCODE SECTION */}
                            <div className="pincode-check-box mb-4">
                                <div className="d-flex align-items-center gap-2 mb-2">
                                    <i className="bi bi-geo-alt-fill text-primary-gold"></i>
                                    <span className="fw-bold">Check Delivery</span>
                                </div>
                                <div className="pincode-input-wrapper">
                                    <input
                                        type="text"
                                        placeholder="Enter Pincode"
                                        maxLength="6"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                    />
                                    <button onClick={() => setDeliveryStatus({ message: 'Available', type: 'success' })}>CHECK</button>
                                </div>
                                {deliveryStatus && (
                                    <div className={`mt-2 small text-${deliveryStatus.type}`}>
                                        {deliveryStatus.message}
                                    </div>
                                )}
                            </div>

                            {/* QUANTITY & ACTIONS */}
                            <div className="buy-actions-box mb-4">
                                {/* <div className="qty-selector mb-3">
                                    <label className="me-3 fw-bold">Quantity:</label>
                                    <button onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}>-</button>
                                    <input type="text" value={selectedQuantity} readOnly />
                                    <button onClick={() => setSelectedQuantity(selectedQuantity + 1)}>+</button>
                                </div> */}

                                {alreadyInCart ? (
                                    <button className="btn-buy-now btn-go" onClick={() => router.push('/cart')}>
                                        GO TO CART ({cartCount})
                                    </button>
                                ) : (
                                    <button className="btn-buy-now" onClick={() => addToCart(product)}>
                                        ADD TO CART
                                    </button>
                                )}
                            </div>

                            {/* KEY HIGHLIGHTS */}
                            <div className="highlights-card">
                                <h6>Key Highlights</h6>
                                <ul>
                                    <li>Premium Quality Craftsmanship</li>
                                    <li>Intricate Traditional Design</li>
                                    <li>Perfect for Home Decor & Gifting</li>
                                    <li>Durable Material with Long-lasting Shine</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* BOTTOM SECTION: TABBED CONTENT */}
                <div className="mt-5 border-top pt-4">
                    <h4 className="mb-4">Product Details</h4>
                    <div dangerouslySetInnerHTML={{ __html: product.description }} className="description-text" />
                </div>
            </div>

            <style jsx global>{`
                :root {
                    --primary-gold: #01A9E6;
                    --dark-gold: #00739D;
                    --light-bg: #f0f8ff;
                }

                .product-page-v2 { font-family: 'Inter', sans-serif; color: #333; }

                /* Left Side Bottom Icons */
                .trust-strip-icons {
                    display: flex;
                    justify-content: space-around;
                    margin-top: 2rem;
                    padding: 15px;
                    border-top: 1px solid #eee;
                }
                .icon-box { text-align: center; font-size: 0.75rem; color: #666; }
                .icon-box i { display: block; font-size: 1.8rem; color: var(--primary-gold); margin-bottom: 5px; }

                /* Right Side Details */
                .product-main-title { font-size: 1.5rem; font-weight: 600; margin-bottom: 10px; }
                .price-card-custom {
                    background: #fdfdfd;
                    padding: 15px 0;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 15px;
                }
                .curr-price { font-size: 2rem; font-weight: 700; }
                .orig-price { text-decoration: line-through; color: #999; font-size: 1.2rem; }
                .disc-percent { color: #388e3c; font-weight: 600; font-size: 1.2rem; }
                .inclusive-tax { font-size: 0.8rem; color: #888; margin-top: -5px; }

                .service-strip {
                    width: 377px;
                    display: flex;
                    gap: 15px;
                    font-size: 0.85rem;
                    color: #555;
                    margin-bottom: 20px;
                }
                .service-item i { 
                    color: var(--primary-gold);
                    margin-right: 5px;
                  }

                /* Actions */
                .btn-buy-now {
                    width: 377px;
                    background: #DC3C46;
                    color: white;
                    border: none;
                    padding: 14px;
                    font-weight: 700;
                    border-radius: 4px;
                    transition: 0.3s;
                }

                .btn-buy-now:hover { background: #4ec1ff; }
                .btn-go { background: var(--primary-gold); }

                /* Pincode Box */
                .pincode-input-wrapper {
                    display: flex;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    overflow: hidden;
                    max-width: 300px;
                }
                .pincode-input-wrapper input {
                    border: none;
                    padding: 8px 12px;
                    flex-grow: 1;
                    outline: none;
                }
                .pincode-input-wrapper button {
                    background: none;
                    border: none;
                    padding: 0 15px;
                    color: var(--primary-gold);
                    font-weight: 600;
                    border-left: 1px solid #eee;
                }

                /* Highlights Section */
                .highlights-card {
                    background: #fafafa;
                    padding: 20px;
                    border-radius: 8px;
                    margin-top: 25px;
                }
                .highlights-card h6 { font-weight: 700; margin-bottom: 15px; }
                .highlights-card ul { padding-left: 20px; margin: 0; }
                .highlights-card li { margin-bottom: 8px; color: #444; font-size: 0.95rem; }

                /* Qty */
                .qty-selector button {
                    width: 35px;
                    height: 35px;
                    border: 1px solid #ddd;
                    background: white;
                }
                .qty-selector input {
                    width: 50px;
                    height: 35px;
                    text-align: center;
                    border: 1px solid #ddd;
                    border-left: none;
                    border-right: none;
                }
            `}</style>
        </main>
    );
}