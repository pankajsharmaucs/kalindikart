'use client';

import Link from 'next/link';

export default function Breadcrumb({ title, description, current }) {
  return (
    <div className="breadcrumb-section py-4 mb-4">
      <div className="container text-center">

        {/* Big Title */}
        {title && (
          <h1 className="breadcrumb-title h3 fw-bold mb-2">
            {title}
          </h1>
        )}

        {/* Optional description */}
        {description && (
          <p className="breadcrumb-description text-muted mb-2">
            {description}
          </p>
        )}

        {/* Small breadcrumb navigation */}
        <nav className="breadcrumb-nav small text-muted text-capitalize">
          <Link href="/" className="breadcrumb-link text-decoration-none">
            Home
          </Link>
          <span className="breadcrumb-separator mx-1">/</span>
          <span className="breadcrumb-current">{title}</span>
        </nav>
      </div>

      <style jsx>{`
        .breadcrumb-section {
          background: linear-gradient(135deg, #e6f6ff, #d8ebf9);
          border-radius: 1rem;
          padding: 2rem 1rem;
        }

        .breadcrumb-title {
          color: #00739D; /* dark-gold */
        }

        .breadcrumb-description {
          font-size: 1rem;
        }

        .breadcrumb-nav .breadcrumb-link {
          color: #01A9E6; /* primary-gold */
        }

        .breadcrumb-nav .breadcrumb-link:hover {
          text-decoration: underline;
        }

        .breadcrumb-current {
          color: #555;
        }
      `}</style>
    </div>
  );
}
