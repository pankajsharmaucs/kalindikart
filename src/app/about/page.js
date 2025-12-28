// app/about/page.jsx
'use client';

import React from 'react';

export default function AboutPage() {
    return (
        <div className="about-page">
            <div className="about-wrapper">

                {/* Hero Section */}
                <section className="hero-section text-center mb-5">
                    <i className="bi bi-shop-window display-1 text-primary-gold mb-3"></i>
                    <h1 className="display-4 fw-bold text-white mb-2">About KalindiKart</h1>
                    <p className="text-white fs-5">
                        Where heritage meets artistry — exquisite Indian metalwork for your home and soul.
                    </p>
                </section>

                {/* Story Section */}
                <section className="story-section mb-5">
                    <div className="about-card shadow-lg p-5 rounded-4">
                        <h2 className="h4 fw-bold text-dark-gold mb-3">Our Story</h2>
                        <p className="text-dark-gold mb-3">
                            At <strong>KalindiKart</strong>, we celebrate the timeless allure of Indian metalwork. Our collection of Bronze and Brass sculptures is handcrafted by master artisans who bring centuries-old traditions to life through the ancient lost-wax technique.
                        </p>
                        <p className="text-dark-gold mb-0">
                            Each piece tells a story — of devotion, craftsmanship, and the enduring legacy of a rich cultural heritage. By preserving these traditions, we bring spiritual elegance and a sense of history into your home.
                        </p>
                    </div>
                </section>

                {/* Mission & Heritage Section */}
                <section className="mission-section mb-5">
                    <div className="about-card shadow-lg p-5 rounded-4">
                        <h2 className="h4 fw-bold text-dark-gold mb-4">Our Mission & Heritage</h2>
                        <div className="row text-center">
                            <div className="col-md-6 mb-4">
                                <i className="bi bi-bullseye display-4 text-primary-gold mb-3"></i>
                                <h3 className="h6 fw-bold text-dark-gold mb-2">Our Mission</h3>
                                <p className="text-dark-gold small">
                                    To preserve India's rich artisanal traditions while offering exquisite, handcrafted sculptures that infuse homes with spiritual beauty and timeless elegance.
                                </p>
                            </div>
                            <div className="col-md-6 mb-4">
                                <i className="bi bi-gem display-4 text-primary-gold mb-3"></i>
                                <h3 className="h6 fw-bold text-dark-gold mb-2">Our Heritage</h3>
                                <p className="text-dark-gold small">
                                    Upholding generations of skill and devotion, we honor the ancient lost-wax method, ensuring every sculpture is a testament to craftsmanship, faith, and artistry.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Why Choose Us */}
                <section className="why-section mb-5">
                    <div className="about-card shadow-lg p-5 rounded-4">
                        <h2 className="h4 fw-bold text-dark-gold mb-4">Why Choose KalindiKart?</h2>
                        <ul className="text-dark-gold small list-unstyled">
                            <li className="mb-2"><i className="bi bi-check-circle-fill text-primary-gold me-2"></i>Authentic Bronze & Brass sculptures crafted by skilled artisans</li>
                            <li className="mb-2"><i className="bi bi-check-circle-fill text-primary-gold me-2"></i>Each piece embodies centuries of Indian craftsmanship</li>
                            <li className="mb-2"><i className="bi bi-check-circle-fill text-primary-gold me-2"></i>Preserving traditional techniques with a contemporary touch</li>
                            <li className="mb-2"><i className="bi bi-check-circle-fill text-primary-gold me-2"></i>Elegance and spiritual artistry that transform your living spaces</li>
                        </ul>
                    </div>
                </section>

            </div>

            <style jsx global>{`
               

                .about-page {
                    width: 100%;
                    min-height: 100vh;
                    padding: 3rem 1.5rem;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                }

                .about-wrapper {
                    width: 100%;
                    max-width: 900px;
                }

                .hero-section h1 {
                    font-size: 2.5rem;
                }

                .about-card {
                    background: var(--white-alpha);
                    backdrop-filter: blur(12px);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.15);
                    transition: transform 0.3s ease, box-shadow 0.3s ease;
                }

                .about-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 25px 50px rgba(0,0,0,0.2);
                }

                .text-primary-gold { color: var(--primary-gold) !important; }
                .text-dark-gold { color: var(--dark-gold) !important; }
                .small { font-size: 0.9rem; }

                ul li { line-height: 1.6; }
            `}</style>
        </div>
    );
}
