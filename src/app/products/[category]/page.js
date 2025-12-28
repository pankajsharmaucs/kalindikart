// src/app/products/[category]/page.js

import Breadcrumb from "@/components/Breadcrumb";
import { products } from "@/data/products";
import Link from "next/link";
import Image from "next/image";

export default function CategoryPage({ params }) {
  const { category } = params;

  // Normalize category name (in case you use slugs like "brass-idols")
  const normalizedCategory = category.toLowerCase().replace(/-/g, " ");

  // Filter products safely
  const filtered = products.filter(
    (p) => p.category && p.category.toLowerCase() === category.toLowerCase()
  );

  // Capitalize title nicely
  const pageTitle =
    normalizedCategory.charAt(0).toUpperCase() + normalizedCategory.slice(1);

  // If no products found
  if (filtered.length === 0) {
    return (
      <div className="container py-5">
        <Breadcrumb title={pageTitle} current={pageTitle} />
        <div className="text-center py-5 my-5">
          <h3>No products found in this category</h3>
          <p className="text-muted">We are adding more handcrafted items daily!</p>
          <Link href="/products" className="btn btn-outline-primary mt-3">
            ← Back to All Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-4">
      <Breadcrumb
        title={pageTitle}
        description={`Explore our premium handcrafted ${pageTitle.toLowerCase()} collection`}
        current={pageTitle}
      />

      <h2 className="mb-4 text-capitalize">{pageTitle} Collection</h2>
      <div className="row g-4">
        {filtered.map((product) => {
          // Safely get first image, fallback to placeholder
          const firstImageId = Array.isArray(product.images) && product.images.length > 0
            ? product.images[0]
            : 101; // fallback Picsum ID

          return (
            <div key={product.id} className="col-lg-3 col-md-4 col-sm-6">
              <Link
                href={`/products/${product.category}/${product.slug}`}
                className="text-decoration-none"
              >
                <div className="card h-100 border-0 shadow-sm hover-shadow transition">
                  <div className="position-relative overflow-hidden">
                    <Image
                      src={`https://picsum.photos/id/${firstImageId}/400/400`}
                      alt={product.title || product.name}
                      width={400}
                      height={400}
                      className="card-img-top"
                      style={{ objectFit: "cover", height: "280px" }}
                    />
                    {product.isNew && (
                      <span className="position-absolute top-0 start-0 bg-success text-white px-3 py-1 small">
                        NEW
                      </span>
                    )}
                  </div>

                  <div className="card-body text-center">
                    <h5 className="card-title mb-2 text-dark">
                      {product.title || product.name}
                    </h5>

                    <div className="d-flex justify-content-center align-items-center gap-2">
                      <span className="h5 text-success fw-bold mb-0">
                        ₹{product.price}
                      </span>
                      {product.originalPrice > product.price && (
                        <span className="text-muted text-decoration-line-through small">
                          ₹{product.originalPrice}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}