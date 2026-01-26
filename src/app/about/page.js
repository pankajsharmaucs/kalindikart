'use client';

import React from 'react';

export default function AboutPage() {
  return (
    <div className="kk-about-page">
      {/* ================= HERO ================= */}
      <section className="kk-about-hero">
        <div className="kk-about-hero-overlay" />

        <div className="kk-about-hero-content">
          <p className="kk-hero-eyebrow">Handcrafted Bronze & Brass Sculptures</p>
          <h1>About KalindiKart</h1>
          <span className="kk-hero-divider" />
          <p className="kk-hero-subtitle">
            Where heritage meets artistry — exquisite Indian metalwork crafted by master artisans
            to bring spiritual elegance into your home.
          </p>
        </div>
      </section>

      {/* ================= STORY ================= */}
      <section className="kk-about-section kk-about-section-light">
        <div className="container">
          <div className="kk-about-card kk-about-card-split">
            <div className="kk-about-card-text">
              <span className="kk-about-tag">Our Story</span>
              <h2>Timeless Indian Craftsmanship</h2>
              <p>
                At <strong>KalindiKart</strong>, we celebrate the timeless allure of Indian
                metalwork. Our Bronze and Brass sculptures are handcrafted by master artisans using
                the ancient lost-wax technique, a process that captures intricate detail and
                character in every piece.
              </p>
              <p>
                Each creation carries devotion, history, and artistry — preserving generations of
                cultural legacy while adding spiritual elegance and a sense of calm to modern homes.
              </p>
            </div>

            <div className="kk-about-card-side">
              <div className="kk-stat-pill">
                <span className="kk-stat-number">25+</span>
                <span className="kk-stat-label">Artisan Families Supported</span>
              </div>
              <div className="kk-stat-pill">
                <span className="kk-stat-number">100%</span>
                <span className="kk-stat-label">Handcrafted Metalwork</span>
              </div>
              <p className="kk-stat-note">
                Every sculpture is individually cast, finished, and inspected — no mass production,
                only heirloom-quality pieces meant to last generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROCESS ================= */}
      <section className="kk-about-section">
        <div className="container">
          <div className="kk-about-card">
            <span className="kk-about-tag">Our Process</span>
            <h2>From Artisan Hands to Your Home</h2>
            <p className="kk-section-intro">
              Each KalindiKart piece travels through a mindful journey — from ethically sourced
              metal to a sacred presence in your living space.
            </p>

            <div className="kk-timeline">
              <div className="kk-step">
                <span>01</span>
                <h4>Ethical Sourcing</h4>
                <p>Premium bronze & brass sourced responsibly to ensure purity, strength, and longevity.</p>
              </div>
              <div className="kk-step">
                <span>02</span>
                <h4>Lost-Wax Casting</h4>
                <p>Traditional lost-wax method used to capture divine expressions and intricate detailing.</p>
              </div>
              <div className="kk-step">
                <span>03</span>
                <h4>Finishing & Blessing</h4>
                <p>Hand polishing, patina work, and final checks to ensure every piece feels temple-grade.</p>
              </div>
              <div className="kk-step">
                <span>04</span>
                <h4>Protected Delivery</h4>
                <p>Secure, impact-safe packaging and insured delivery from our atelier to your doorstep.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VALUES ================= */}
      <section className="kk-about-section kk-about-section-light">
        <div className="container">
          <div className="kk-about-card">
            <span className="kk-about-tag">Our Values</span>
            <h2>Mission & Heritage</h2>

            <div className="kk-about-grid">
              <div className="kk-value-box">
                <h4>Our Mission</h4>
                <p>
                  To preserve India’s artisanal heritage while offering spiritually rich,
                  handcrafted sculptures for refined homes that seek meaning, not just décor.
                </p>
                <p className="kk-value-sub">
                  Every purchase directly supports artisan communities and keeps age-old techniques
                  alive in a modern world.
                </p>
              </div>

              <div className="kk-value-box">
                <h4>Our Heritage</h4>
                <p>
                  Rooted in the ancient lost-wax tradition, our work honors generations of
                  craftsmanship, devotion, and storytelling through metal.
                </p>
                <p className="kk-value-sub">
                  We collaborate with artisans who have inherited this craft through their lineage,
                  ensuring authenticity in every form and finish.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY US ================= */}
      <section className="kk-about-section">
        <div className="container">
          <div className="kk-about-card">
            <span className="kk-about-tag">Why KalindiKart</span>
            <h2>What Sets Us Apart</h2>

            <ul className="kk-why-list">
              <li>
                <span className="kk-bullet-title">Authentic Bronze & Brass:</span> Solid metal
                sculptures designed to age gracefully and develop a natural patina over time.
              </li>
              <li>
                <span className="kk-bullet-title">Master Artisan Craft:</span> Handcrafted by
                skilled Indian artisans with decades of experience in sacred metalwork.
              </li>
              <li>
                <span className="kk-bullet-title">Tradition Meets Modern Homes:</span> Classic
                forms refined with clean lines and proportions that fit contemporary interiors.
              </li>
              <li>
                <span className="kk-bullet-title">Heirloom Quality:</span> Pieces created to be
                cherished, worshipped, and passed down across generations.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ================= CSS ================= */}
      <style jsx global>{`
        .kk-about-page {
          font-family: 'Poppins', sans-serif;
        }

        /* HERO */
        .kk-about-hero {
          position: relative;
          min-height: 45vh;
          background: url('/main/about-hero.jpg') center/cover no-repeat;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        }

        .kk-about-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            rgba(6, 35, 80, 0.8),
            rgba(6, 35, 80, 0.7)
          );
        }

        .kk-about-hero-content {
          position: relative;
          z-index: 2;
          max-width: 700px;
          padding: 0 20px;
          animation: fadeUp 0.8s ease forwards;
        }

        .kk-hero-eyebrow {
          text-transform: uppercase;
          letter-spacing: 0.15em;
          font-size: 0.75rem;
          color: #cfe8ff;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .kk-about-hero h1 {
          color: #fff;
          font-size: 2.6rem;
          font-family: 'Playfair Display', serif;
          margin-bottom: 8px;
        }

        .kk-hero-subtitle {
          color: #eaf6ff;
          font-size: 1rem;
          line-height: 1.6;
        }

        .kk-hero-divider {
          display: block;
          width: 70px;
          height: 3px;
          background: var(--primary-gold);
          margin: 12px auto 14px;
          border-radius: 999px;
        }

        /* SECTION */
        .kk-about-section {
          padding: 80px 0;
        }

        .kk-about-section-light {
          background: #f5fbff;
        }

        .kk-about-card {
          background: #fff;
          padding: 45px;
          border-radius: 18px;
          box-shadow: 0 20px 45px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .kk-about-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px rgba(1, 169, 230, 0.18);
        }

        /* SPLIT CARD (STORY) */
        .kk-about-card-split {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1.3fr);
          gap: 32px;
          align-items: flex-start;
        }

        .kk-about-tag {
          font-size: 0.75rem;
          letter-spacing: 1.5px;
          font-weight: 600;
          color: var(--primary-gold);
          margin-bottom: 10px;
          display: inline-block;
          text-transform: uppercase;
        }

        .kk-about-card h2 {
          font-family: 'Playfair Display', serif;
          margin-bottom: 18px;
          color: #222;
        }

        .kk-about-card p {
          color: #555;
          line-height: 1.7;
          font-size: 0.98rem;
        }

        .kk-about-card p + p {
          margin-top: 8px;
        }

        .kk-about-card-side {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .kk-stat-pill {
          background: #f0f8ff;
          border-radius: 999px;
          padding: 10px 18px;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-start;
          border: 1px solid rgba(1, 169, 230, 0.2);
        }

        .kk-stat-number {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--primary-gold);
          line-height: 1.3;
        }

        .kk-stat-label {
          font-size: 0.78rem;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: #666;
        }

        .kk-stat-note {
          font-size: 0.9rem;
          color: #666;
          margin-top: 6px;
        }

        .kk-section-intro {
          margin-top: 6px;
          margin-bottom: 22px;
          color: #555;
          max-width: 580px;
        }

        /* TIMELINE */
        .kk-timeline {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 20px;
          margin-top: 30px;
        }

        .kk-step {
          background: #f9fbfd;
          padding: 22px 16px;
          border-radius: 14px;
          text-align: left;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .kk-step span {
          font-size: 1rem;
          font-weight: 700;
          color: var(--primary-gold);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          border-radius: 999px;
          border: 1px solid var(--primary-gold);
          margin-bottom: 10px;
        }

        .kk-step h4 {
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 6px;
          color: #222;
        }

        .kk-step p {
          font-size: 0.9rem;
          color: #555;
          margin: 0;
        }

        /* GRID */
        .kk-about-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 25px;
          margin-top: 20px;
        }

        .kk-value-box {
          background: #f9fbfd;
          padding: 25px;
          border-radius: 14px;
          border-left: 3px solid var(--primary-gold);
        }

        .kk-value-box h4 {
          margin-bottom: 10px;
        }

        .kk-value-sub {
          margin-top: 8px;
          font-size: 0.9rem;
          color: #666;
        }

        /* WHY */
        .kk-why-list {
          margin-top: 20px;
          list-style: none;
          padding-left: 0;
          display: grid;
          gap: 14px;
        }

        .kk-why-list li {
          padding-left: 26px;
          position: relative;
          color: #444;
          font-size: 0.96rem;
          line-height: 1.6;
        }

        .kk-why-list li::before {
          content: '✓';
          position: absolute;
          left: 0;
          top: 2px;
          color: var(--primary-gold);
          font-weight: 700;
        }

        .kk-bullet-title {
          font-weight: 600;
          color: #222;
        }

        /* ANIMATION */
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* MOBILE */
        @media (max-width: 992px) {
          .kk-about-card-split {
            grid-template-columns: 1fr;
          }

          .kk-about-card {
            padding: 35px 26px;
          }

          .kk-timeline {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .kk-about-hero {
            min-height: 38vh;
          }

          .kk-about-hero h1 {
            font-size: 2rem;
          }

          .kk-hero-subtitle {
            font-size: 0.95rem;
          }

          .kk-timeline {
            grid-template-columns: 1fr;
          }

          .kk-about-grid {
            grid-template-columns: 1fr;
          }

          .kk-about-section {
            padding: 60px 0;
          }
        }

        @media (max-width: 576px) {
          .kk-about-card {
            padding: 26px 18px;
          }
        }
      `}</style>
    </div>
  );
}
