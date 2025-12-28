// components/ProductSwiper.jsx
'use client'; 

import React, { useEffect, useState, useMemo } from 'react';
// Assuming Swiper Core and required modules are loaded via CDN or npm install/import

// Define the path prefix once
const IMAGE_PATH_PREFIX = '/assets/'; 

export default function ProductSwiper({ imageList = [], productTitle, onImageChange }) {
    
    // State to hold the Swiper instances
    const [mainSwiper, setMainSwiper] = useState(null);
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    // Default fallback image
    const fallbackImage = 'https://via.placeholder.com/600x600/01A9E6/FFFFFF?text=Product+Image';
    
    // Use the actual image list or the fallback
    const imagesToDisplay = useMemo(() => 
        imageList.length > 0 ? imageList : [fallbackImage]
    , [imageList]);


    useEffect(() => {
        // Ensure Swiper class is available globally (from the CDN script)
        if (typeof window === 'undefined' || !window.Swiper) {
            console.warn("Swiper not found. Ensure the CDN script is loaded.");
            return;
        }

        // Destroy existing instances before creating new ones (important for state cleanup)
        if (mainSwiper) mainSwiper.destroy(true, true);
        if (thumbsSwiper) thumbsSwiper.destroy(true, true);


        // --- 1. Initialize Thumb Swiper ---
        const thumbs = new window.Swiper(".product-thumbs-swiper", {
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
                }
            }
        });
        setThumbsSwiper(thumbs);
        
        // --- 2. Initialize Main Swiper ---
        const main = new window.Swiper(".product-main-swiper", {
            loop: true,
            spaceBetween: 10,
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            thumbs: {
                swiper: thumbs,
            },
            // Update parent state when slide changes
            on: {
                slideChange: function() {
                    if (onImageChange) {
                        const realIndex = this.realIndex;
                        onImageChange(imagesToDisplay[realIndex]);
                    }
                }
            }
        });
        setMainSwiper(main);

        // Cleanup function
        return () => {
            if (main) main.destroy(true, true);
            if (thumbs) thumbs.destroy(true, true);
        };
        
    }, [imagesToDisplay, onImageChange]); // Dependency on the memoized list

    
    return (
        // The container uses flex to arrange vertical thumbs + main image on desktop
        <div className="product-gallery-container d-flex flex-column flex-lg-row">
            
            {/* 1. THUMBNAILS (Horizontal on mobile, Vertical on Desktop) */}
            <div className="product-thumbs-wrap mb-3 mb-lg-0 me-lg-3" style={{height:"350px"}}>
                <div className="swiper product-thumbs-swiper">
                    <div className="swiper-wrapper">
                        {imagesToDisplay.map((img, index) => (
                            // **FIX 2 (THUMBNAIL PATH):** Use the image directly if it's the fallback URL, otherwise add the prefix.
                            <div key={index} className="swiper-slide product-thumb-item">
                                <img 
                                    src={img === fallbackImage ? img : `/${img}`} 
                                    alt={`${productTitle} thumbnail ${index + 1}`} 
                                    className="img-fluid" 
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. MAIN IMAGE SLIDER */}
            <div className="product-main-wrap">
                <div className="swiper product-main-swiper">
                    <div className="swiper-wrapper">
                        {imagesToDisplay.map((img, index) => (
                            <div key={index} className="swiper-slide product-main-slide">
                                {/* **FIX 2 (MAIN IMAGE PATH):** Use the image directly if it's the fallback URL, otherwise add the prefix. */}
                                {/* **FIX 1 (IMAGE HEIGHT):** Added a new class `main-image-placeholder` to apply a fixed aspect ratio/height via CSS. */}
                                <div className="main-image-placeholder">
                                    <img 
                                        src={img === fallbackImage ? img : `/${img}`} 
                                        alt={productTitle} 
                                        className="img-fluid main-product-image" 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* Navigation buttons */}
                    <div className="swiper-button-next"></div>
                    <div className="swiper-button-prev"></div>
                </div>
            </div>
        </div>
    );
}