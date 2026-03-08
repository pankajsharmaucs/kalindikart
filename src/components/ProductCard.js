'use client';

import React from 'react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  if (!product) return null;

  const { slug, category_slug, id, title, discount, price, rating = 4.5 } = product;
  const product_id = Number(id) || 0;

  // Handle Images dynamically
  const rawImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
  const imageList = rawImages.map(img => img.startsWith('http') ? img : `/assets/products/${product_id}/${img}`);


  const discountPercentage = Number(discount) || 0;
  const currentPrice = Number(price) || 0;
  const originalPrice = discountPercentage > 0 ? Math.round(currentPrice / (1 - discountPercentage / 100)) : currentPrice;

  const re_category_slug = category_slug?.replace(/\s+/g, '-') || 'all';

  return (
    <div className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-6 mb-4">
      <Link href={`/products/${re_category_slug}/${slug}`} className="product-card-link">
        <div className="product-card">

          {/* Image Container using --light-bg */}
          <div className="product-img-container">
            <img src={imageList[0]} alt={title} className="product-img main-img" loading="lazy" />
            <img src={imageList[1]} alt={title} className="product-img hover-img" loading="lazy" />

            {/* Circular Discount Badge using --dark-gold (Blue accent) */}
            {discountPercentage > 0 && (
              <div className="discount-circle">
                -{discountPercentage}%
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h3 className="product-title">{title || 'Handcrafted Brass Idol'}</h3>

            {/* Rating Section using --primary-gold (Bright Blue) */}
            <div className="rating-container">
              <span className="stars">
                {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
              </span>
              <span className="rating-value">({rating})</span>
            </div>

            {/* Price Section using --dark-gold */}
            <div className="price-container">
              <span className="current-price">Rs. {currentPrice.toLocaleString('en-IN')}.00</span>
              {discountPercentage > 0 && (
                <span className="original-price-strike">
                  Rs. {originalPrice.toLocaleString('en-IN')}.00
                </span>
              )}
            </div>

            {/* Color Swatches */}
            {/* <div className="color-swatches">
              <span className="swatch" style={{ backgroundColor: '#01A9E6' }}></span>
              <span className="swatch" style={{ backgroundColor: '#00739D' }}></span>
              <span className="swatch" style={{ backgroundColor: '#5FD3FD' }}></span>
            </div> */}
          </div>
        </div>
      </Link>

      <style jsx global>{`
        .product-card {
          background: #fff;
          transition: all 0.3s ease;
          border-radius: 8px;
          overflow: hidden;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--light-bg);
        }

        .product-img-container {
          position: relative;
          background-color: var(--light-bg); /* Updated to your Light Blue tint */
          aspect-ratio: 1/1;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-img {
          width: 100%;
          object-fit: contain;
          transition: opacity 0.4s ease, transform 0.4s ease;
          position: absolute;
        }

        .hover-img {
          opacity: 0;
        }

        .product-card:hover .main-img {
          opacity: 0;
        }

        .product-card:hover .hover-img {
          opacity: 1;
          // transform: scale(1.05);
        }

        .discount-circle {
          position: absolute;
          top: 12px;
          left: 12px;
          width: 48px;
          height: 48px;
          background-color: var(--dark-gold); /* Using your Dark Blue */
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 0.8rem;
          z-index: 2;
        }

        .product-info {
          padding: 15px 8px;
          text-align: left;
        }

        .product-title {
          font-size: 1rem;
          font-weight: 600;
          color: var(--text-dark);
          margin-bottom: 6px;
          line-height: 1.4;
          height: 2.8em;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .rating-container {
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .stars {
          color: var(--primary-gold); /* Updated to your Bright Blue */
          font-size: 0.9rem;
          letter-spacing: 1px;
        }

        .rating-value {
          font-size: 0.8rem;
          color: #888;
        }

        .price-container {
          display: flex;
          flex-direction: column;
          margin-bottom: 12px;
        }

        .current-price {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--dark-gold); /* Updated to your Dark Blue */
        }

        .original-price-strike {
          font-size: 0.85rem;
          color: #999;
          text-decoration: line-through;
          margin-top: 2px;
        }

        .color-swatches {
          display: flex;
          gap: 6px;
        }

        .swatch {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 1px solid var(--light-bg);
          cursor: pointer;
          transition: transform 0.2s ease;
        }

        .swatch:hover {
          transform: scale(1.2);
        }

        .product-card-link {
          text-decoration: none !important;
        }

        @media (max-width: 576px) {
          .product-title { font-size: 0.9rem; height: 3.2em; }
          .discount-circle { width: 38px; height: 38px; font-size: 0.65rem; }
          .current-price { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}