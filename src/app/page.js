// app/page.js
'use client';

// Import Next.js specific components and utilities
import Link from 'next/link';

// Import custom components (assuming these are defined in your components folder)
import HeroSwiper from '../components/HeroSwiper';
import ReelsSlider from '../components/ReelsSlider';
import ProductCard from '../components/ProductCard';
import NewArrivalsSection from '@/components/newArrivals/page';
// Note: ProductCard is assumed to be the styled version we finalized,
// and it should be defined in 'components/ProductCard.js' or similar.

import CategorySection from '@/components/Home/CategorySection';


export default function HomePage() {
  return (
    <>
      {/* 1. Hero/Main Slider Section */}
      <HeroSwiper />

      {/* 2. Trust and Payment Strip */}
      <div className="trust-strip">
        <div className="container text-center">
          <span className="text-muted small me-3 d-none d-md-inline">Trusted by 20000+ Happy Customers &nbsp;|&nbsp; Secure Payments:</span>
          <div className="d-inline-block trust-icons">
            {/* Asset assumed to be in the public directory */}
            <img src="/assets/payment_options.png" alt="payment options" />
          </div>
        </div>
      </div>

      {/* 3. Category Circles Section */}
      <CategorySection />

      {/* 4. New Arrivals Section (Dynamic Product Grid) */}
      <>
        {/* Other sections */}
        <NewArrivalsSection />
      </>

      {/* 5. Instagram Reels Slider */}
      {/* <ReelsSlider /> */}

      {/* 6. Our Story / About Us Section */}
      <section className="story-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4 mb-lg-0">
              <div className="story-text">
                <p className="text-uppercase small fw-bold" style={{ color: 'var(--primary-gold)' }}>Our Legacy</p>
                <h2 className="section-header" style={{ marginBottom: '20px' }}>The Art of Artisanship</h2>
                <p className="lead">KalindiKart is more than just a store; it's a testament to the timeless beauty of Indian metalwork. We specialize in Bronze and Brass sculptures, handcrafted by master artisans using the ancient lost-wax technique.</p>
                <p>Every piece tells a story of devotion and skill, passed down through generations. Our commitment is to preserve this heritage while bringing spiritual elegance to your home.</p>
                <Link href="#" className="btn mt-3" style={{ backgroundColor: 'var(--primary-gold)', color: 'white', borderRadius: '20px' }}>
                  Read Full Story
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row g-4">
                <div className="col-6">
                  <img src="/assets/Home/hsnficraft-hanuman.jpg" alt="Artisan" className="img-fluid story-image" />
                </div>
                <div className="col-6">
                  <div className="story-image-2 h-100 d-flex align-items-center justify-content-center">
                    &quot;Opulence that speaks to the Soul&quot;
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Sustainability Parallax Banner */}
      <section className="parallax-banner">
        <div className="parallax-overlay"></div>
        <div className="container parallax-content">
          <h2 className="text-white">Sustainable & Ethical Craftsmanship</h2>
          <p className="lead text-white">We use only ethically sourced materials and ensure fair wages for our artisans, promoting responsible luxury.</p>
        </div>
      </section>

      {/* 8. Gifting & Features Section */}
      <section className="section-padding bg-light">
        <div className="container text-center">
          <h2 className="section-header">Why Choose KalindiKart?</h2>
          <div className="row g-4 mt-4">
            <div className="col-lg-3 col-md-6">
              <div className="gifting-box">
                <i className="fas fa-gifts"></i>
                <h4>Gifting Solutions</h4>
                <p className="small text-muted mb-0">Custom engraving and luxurious packaging for every occasion.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="gifting-box">
                <i className="fas fa-shield-alt"></i>
                <h4>Secure Packaging</h4>
                <p className="small text-muted mb-0">Insured, multi-layer packaging guarantees safe delivery.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="gifting-box">
                <i className="fas fa-certificate"></i>
                <h4>Authenticity Certified</h4>
                <p className="small text-muted mb-0">Each idol comes with a certificate of material authenticity.</p>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="gifting-box">
                <i className="fas fa-truck-fast"></i>
                <h4>Fast Shipping</h4>
                <p className="small text-muted mb-0">Quick and reliable delivery across India and worldwide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}