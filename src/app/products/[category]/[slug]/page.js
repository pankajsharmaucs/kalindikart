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
        <main className="product-page-v2" style={{ backgroundColor: '#fff', color: 'var(--text-dark)' }}>
            <div className="container py-4">
                {/* BREADCRUMBS */}
                <nav className="breadcrumb-nav mb-3 text-capitalize" style={{ fontSize: '0.85rem', color: '#888' }}>
                    Home • {product.category_slug} •  <span style={{ fontWeight: '600' }}>{product.title}</span>
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
                            <h1 className="product-main-title mb-2" style={{ fontSize: '2rem', fontWeight: '600' }}>
                                {product.title}
                            </h1>

                            {/* PRICING */}
                            <div className="d-flex align-items-center gap-2 mb-1">
                                <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '0.9rem' }}>
                                    ₹{originalPrice.toLocaleString('en-IN')}
                                </span>
                                <span style={{ color: '#ff5252', fontSize: '0.8rem', fontWeight: '600' }}>
                                    ({discountPercentage}% OFF)
                                </span>
                            </div>

                            <div className="price-display mb-2">
                                <span style={{ fontSize: '1.8rem', fontWeight: '700' }}>
                                    ₹{currentPrice.toLocaleString('en-IN')}
                                </span>
                                <div style={{ fontSize: '0.7rem', color: '#888' }}>
                                    (Additional tax may apply on checkout)
                                </div>
                            </div>

                            {/* STAR RATING SECTION */}
                            <div className="rating-row mb-4 d-flex align-items-center gap-2">
                                <div className="stars" style={{ color: '#FFB400', fontSize: '1.1rem' }}>
                                    <i className="bi bi-star-fill"></i>
                                    <i className="bi bi-star-fill"></i>
                                    <i className="bi bi-star-fill"></i>
                                    <i className="bi bi-star-fill"></i>
                                    <i className="bi bi-star-half"></i>
                                </div>
                                <span style={{ fontSize: '0.85rem', color: '#666', fontWeight: '500' }}>
                                    {productRating} ({totalRatings} Reviews)
                                </span>
                            </div>



                            {/* ACTIONS */}
                            <div className="d-flex col-md-6 mb-5">

                                {alreadyInCart ? (
                                    <button className="btn-add-cart" onClick={() => router.push('/cart')}>
                                        <i className="bi bi-cart-check-fill me-2"></i> GO TO CART
                                    </button>
                                ) : (
                                    <button className="btn-add-cart" onClick={() => addToCart(product)}>
                                        <i className="bi bi-cart-plus-fill me-2"></i> ADD TO CART
                                    </button>
                                )}
                            </div>

                            {/* PRODUCT DETAILS */}
                            <div className="details-section mb-4">
                                <h6 className="text-uppercase fw-bold" style={{ fontSize: '0.8rem', color: '#888' }}>Product Details</h6>
                                <p style={{ fontSize: '0.95rem' }}>{product.title} solid Top, has a boat neck, 3/4 sleeves</p>
                            </div>


                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}