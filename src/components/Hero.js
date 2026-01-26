'use client';

import Link from 'next/link';

export default function Hero() {
  return (
    <section
      className="hero-section d-flex align-items-center"
      style={{
        backgroundImage: "url('/main/parallax_bg.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        minHeight: '80vh',
        position: 'relative',
        color: '#fff',
      }}
    >
      {/* Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(to right, rgba(6,35,80,0.75), rgba(6,35,80,0.4), rgba(6,35,80,0.1))',
        }}
      />

      <div className="container position-relative">
        <div className="row">
          <div className="col-lg-6">

            <span className="badge mb-3 hero-badge">
              Handcrafted • Premium • Timeless
            </span>

            <h1 className="hero-title">
              Opulent Brass & Bronze
              <br />
              <span>Idols for Modern Homes</span>
            </h1>

            <p className="hero-desc">
              Discover handcrafted brass and bronze idols that preserve ancient
              Indian artistry while blending seamlessly with modern living.
            </p>

            <div className="d-flex gap-3 mt-4 flex-wrap">
              <Link href="/products" className="btn btn-primary-gold px-4 py-2">
                Shop Now
              </Link>
              <Link href="/collections" className="btn btn-outline-light px-4 py-2">
                Explore Collection
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .hero-badge {
          background: rgba(201, 162, 39, 0.15);
          color: #f5d77a;
          border: 1px solid #e95943;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 13px;
          letter-spacing: 0.5px;
        }

        .hero-title {
          font-size: 3.2rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .hero-title span {
          color: #f5d77a;
        }

        .hero-desc {
          font-size: 1.05rem;
          color: #e2f1ff;
          margin-top: 18px;
          max-width: 520px;
        }

        @media (max-width: 768px) {
          .hero-section {
            min-height: 70vh;
            text-align: center;
          }

          .hero-title {
            font-size: 2.2rem;
          }

          .hero-desc {
            margin-left: auto;
            margin-right: auto;
          }
        }
      `}</style>
    </section>
  );
}
    