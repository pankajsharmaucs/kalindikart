// app/collections/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';

export default function CollectionsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCollectionProducts = async () => {
      try {
        // Fetch products for collections
        const response = await fetch('/api/products?collection=true');

        if (!response.ok) {
          throw new Error('Failed to fetch collection products');
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error('Invalid API response');
        }

        // Normalize category_slug for URLs
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

    fetchCollectionProducts();
  }, []);

  if (loading) {
    return (
      <div className="container py-4 text-center">
        Loading collections...
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
        title="Collections"
        current="Collections"
        description="Explore our exclusive collections of handcrafted products."
      />

      <div className="row g-4 mt-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center mt-4 text-muted">
          No products found in collections.
        </p>
      )}
    </div>
  );
}
