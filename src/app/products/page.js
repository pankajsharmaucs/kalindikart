'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid API response');
        }

        // ✅ FIX: normalize category_slug (replace spaces with hyphen)
        const normalizedProducts = data.map((item) => ({
          ...item,
          category_slug: item.category_slug
            ? item.category_slug.toLowerCase().replace(/\s+/g, '-')
            : '',
        }));

        setProducts(normalizedProducts);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="container py-4 text-center">
        Loading products...
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-4 text-center text-danger">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumb
        title="Products"
        current="Products"
        description="Explore our curated selection of premium handcrafted products."
      />

      <div className="row g-4 mt-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center mt-4 text-muted">
          No products found.
        </p>
      )}
    </div>
  );
}
