'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';

// Helper to create slug if backend doesn't provide one
const createSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

export default function CategoryListPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/category')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
      })
      .then((data) => {
        setCategories(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Category fetch error:', err);
        setError(err.message || 'Something went wrong');
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-4">
      <Breadcrumb
        title="Category"
        current="Category"
        description="Explore all our handcrafted product categories."
      />


      {loading && <p className="text-center">Loading categories...</p>}
      {error && <p className="text-center text-danger">Error: {error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p className="text-center text-muted">No categories found.</p>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="row g-4">
          {categories.map((cat) => {
            const slug = cat.slug ? createSlug(cat.slug) : createSlug(cat.category_name);
            return (
              <div key={cat.id} className="col-md-3 col-sm-6">
                <Link
                  href={`/category/${slug}`}
                  className="card text-center p-3 text-decoration-none text-dark h-100 shadow-sm hover-shadow"
                >
                  <img
                    src={cat.image || '/assets/Home/default-category.png'}
                    alt={cat.category_name}
                    className="img-fluid mb-2"
                    style={{ height: '150px', objectFit: 'cover', borderRadius: '8px' }}
                  />
                  <h5 className="mb-1">{cat.category_name}</h5>
                  <p className="text-muted small">View products in this category</p>
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
