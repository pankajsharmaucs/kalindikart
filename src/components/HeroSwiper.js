// components/HeroSwiper.js
'use client'; // 👈 MUST ADD THIS DIRECTIVE

import React, { useEffect } from 'react';

// Assuming you still rely on the global Swiper script loaded in layout.js 
// If you installed Swiper via npm, you would import Swiper here instead.

export default function HeroSwiper() {
  // useEffect ensures the code runs only after the component is mounted on the client
  useEffect(() => {
    // Check if Swiper class is available globally (from the CDN script in layout.js)
    if (typeof window !== 'undefined' && window.Swiper) {
      // Initialize Swiper
      new window.Swiper(".myHeroSwiper", {
        loop: true,
        autoplay: {
          delay: 5000,
          disableOnInteraction: false,
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });
    }
  }, []); // Empty dependency array ensures it runs only once after mount

  return (
    <section className="hero-section">
      <div className="hero-swiper-container">
        {/* Swiper structure remains the same */}
        <div className="swiper myHeroSwiper">
          <div className="swiper-wrapper">
            <div className="swiper-slide">
              {/* Ensure image paths are correct (e.g., from the /public folder) */}
              <img src="/main/Home/Slider2.jpg" alt="Slider Image 1" />
            </div>
            <div className="swiper-slide">
              <img src="/main/Home/Urli_Banner.jpg" alt="Slider Image 2" />
            </div>
            <div className="swiper-slide">
              <img src="/main/Home/Buddha.jpg" alt="Slider Image 3" />
            </div>
          </div>
          <div className="swiper-pagination"></div>
          <div className="swiper-button-next"></div>
          <div className="swiper-button-prev"></div>
        </div>
      </div>
    </section>
  );
}