'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import './ProductSliderNew.css';

// Import required modules
import { EffectCoverflow, Pagination, Autoplay, Navigation } from 'swiper/modules';

const ProductSliderNew = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewArrivals();
  }, []);

  if (loading) return <div className="slider-status">Loading...</div>;

  return (
    <div className="slider-container">
      <h2 className="slider-title">Discover our Curated Items</h2>
      
      <div className="swiper-outer-wrapper">
        <Swiper
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 3500,
            disableOnInteraction: false,
          }}
          coverflowEffect={{
            rotate: 20,     // Slight rotation for the 3D effect
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: false, // Set to false if you want a cleaner look
          }}
          navigation={{
            nextEl: '.nav-btn.next',
            prevEl: '.nav-btn.prev',
          }}
          pagination={{ clickable: true }}
          // Breakpoints for responsive views
          breakpoints={{
            0: { slidesPerView: 4, spaceBetween: 10 },    // Mobile
            640: { slidesPerView: 2, spaceBetween: 15 },  // Small
            768: { slidesPerView: 3, spaceBetween: 20 },  // Medium
            1024: { slidesPerView: 4, spaceBetween: 5 }, // Large
          }}
          modules={[EffectCoverflow, Pagination, Autoplay, Navigation]}
          className="productSwiper"
        >
          {products.map((product) => {
            const product_id = Number(product.id) || 0;
            const currentPrice = Number(product.price) || 0;
            const re_category_slug = product.category_slug?.replace(/\s+/g, '-') || 'all';

            return (
              <SwiperSlide key={product.id}>
                <Link href={`/products/${re_category_slug}/${product.slug}`} className="card-link">
                  <div className="product-card">
                    <div className="image-box">
                      <img src={`/assets/products/${product_id}/img1.jpg`} className="img-main" alt={product.title} />
                      <img src={`/assets/products/${product_id}/img2.jpg`} className="img-hover" alt={product.title} />
                    </div>
                    <div className="info-box">
                      <h3 className="title">{product.title}</h3>
                      <div className="price">Rs. {currentPrice.toLocaleString('en-IN')}</div>
                      <span className="express">Express Shipping</span>
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>

        <button className="nav-btn prev">&#10094;</button>
        <button className="nav-btn next">&#10095;</button>
      </div>
    </div>
  );
};

export default ProductSliderNew;