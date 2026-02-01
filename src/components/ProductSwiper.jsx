// components/ProductSwiper.jsx
'use client';

import React, { useEffect, useState, useMemo } from 'react';

const IMAGE_PATH_PREFIX = '/assets/';

export default function ProductSwiper({ imageList = [], productTitle, onImageChange }) {
  const [mainSwiper, setMainSwiper] = useState(null);
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const fallbackImage = 'https://via.placeholder.com/600x600/178ad6/FFFFFF?text=Product+Image';

  const imagesToDisplay = useMemo(
    () => (imageList.length > 0 ? imageList : [fallbackImage]),
    [imageList]
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !window.Swiper) {
      console.warn('Swiper not found. Ensure the CDN script is loaded.');
      return;
    }

    if (mainSwiper) mainSwiper.destroy(true, true);
    if (thumbsSwiper) thumbsSwiper.destroy(true, true);

    // Initialize Thumb Swiper
    const thumbs = new window.Swiper('.product-thumbs-swiper', {
      spaceBetween: 10,
      slidesPerView: 'auto',
      freeMode: true,
      watchSlidesProgress: true,
      direction: 'vertical',
      breakpoints: {
        0: {
          direction: 'horizontal',
          slidesPerView: 4,
          spaceBetween: 8,
        },
        992: {
          direction: 'vertical',
          slidesPerView: 5,
          spaceBetween: 10,
        },
      },
    });
    setThumbsSwiper(thumbs);

    // Initialize Main Swiper
    const main = new window.Swiper('.product-main-swiper', {
      loop: imagesToDisplay.length > 1,
      spaceBetween: 10,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true,
      },
      thumbs: {
        swiper: thumbs,
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
      on: {
        slideChange: function () {
          if (onImageChange) {
            const realIndex = this.realIndex;
            onImageChange(imagesToDisplay[realIndex]);
          }
          // Reset zoom when slide changes
          setIsZoomed(false);
        },
      },
    });
    setMainSwiper(main);

    return () => {
      if (main) main.destroy(true, true);
      if (thumbs) thumbs.destroy(true, true);
    };
  }, [imagesToDisplay, onImageChange]);

  const handleZoomToggle = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <>
      <div className="product-gallery-container">
        {/* THUMBNAILS */}
        <div className="product-thumbs-wrap">
          <div className="swiper product-thumbs-swiper">
            <div className="swiper-wrapper">
              {imagesToDisplay.map((img, index) => (
                <div key={index} className="swiper-slide product-thumb-item">
                  <div className="thumb-wrapper">
                    <img
                      src={img === fallbackImage ? img : `/${img}`}
                      alt={`${productTitle} thumbnail ${index + 1}`}
                      className="img-fluid thumb-image"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN IMAGE SLIDER */}
        <div className="product-main-wrap">
          <div className="swiper product-main-swiper">
            <div className="swiper-wrapper">
              {imagesToDisplay.map((img, index) => (
                <div key={index} className="swiper-slide product-main-slide">
                  <div 
                    className={`main-image-placeholder ${isZoomed ? 'zoomed' : ''}`}
                    onClick={handleZoomToggle}
                  >
                    <img
                      src={img === fallbackImage ? img : `/${img}`}
                      alt={productTitle}
                      className="img-fluid main-product-image"
                    />
                    {/* Zoom Icon */}
                    <div className="zoom-icon">
                      <i className={`fas ${isZoomed ? 'fa-search-minus' : 'fa-search-plus'}`}></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {imagesToDisplay.length > 1 && (
              <>
                <div className="swiper-button-next"></div>
                <div className="swiper-button-prev"></div>
                <div className="swiper-pagination"></div>
              </>
            )}
          </div>

          {/* Image Counter */}
          <div className="image-counter">
            <i className="fas fa-images me-2"></i>
            {imagesToDisplay.length} {imagesToDisplay.length === 1 ? 'Image' : 'Images'}
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* GALLERY CONTAINER */
        .product-gallery-container {
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }

        @media (min-width: 992px) {
          .product-gallery-container {
            flex-direction: row;
          }
        }

        /* THUMBNAILS */
        .product-thumbs-wrap {
          width: 100%;
          order: 2;
        }

        @media (min-width: 992px) {
          .product-thumbs-wrap {
            width: 100px;
            height: 500px;
            order: 1;
          }
        }

        .product-thumbs-swiper {
          width: 100%;
          height: 100%;
        }

        .product-thumb-item {
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .thumb-wrapper {
          border: 2px solid transparent;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          background: #f8f9fa;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .product-thumb-item:hover .thumb-wrapper {
          border-color: #178ad6;
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(23, 138, 214, 0.2);
        }

        .swiper-slide-thumb-active .thumb-wrapper {
          border-color: #178ad6;
          background: #fff;
          box-shadow: 0 4px 12px rgba(23, 138, 214, 0.3);
        }

        .thumb-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .product-thumb-item:hover .thumb-image {
          transform: scale(1.1);
        }

        /* MAIN IMAGE */
        .product-main-wrap {
          flex: 1;
          position: relative;
          order: 1;
        }

        @media (min-width: 992px) {
          .product-main-wrap {
            order: 2;
          }
        }

        .product-main-swiper {
          width: 100%;
          border-radius: 12px;
          overflow: hidden;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .main-image-placeholder {
          width: 100%;
          height: 400px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          cursor: zoom-in;
          transition: all 0.3s ease;
        }

        @media (min-width: 992px) {
          .main-image-placeholder {
            height: 500px;
          }
        }

        .main-image-placeholder.zoomed {
          cursor: zoom-out;
          background: rgba(0, 0, 0, 0.95);
        }

        .main-product-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .main-image-placeholder.zoomed .main-product-image {
          transform: scale(1.8);
        }

        /* Zoom Icon */
        .zoom-icon {
          position: absolute;
          bottom: 15px;
          right: 15px;
          width: 45px;
          height: 45px;
          background: rgba(0, 0, 0, 0.7);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.1rem;
          opacity: 0;
          transition: all 0.3s ease;
          pointer-events: none;
          z-index: 5;
        }

        .main-image-placeholder:hover .zoom-icon {
          opacity: 1;
          transform: scale(1.1);
        }

        .main-image-placeholder.zoomed .zoom-icon {
          opacity: 1;
          background: rgba(255, 255, 255, 0.9);
          color: #178ad6;
        }

        /* NAVIGATION BUTTONS */
        .swiper-button-next,
        .swiper-button-prev {
          background: rgba(255, 255, 255, 0.9);
          width: 45px;
          height: 45px;
          border-radius: 50%;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
        }

        .swiper-button-next:after,
        .swiper-button-prev:after {
          font-size: 1.2rem;
          color: #178ad6;
          font-weight: 900;
        }

        .swiper-button-next:hover,
        .swiper-button-prev:hover {
          background: #178ad6;
          transform: scale(1.1);
        }

        .swiper-button-next:hover:after,
        .swiper-button-prev:hover:after {
          color: white;
        }

        /* Hide navigation when zoomed */
        .main-image-placeholder.zoomed ~ .swiper-button-next,
        .main-image-placeholder.zoomed ~ .swiper-button-prev {
          opacity: 0;
          pointer-events: none;
        }

        /* PAGINATION */
        .swiper-pagination {
          bottom: 10px !important;
        }

        .swiper-pagination-bullet {
          width: 10px;
          height: 10px;
          background: rgba(255, 255, 255, 0.7);
          opacity: 1;
          border: 2px solid #178ad6;
        }

        .swiper-pagination-bullet-active {
          background: #178ad6;
        }

        /* IMAGE COUNTER */
        .image-counter {
          position: absolute;
          top: 15px;
          left: 15px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          z-index: 10;
          display: flex;
          align-items: center;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        /* RESPONSIVE */
        @media (max-width: 991px) {
          .product-thumbs-wrap {
            height: auto;
          }

          .thumb-wrapper {
            height: 70px;
          }

          .swiper-button-next,
          .swiper-button-prev {
            width: 35px;
            height: 35px;
          }

          .swiper-button-next:after,
          .swiper-button-prev:after {
            font-size: 1rem;
          }

          .image-counter {
            font-size: 0.8rem;
            padding: 6px 12px;
          }

          .main-image-placeholder.zoomed .main-product-image {
            transform: scale(1.5);
          }
        }

        @media (max-width: 576px) {
          .main-image-placeholder {
            height: 300px;
          }

          .thumb-wrapper {
            height: 60px;
          }

          .zoom-icon {
            width: 40px;
            height: 40px;
            font-size: 0.95rem;
          }

          .main-image-placeholder.zoomed .main-product-image {
            transform: scale(1.3);
          }
        }
      `}</style>
    </>
  );
}
