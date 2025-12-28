'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';

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
      <Breadcrumb
        title={
          <span>
            <a href="/collections" className="text-decoration-underline text-primary">
              Collections
            </a>{' '}
            /{' '}
            <a href={`/category/${slug}`} className="text-decoration-underline text-primary">
              {readableSlug}
            </a>
          </span>
        }
        current={readableSlug}
        description={`Explore subcategories under ${readableSlug}`}
      />

      <div className="row g-4 mt-4">
        {subCategories.map((sub) => (
          <div
            key={sub.id}
            className="col-6 col-md-4 col-lg-3"
            style={{ cursor: 'pointer' }}
            onClick={() => router.push(`/category/${slug}/${sub.slug}`)}
          >
            <div className="card text-center p-3">
              <img
                src={sub.image || '/placeholder.png'}
                alt={sub.sub_category_name}
                className="img-fluid mb-2"
              />
              <h6 className="fw-bold">{sub.sub_category_name}</h6>
              <p className="text-muted small">View products</p>
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
