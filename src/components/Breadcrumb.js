'use client';

import Link from 'next/link';

export default function Breadcrumb({ title, description, current }) {
  return (
    <div className="breadcrumb-section py-5 mb-5">
      <div className="container text-center">
        
        {/* Big Title - Elegant & Clean */}
        {title && (
          <h1 className="breadcrumb-title fw-normal mb-2">
            {title}
          </h1>
        )}

        {/* Navigation Breadcrumb - Home > Current */}
        <nav className="breadcrumb-nav mb-2 col-12 " aria-label="breadcrumb">
          <ol className="breadcrumb w-100 justify-content-center mb-0">
            <li className="breadcrumb-item">
              <Link href="/" className="text-decoration-none breadcrumb-link">
                Home
              </Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {current || title}
            </li>
          </ol>
        </nav>

        
      </div>

      <style jsx>{`
        .breadcrumb-section {
          /* Using your light blue tint with a subtle gradient overlay */
          background: linear-gradient(rgba(255,255,255,0.3), rgba(255,255,255,0.3)), var(--light-bg);
          background-size: cover;
          border-radius: 12px;
          border: 1px solid var(--border-color);
          padding: 3rem 1rem;
        }

        .breadcrumb-title {
          color: var(--text-dark);
          font-size: 2.2rem;
          letter-spacing: -0.5px;
        }

        .breadcrumb-nav {
          font-size: 0.95rem;
          text-transform: capitalize;
        }

        .breadcrumb-link {
          color: var(--dark-gold);
          transition: color 0.2s ease;
        }

        .breadcrumb-link:hover {
          color: var(--primary-gold);
          text-decoration: underline !important;
        }

        .breadcrumb-item.active {
          color: var(--text-dark);
          opacity: 0.7;
        }

        /* Custom separator to match the reference style */
        .breadcrumb-item + .breadcrumb-item::before {
          content: ">";
          color: var(--dark-gold);
          font-size: 0.8rem;
          padding: 0 10px;
        }

        .breadcrumb-description {
          font-size: 0.95rem;
          color: var(--text-dark);
          opacity: 0.8;
          font-style: italic;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        @media (max-width: 768px) {
          .breadcrumb-title {
            font-size: 1.8rem;
          }
          .breadcrumb-section {
            padding: 2rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}