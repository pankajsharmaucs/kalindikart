'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/Breadcrumb';
import ProductCard from '../../components/ProductCard';

export default function CollectionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionProducts = async () => {
      try {
        const response = await fetch('/api/products?collection=true');
        if (!response.ok) throw new Error('Failed to fetch collections');

        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid response');

        const normalized = data.map(p => ({
          ...p,
          category_slug: p.category_slug
            ? p.category_slug.toLowerCase().replace(/\s+/g, '-')
            : '',
        }));

        setProducts(normalized);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectionProducts();
  }, []);

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center text-danger">
        {error}
      </div>
    );
  }

  return (
    <div className="collections-page">
      <div className="container py-4">


        <div
          className="col-12 text-center py-5 mb-3"
          style={{
            background: 'linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.4)), url("/assets/parallex_bg.png")',
            backgroundColor: '#f8e8c6',
            backgroundSize: 'cover',
            borderRadius: '8px'
          }}
        >
          <h1 className="fw-bold mb-2" style={{ color: '#4a4a4a', textTransform: "capitalize", fontSize: '2rem' }}>
            Collections
          </h1>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.9rem' }}>
              <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-muted">Home</a></li>
              <li className="breadcrumb-item active" aria-current="page"> Collections</li>
            </ol>
          </nav>
        </div>

        {/* Product Grid */}
        <div className="row g-4">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {products.length === 0 && (
          <p className="text-center mt-5 text-muted">
            No products found in collections.
          </p>
        )}
      </div>

      {/* PAGE STYLES */}
      <style jsx global>{`
        .collections-page {
          background: linear-gradient(180deg, #f4fbff 0%, #ffffff 100%);
          min-height: 100vh;
        }

        .collections-header {
          text-align: center;
          max-width: 700px;
          margin: 0 auto;
        }

        .collections-header h2 {
          font-family: 'Playfair Display', serif;
          font-size: 2.4rem;
          color: var(--border-color);
          margin-bottom: 8px;
        }

        .collections-header p {
          color: #666;
          font-size: 1rem;
        }

        @media (max-width: 768px) {
          .collections-header h2 {
            font-size: 1.9rem;
          }
        }
      `}</style>
    </div>
  );
}
