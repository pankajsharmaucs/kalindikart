'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';

export default function NewArrivalsSection() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await fetch('/api/products'); // API endpoint
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error('Invalid API response');

        // Optional: filter for "new arrivals" if your API has a field
        // const arrivals = data.filter(p => p.isNewArrival);
        const arrivals = data; // If no filter, just use all products

        setNewArrivals(arrivals);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading) return <p className="text-center py-4">Loading new arrivals...</p>;
  if (error) return <p className="text-center py-4 text-danger">Error: {error}</p>;

  return (
    <section className="section-padding">
      <div className="container text-center">
        <h2 className="section-header">New Arrivals</h2>

        <div className="row g-4">
          {newArrivals.length > 0 ? (
            newArrivals.map(product => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-muted">No new arrivals found.</p>
          )}
        </div>

        <Link
          href="/products"
          className="btn btn-lg mt-5"
          style={{ backgroundColor: 'var(--dark-gold)', color: 'white' }}
        >
          View All New Arrivals <i className="fas fa-arrow-right ms-2"></i>
        </Link>
      </div>
    </section>
  );
}
