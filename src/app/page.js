// app/page.js
'use client';

import Link from 'next/link';
import HeroSwiper from '../components/HeroSwiper';
import NewArrivalsSection from '../components/newArrivals/page';
import CategorySection from '../components/Home/CategorySection';
import ProductSliderNew from '../components/sliders/ProductSliderNew';
import Slider2 from '../components/Slider2';

export default function HomePage() {
  return (
    <>



      {/* ================= HERO ================= */}
      <section className="hero-wrapper">
        <HeroSwiper />
      </section>

      {/* ================= TRUST STRIP ================= */}
      <section className="trust-strip hero-trust">
        <div className="container text-center">
          <div className="d-flex flex-column flex-md-row align-items-center justify-content-center gap-2">
            <span className="text-muted small d-none d-md-inline">
              Trusted by 20,000+ Happy Customers &nbsp;|&nbsp; Secure Payments
            </span>
            <div className="trust-icons">
              <img src="/assets/payment_options.png" alt="payment options" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY ================= */}
      <section className="section-spacing">
        <CategorySection />
      </section>

      {/* ================= NEW ARRIVALS ================= */}
      <section className="section-spacing">
        <NewArrivalsSection />
      </section>

      {/* ================= STORY ================= */}
      <section className="story-section">
        <div className="container">
          <div className="row align-items-center g-4">

            <div className="col-lg-6">
              <p className="text-uppercase small fw-bold text-primary-gold">
                Our Legacy
              </p>

              <h2 className="section-header mb-3">
                The Art of Artisanship
              </h2>

              <p className="lead">
                KalindiKart is more than a store — it is a celebration of Indian
                bronze & brass craftsmanship created using the ancient lost-wax technique.
              </p>

              <p className="text-muted">
                Every piece reflects devotion, precision and timeless artistry,
                handcrafted by master artisans for spiritual homes.
              </p>

              <Link
                href="/about"
                className="btn btn-primary-gold mt-3 px-4 py-2 rounded-pill"
              >
                Read Full Story
              </Link>
            </div>

            <div className="col-lg-6">
              <div className="row g-3">
                <div className="col-6">
                  <img
                    src="/assets/Home/hsnficraft-hanuman.jpg"
                    alt="Artisan"
                    className="img-fluid story-image"
                  />
                </div>
                <div className="col-6">
                  <div className="story-image-2 h-100 d-flex align-items-center justify-content-center">
                    “Opulence that speaks to the Soul”
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= NEW ARRIVALS ================= */}
      <section className="section-spacing">
        <Slider2 />
      </section>

      {/* ================= NEW ARRIVALS ================= */}
      {/* <section className="section-spacing">
        <ProductSliderNew />
      </section> */}

      {/* ================= PARALLAX ================= */}
      <section className="parallax-banner">
        <div className="parallax-overlay"></div>
        <div className="container parallax-content">
          <h2 className="text-white mb-3">
            Sustainable & Ethical Craftsmanship
          </h2>
          <p className="lead text-white mb-0">
            Ethically sourced materials & fair artisan wages — responsible luxury.
          </p>
        </div>
      </section>

      {/* ================= WHY US ================= */}
      <section className="section-padding bg-light">
        <div className="container text-center">
          <h2 className="section-header">Why Choose KalindiKart?</h2>

          <div className="row g-4 mt-4">
            {[
              {
                icon: 'fa-gifts',
                title: 'Gifting Solutions',
                desc: 'Custom engraving & premium packaging',
              },
              {
                icon: 'fa-shield-alt',
                title: 'Secure Packaging',
                desc: 'Insured & multi-layer safe delivery',
              },
              {
                icon: 'fa-certificate',
                title: 'Authenticity Certified',
                desc: 'Verified material certification',
              },
              {
                icon: 'fa-truck-fast',
                title: 'Fast Shipping',
                desc: 'Reliable delivery across India & abroad',
              },
            ].map((item, i) => (
              <div className="col-lg-3 col-md-6" key={i}>
                <div className="gifting-box">
                  <i className={`fas ${item.icon}`}></i>
                  <h4>{item.title}</h4>
                  <p className="small text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
