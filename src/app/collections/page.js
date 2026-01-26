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
        {/* <Breadcrumb
          title="Collections"
          current="Collections"
          description="Explore our exclusive handcrafted luxury collections."
        /> */}

        {/* Top Info Strip */}
        <div className="collections-header mt-4 mb-4">
          {/* <h2>Exclusive Collections</h2>
          <p>
            Handcrafted bronze & brass masterpieces curated for timeless elegance.
          </p> */}
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
