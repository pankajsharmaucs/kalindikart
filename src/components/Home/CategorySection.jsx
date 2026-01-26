'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const createSlug = (text) => {
  if (!text) return 'category';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

export default function CategorySection() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/category')
      .then((res) => res.json())
      .then((response) => {
        // Safely get array no matter what the API returns
        let items = [];

        if (Array.isArray(response)) {
          items = response;
        } else if (response && Array.isArray(response.data)) {
          items = response.data;
        } else if (response && Array.isArray(response.categories)) {
          items = response.categories;
        }

        setCategories(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        setCategories([]);
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
            {(Array.isArray(categories) ? categories : []).map((cat) => {
              const slug = createSlug(cat.slug || cat.name || cat.category_name || '');
              const name = cat.name || cat.category_name || 'Unnamed';
              const image = cat.image || '/assets/Home/default-category.png';

              return (
                <Link
                  href={`/category/${slug}`}
                  key={cat.id || slug}
                  className="cat-item text-decoration-none"
                >
                  <img
                    src={image}
                    alt={name}
                    className="cat-img"
                    onError={(e) => {
                      e.target.src = '/assets/Home/default-category.png';
                    }}
                  />
                  <div className="cat-name">{name}</div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}