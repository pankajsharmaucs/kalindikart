'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

// helper to create slug if backend doesn't provide one
const createSlug = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/category')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Category fetch error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section className="category-section">
      <div className="container">
        <div className="d-flex justify-content-center">
          <h2
            className="section-header"
            style={{ fontSize: '1.8rem', marginBottom: '20px' }}
          >
            Shop by Category
          </h2>
        </div>

        {loading ? (
          <p className="text-center">Loading categories...</p>
        ) : (
          <div className="category-scroll">
            {categories.map((cat) => {
              const slug = createSlug(cat.slug);

              return (
                <Link
                  href={`/category/${slug}`}
                  key={cat.id}
                  className="cat-item text-decoration-none"
                >
                  <img
                    src={cat.image || '/assets/Home/default-category.png'}
                    alt={cat.name}
                    className="cat-img"
                  />
                  <div className="cat-name">{cat.name}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
