'use client';

import React, { useState, useEffect, useRef } from 'react';

export default function Slider2() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('Best Sellers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const swiperRef = useRef(null);
  const tabs = ['New Arrivals', 'Recently Sold', 'Best Sellers', 'Trending'];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (!res.ok) throw new Error('Failed to fetch products');
        const data = await res.json();
        setAllProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (allProducts.length > 0) {
      const filtered = allProducts.filter(p => {
        if (activeTab === 'Best Sellers') return p.isBestSeller || p.rating >= 4;
        if (activeTab === 'New Arrivals') return p.isNewArrival || p.id > 20;
        return true;
      });
      setFilteredProducts(filtered.length > 0 ? filtered : allProducts.slice(0, 10));
    }
  }, [activeTab, allProducts]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Swiper && filteredProducts.length > 0) {
      if (swiperRef.current) swiperRef.current.destroy();

      swiperRef.current = new window.Swiper(".s2-swiper", {
        // --- INFINITE LOOP & AUTOPLAY SETTINGS ---
        loop: true,                         // Enables infinite sliding
        centeredSlides: false,              // Keep cards aligned to the start
        autoplay: {
          delay: 3000,                      // 3 seconds between slides
          disableOnInteraction: false,      // Continues autoplay after user swipes
          pauseOnMouseEnter: true,          // Stops when user hovers to look at a product
        },
        // ------------------------------------------
        slidesPerView: 1.2,
        spaceBetween: 20,
        navigation: { nextEl: ".s2-next", prevEl: ".s2-prev" },
        pagination: { el: ".s2-pagination", clickable: true, dynamicBullets: true },
        breakpoints: {
          576: { slidesPerView: 2 },
          992: { slidesPerView: 4 },
          1200: { slidesPerView: 5 },
        },
      });
    }
  }, [filteredProducts]);

  if (loading) return <div className="py-20 text-center text-[#01A9E6]">Loading...</div>;

  return (
    <section className="py-12 bg-[#f0f8ff]">
      <div className="max-w-[1440px] mx-auto px-6">

        <div className="mb-md-5 mb-3 text-center">
          <h2 className="section-header text-center">Popular Products</h2>
        </div>

        {/* Tabs - Category on top removed as per request */}
        {/* Centered Bootstrap Tabs */}
        <ul className="nav d-none nav-pills justify-content-center border-bottom pb-2 mb-5 overflow-auto flex-nowrap no-scrollbar">
          {tabs.map((tab) => (
            <li className="nav-item" key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`nav-link border-0 bg-transparent fw-bold position-relative px-4 py-2 ${activeTab === tab ? 'active-tab' : 'text-secondary'
                  }`}
                style={{
                  color: activeTab === tab ? '#01A9E6' : '',
                  fontSize: '0.9rem'
                }}
              >
                {tab}
                {activeTab === tab && (
                  <span
                    className="position-absolute bottom-0 start-0 w-100"
                    style={{ height: '3px', backgroundColor: '#01A9E6', borderRadius: '3px 3px 0 0' }}
                  />
                )}
              </button>
            </li>
          ))}
        </ul>

        {/* Slider */}
        <div className="relative group">
          <div className="swiper s2-swiper !pb-16">
            <div className="swiper-wrapper">
              {filteredProducts.map((product) => {
                const { id, title, discount, price } = product;
                const product_id = Number(id) || 0;

                const rawImages = typeof product.images === 'string' ? JSON.parse(product.images) : product.images || [];
                const imageList = rawImages.map(img => img.startsWith('http') ? img : `/assets/products/${product_id}/${img}`);
                const displayImage = imageList.length > 0 ? imageList[0] : '/placeholder.jpg';

                const discountPercentage = Number(discount) || 0;
                const currentPrice = Number(price) || 0;
                const originalPrice = discountPercentage > 0 ? Math.round(currentPrice / (1 - discountPercentage / 100)) : currentPrice;

                return (
                  <div key={id} className="swiper-slide h-auto">
                    <div className="flex flex-col h-full bg-white border border-[#00739D] rounded-md p-4 text-center hover:shadow-lg transition-shadow">

                      {/* Image Container Fix --- */}
                      <div
                        className="d-flex align-items-center justify-content-center overflow-hidden mb-3 rounded-top"
                        style={{
                          height: '280px',       // 👈 Exact fixed height for vertical alignment
                          backgroundColor: '#fff', // 👈 Clean background for the "frame"
                          width: '100%'
                        }}
                      >
                        <img
                          src={displayImage}
                          alt={title}
                          className="img-fluid"
                          style={{
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain', // 👈 Keeps aspect ratio without cropping
                            transition: 'transform 0.5s ease'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
                          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                          onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                        />
                      </div>

                      {/* Info Area */}
                      <div className="flex flex-col flex-grow">
                        {/* Title with line clamp (truncates after 2 lines for balance) */}
                        <h6 className="text-[#333] text-[14px] font-bold leading-tight line-clamp-2 min-h-[40px] mb-2 overflow-hidden">
                          {title}
                        </h6>

                        <div className="mt-auto">
                          <div className="flex flex-col items-center justify-center gap-1 mb-3">
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-[#333] text-lg">Rs. {currentPrice}</span>
                              {discountPercentage > 0 && (
                                <span className="text-gray-400 line-through text-[12px]">Rs. {originalPrice}</span>
                              )}
                            </div>
                            {product.isBestSeller && (
                              <span className="bg-[#FFECC7] text-[#855B00] text-[10px] px-2 py-0.5 rounded font-black uppercase">
                                Best Seller
                              </span>
                            )}
                          </div>

                          {product.stock > 0 && (
                            <div className="bg-[#00B67A] text-white text-[11px] py-1.5 px-5 rounded-full inline-block font-bold">
                              Express Shipping
                            </div>
                          )}
                        </div>
                      </div>


                    </div>
                  </div>
                );
              })}
            </div>
            <div className="swiper-pagination s2-pagination !bottom-4"></div>
          </div>

          {/* Navigation Arrows */}
          {/* Navigation Arrows - High-End Bootstrap Style */}
          <div className="d-none d-xl-block">
            {/* Previous Button */}
            <button
              className="s2-prev position-absolute top-50 start-0 translate-middle shadow-sm border-0 d-flex align-items-center justify-content-center"
              style={{
                zIndex: 20,
                width: '50px',
                height: '50px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                marginLeft: '-25px', // Moves it slightly outside the slider container
                transition: 'all 0.3s ease'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            {/* Next Button */}
            <button
              className="s2-next position-absolute top-50 end-0 translate-middle shadow-sm border-0 d-flex align-items-center justify-content-center"
              style={{
                zIndex: 20,
                width: '50px',
                height: '50px',
                backgroundColor: '#ffffff',
                borderRadius: '50%',
                marginRight: '-75px', // Adjusted for centering
                transition: 'all 0.3s ease'
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>


        </div>
      </div>

      <style jsx>{`
            /* Hover Effects for Navigation */
            .s2-prev:hover, .s2-next:hover {
              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
              transform: translateY(-50%) scale(1.1) !important;
            }
            
            .s2-prev:hover .nav-icon, .s2-next:hover .nav-icon {
              stroke: #01A9E6 !important;
            }

            /* Swiper Pagination Style */
            :global(.s2-pagination .swiper-pagination-bullet-active) {
              background: #01A9E6 !important;
              width: 25px !important;
              border-radius: 5px !important;
            }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;  
            overflow: hidden;
          }
      `}</style>
    </section>
  );
}