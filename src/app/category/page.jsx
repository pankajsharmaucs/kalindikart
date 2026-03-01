'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Breadcrumb from '../../components/Breadcrumb';

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
    <div className="container  py-4 px-3">


      {loading && <p className="text-center">Loading categories...</p>}
      {error && <p className="text-center text-danger">Error: {error}</p>}

      {!loading && !error && categories.length === 0 && (
        <p className="text-center text-muted">No categories found.</p>
      )}

      {!loading && !error && categories.length > 0 && (
        <div className="row ">

          <div
            className="col-12 text-center py-md-5 py-2 mb-3"
            style={{
              background: 'linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.4)), url("/assets/parallex_bg.png")',
              backgroundColor: '#f8e8c6', // Fallback warm beige
              backgroundSize: 'cover',
              borderRadius: '8px'
            }}
          >
            <h1 className="fw-bold mb-2" style={{ color: 'rgb(9, 106, 117)', fontSize: '2rem' }}>
              Product Category
            </h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.9rem' }}>
                <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-muted">Home</a></li>
                <li className="breadcrumb-item active" aria-current="page">All Category</li>
              </ol>
            </nav>
          </div>

          <div className="container px-5 ">

            <div className="row">
              {categories.map((cat) => {
                const slug = cat.slug ? createSlug(cat.slug) : createSlug(cat.category_name);
                return (
                  <div key={cat.id} className="col-md-3 col-sm-6 col-6 mb-3">
                    <Link
                      href={`/category/${slug}`}
                      className="card  border-0 text-center p-3 text-decoration-none 
                      text-dark h-100 "
                    >
                      <img
                        src={`/assets/category/${cat.id}/${cat.image}`}
                        alt={cat.category_name}
                        className="img-fluid mb-4"
                        style={{ objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <h5 className=" text-gold">{cat.category_name}</h5>

                    </Link>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
