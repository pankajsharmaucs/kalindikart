'use client';

import React from 'react';
import Link from 'next/link';

export default function ProductCard({ product }) {
  if (!product) return null;

  const { slug, category_slug } = product;

  if (!slug || !category_slug) return null;

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

  const re_category_slug = category_slug.replace(/\s+/g, '-');

  return (
    <div className="col-lg-3 col-md-6 col-sm-6 col-6 mb-4">
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
              loading="lazy"
            />

            <div className="product-badges">
              {isNew && (
                <span className="tag-new">
                  <i className="fas fa-sparkles me-1"></i>NEW
                </span>
              )}
              {discountPercentage > 0 && (
                <span className="tag-discount">
                  <i className="fas fa-tag me-1"></i>-{discountPercentage}%
                </span>
              )}
            </div>

            <button 
              className="btn-wishlist"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title="Add to Wishlist"
            >
              <i className="far fa-heart"></i>
            </button>
          </div>

          <div className="product-info">
            <p className="product-title" title={product.title}>
              {product.title || 'Product Title'}
            </p>

            <div className="product-rating">
              <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={`fas fa-star ${star <= Math.floor(rating) ? 'star-filled' : 'star-empty'}`}
                  ></i>
                ))}
              </div>
              <span className="rating-text">
                {rating.toFixed(1)} <span className="text-muted">({reviewCount})</span>
              </span>
            </div>

            <p className="product-price">
              ₹{currentPrice.toLocaleString('en-IN')}
              {discountPercentage > 0 && (
                <>
                  <small className="original-price">
                    ₹{originalPrice.toLocaleString('en-IN')}
                  </small>
                  <span className="savings-badge">
                    Save ₹{(originalPrice - currentPrice).toLocaleString('en-IN')}
                  </span>
                </>
              )}
            </p>

            <button
              className="btn-quick-view"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              title="Quick View"
            >
              <i className="fas fa-eye me-2"></i>Quick View
            </button>
          </div>
        </div>
      </Link>

      <style jsx global>{`
        .product-card-link {
          text-decoration: none;
          display: block;
          height: 100%;
        }

        .product-card {
          background: #fff;
          border: 1px solid #eee;
          border-radius: 12px;
          overflow: hidden;
          text-align: center;
          position: relative;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
          border-color: #178ad6;
        }

        .product-img-container {
          position: relative;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          overflow: hidden;
          flex-shrink: 0;
        }

        .product-img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: transform 0.5s ease;
          display: block;
        }

        .product-card:hover .product-img {
          transform: scale(1.08);
        }

        .product-badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }

        .tag-new,
        .tag-discount {
          display: inline-flex;
          align-items: center;
          padding: 5px 12px;
          border-radius: 20px;
          font-size: 0.75em;
          font-weight: 700;
          color: #fff;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
        }

        .tag-new {
          background: linear-gradient(135deg, #e79e3e, #e95943);
        }

        .tag-discount {
          background: linear-gradient(135deg, #dc3545, #c82333);
        }

        .btn-wishlist {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 3;
          transition: all 0.3s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          padding: 0;
        }

        .btn-wishlist:hover {
          background: #fff;
          transform: scale(1.15);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .btn-wishlist i {
          font-size: 1.1em;
          color: #dc3545;
          transition: all 0.3s ease;
        }

        .btn-wishlist:hover i {
          font-weight: 900;
        }

        .product-info {
          padding: 15px 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .product-title {
          font-size: 1em;
          font-weight: 600;
          color: #333;
          margin: 0 0 10px 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          transition: color 0.3s ease;
          line-height: 1.4;
        }

        .product-card:hover .product-title {
          color: #178ad6;
        }

        .product-rating {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 6px;
          margin-bottom: 10px;
          font-size: 0.85em;
        }

        .stars {
          display: flex;
          gap: 2px;
        }

        .stars i {
          font-size: 0.9em;
        }

        .star-filled {
          color: #ffc107;
        }

        .star-empty {
          color: #e0e0e0;
        }

        .rating-text {
          font-weight: 600;
          color: #666;
          white-space: nowrap;
        }

        .text-muted {
          color: #999;
          font-weight: 400;
          font-size: 0.9em;
        }

        .product-price {
          font-size: 1.3em;
          font-weight: 700;
          color: #178ad6;
          margin: 10px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .original-price {
          font-size: 0.7em;
          color: #999;
          text-decoration: line-through;
          font-weight: 500;
          display: block;
        }

        .savings-badge {
          font-size: 0.65em;
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 3px 10px;
          border-radius: 12px;
          font-weight: 600;
          display: inline-block;
          margin-top: 2px;
          white-space: nowrap;
        }

        .btn-quick-view {
          position: absolute;
          bottom: -50px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 25px;
          font-size: 0.9em;
          font-weight: 600;
          cursor: pointer;
          opacity: 0;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(23, 138, 214, 0.4);
          white-space: nowrap;
          z-index: 10;
        }

        .product-card:hover .btn-quick-view {
          bottom: 15px;
          opacity: 1;
        }

        .btn-quick-view:hover {
          background: linear-gradient(135deg, #1577b8, #20a5b3);
          transform: translateX(-50%) translateY(-3px);
          box-shadow: 0 6px 16px rgba(23, 138, 214, 0.5);
        }

        @media (max-width: 1199px) {
          .product-img {
            height: 220px;
          }
          .product-price {
            font-size: 1.2em;
          }
        }

        @media (max-width: 991px) {
          .product-img {
            height: 200px;
          }
          .product-price {
            font-size: 1.15em;
          }
          .product-card:hover {
            transform: translateY(-4px);
          }
        }

        @media (max-width: 768px) {
          .product-img {
            height: 180px;
          }
          .tag-new,
          .tag-discount {
            font-size: 0.7em;
            padding: 4px 10px;
          }
          .btn-wishlist {
            width: 32px;
            height: 32px;
          }
          .product-info {
            padding: 12px 10px;
          }
          .product-title {
            font-size: 0.95em;
            margin-bottom: 8px;
          }
          .product-rating {
            font-size: 0.8em;
            margin-bottom: 8px;
          }
          .product-price {
            font-size: 1.1em;
            margin: 8px 0;
          }
          .btn-quick-view {
            font-size: 0.85em;
            padding: 8px 16px;
          }
        }

        @media (max-width: 576px) {
          .product-img {
            height: 160px;
          }
          .product-title {
            font-size: 0.9em;
            margin-bottom: 6px;
          }
          .product-rating {
            font-size: 0.75em;
            margin-bottom: 6px;
          }
          .product-info {
            padding: 10px 8px;
          }
          .tag-new,
          .tag-discount {
            font-size: 0.65em;
            padding: 3px 8px;
          }
          .btn-wishlist {
            width: 30px;
            height: 30px;
            top: 8px;
            right: 8px;
          }
          .product-price {
            font-size: 1em;
            margin: 6px 0;
          }
          .btn-quick-view {
            font-size: 0.8em;
            padding: 6px 12px;
          }
          .product-card:hover {
            transform: translateY(-2px);
          }
        }
      `}</style>
    </div>
  );
}
