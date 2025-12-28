'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Breadcrumb from '@/components/Breadcrumb';
import ProductCard from '@/components/ProductCard';

export default function SubCategoryClient() {
  const { slug: categorySlug, subcat: subCategorySlug } = useParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const readableCategory = categorySlug.replace('-', ' ');
  const readableSubCategory = subCategorySlug.replace('-', ' ');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch all subcategories to get the subcategory id
        const resSub = await fetch('/api/subcategory');
        if (!resSub.ok) throw new Error('Failed to fetch subcategories');
        const subCategories = await resSub.json();

        const subCat = subCategories.find(
          (s) => s.slug.toLowerCase() === subCategorySlug.toLowerCase()
        );

        if (!subCat) throw new Error('Subcategory not found');

        // Fetch products by sub_category_id
        const resProd = await fetch(`/api/products?sub_category_id=${subCat.id}`);
        if (!resProd.ok) throw new Error('Failed to fetch products');
        const data = await resProd.json();

        setProducts(data);
      } catch (err) {
        console.error(err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categorySlug, subCategorySlug]);

  if (loading) return <div className="container py-4 text-center">Loading...</div>;
  if (error) return <div className="container py-4 text-center text-danger">{error}</div>;

  return (
    <div className="container py-4">
      <Breadcrumb
        title={
          <span>
            <a
              href={`/category/${categorySlug}`}
              className="text-decoration-underline text-primary"
            >
              {readableCategory?.toUpperCase()}
            </a>{' '}
            / {readableSubCategory?.toUpperCase()}
          </span>
        }
        current={readableSubCategory}
        description={`Explore products under ${readableSubCategory}`}
      />

      <div className="row g-4 mt-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {products.length === 0 && (
        <p className="text-center mt-4 text-muted">
          No products found in this subcategory.
        </p>
      )}
    </div>
  );
}
