'use client';

import React, { useEffect, useState } from "react";

export default function ReelsSlider() {
  const [reels, setReels] = useState([]);

  useEffect(() => {
    const fetchReels = async () => {
      const res = await fetch('/api/reels');
      const data = await res.json();
      setReels(data.reels || []);
    };
    fetchReels();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.Swiper) {
      new window.Swiper(".myReelsSwiper", {
        effect: 'coverflow',
        grabCursor: true,
        centeredSlides: true,
        slidesPerView: 'auto',
        loop: true,
        coverflowEffect: {
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        },
        pagination: {
          el: '.swiper-pagination-reels',
          clickable: true,
        },
      });
    }
  }, [reels]);

  return (
    <section className="section-padding bg-light">
      <div className="container text-center">
        <h2 className="section-header">Exclusive Reels 🎥</h2>

        <div className="swiper myReelsSwiper" style={{ padding: "0 0 50px" }}>
          <div className="swiper-wrapper">
            {reels.map((reel, index) => (
              <div className="swiper-slide" key={index} style={{ maxWidth: "300px", height: "450px" }}>
                <iframe
                  src={`${reel.permalink}embed/`}
                  width="100%"
                  height="100%"
                  allow="autoplay; encrypted-media"
                  style={{ borderRadius: "10px", border: 0 }}
                ></iframe>
              </div>
            ))}
          </div>

          <div className="swiper-pagination swiper-pagination-reels"></div>
        </div>
      </div>
    </section>
  );
}
