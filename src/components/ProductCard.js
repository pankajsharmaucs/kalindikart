'use client';

import React from 'react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  // Hard guard to prevent "undefined/products/..."
  if (!product) return null;

  const { slug, category_slug } = product;

  if (!slug || !category_slug) return null;

  // Safely parse images (MySQL JSON string or array)
  let images = [];
  try {
    images = Array.isArray(product.images)
      ? product.images
      : JSON.parse(product.images || '[]');
  } catch {
    images = [];
  }

  const imageSrc =
    images.length > 0
      ? `/${images[0]}`
      : 'https://via.placeholder.com/300x200';

  const isNew = Boolean(product.isNew);
  const discountPercentage = Number(product.discount) || 0;
  const currentPrice = Number(product.price) || 0;

  const originalPrice =
    discountPercentage > 0 && discountPercentage < 100
      ? Math.round(currentPrice / (1 - discountPercentage / 100))
      : currentPrice;

  const rating = product.rating ?? 4.7;
  const reviewCount = product.reviewCount ?? 100;

  const re_category_slug = category_slug.replace(' ', '-');


  return (
    <div className="col-lg-3 col-md-6 col-sm-6 mb-4">
      <Link
        href={`/products/${re_category_slug}/${slug}`}
        className="product-card-link"
      >
        <div className="product-card">
          <div className="product-img-container">
            <img
              src={imageSrc}
              alt={product.title || 'Product'}
              className="product-img"
            />

            {isNew && <span className="tag-new">NEW</span>}
            {discountPercentage > 0 && (
              <span className="tag-discount">-{discountPercentage}%</span>
            )}
          </div>

          <div className="product-info">
            <p className="product-title">
              {product.title || 'Product Title'}
            </p>

            <p className="product-price">
              ₹{currentPrice.toLocaleString('en-IN')}
              {discountPercentage > 0 && (
                <small className="original-price">
                  ₹{originalPrice.toLocaleString('en-IN')}
                </small>
              )}
            </p>

            <div className="d-flex justify-content-center align-items-center small mt-2 text-muted">
              ⭐ {rating.toFixed(1)} ({reviewCount} reviews)
            </div>

            <button
              className="btn-quick-view"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Open quick view modal here
              }}
            >
              Quick View
            </button>
          </div>
        </div>
      </Link>

      <style jsx global>{`
        .product-card-link {
          text-decoration: none;
          display: block;
        }
        .product-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
          text-align: center;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
        }
        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
        }
        .product-img-container {
          position: relative;
          background: #f8f8f8;
        }
        .product-img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .product-card:hover .product-img {
          transform: scale(1.05);
        }
        .tag-new,
        .tag-discount {
          position: absolute;
          width:54px;
          top: 15px;
          left: 15px;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8em;
          font-weight: bold;
          color: #fff;
          z-index: 10;
        }
        .tag-new {
          background-color: var(--primary-gold);
        }
        .tag-discount {
          background-color: #dc3545;
        }
        .product-info {
          padding: 15px 10px;
        }
        .product-title {
          font-size: 1em;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .product-price {
          font-size: 1.2em;
          font-weight: bold;
        }
        .original-price {
          font-size: 0.75em;
          color: #999;
          text-decoration: line-through;
          margin-left: 8px;
        }
        .btn-quick-view {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.8);
          color: white;
          border: none;
          padding: 8px 15px;
          border-radius: 4px;
          font-size: 0.9em;
          cursor: pointer;
          opacity: 0;
          transition: bottom 0.3s, opacity 0.3s;
        }
        .product-card:hover .btn-quick-view {
          bottom: 20px;
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
