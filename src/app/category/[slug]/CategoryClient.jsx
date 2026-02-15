'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CategoryClient({ slug }) {
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const readableSlug = slug.replace('-', ' ');

  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const res = await fetch(`/api/subcategory?category_slug=${readableSlug}`);
        if (!res.ok) throw new Error('Failed to fetch subcategories');

        const data = await res.json();
        setSubCategories(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, [slug]);

  if (loading) return <div className="container py-4 text-center">Loading...</div>;
  if (error) return <div className="container py-4 text-center text-danger">{error}</div>;

  return (
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
          {readableSlug}
        </h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb justify-content-center mb-0" style={{ fontSize: '0.9rem' }}>
            <li className="breadcrumb-item"><a href="/" className="text-decoration-none text-muted">Home</a></li>
            <li className="breadcrumb-item active" aria-current="page"> Category</li>
          </ol>
        </nav>
      </div>

      <div className="row g-4 mt-4">
        {subCategories.map((sub) => (
          <div
            key={sub.id}
            className="col-6 col-md-4 col-lg-3"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(`/category/${slug}/${sub.slug}`)}
          >
            <div className="card border-0 text-center p-3">
              <img
                src={`/assets/subcat/${sub.id}/${sub.image}`}
                alt={sub.sub_category_name}
                className="img-fluid mb-2"
              />
              <h5 className=" text-gold">{sub.sub_category_name}</h5>
            </div>
          </div>
        ))}
      </div>

      {subCategories.length === 0 && (
        <p className="text-center mt-4 text-muted">No subcategories found.</p>
      )}
    </div>
  );
}
