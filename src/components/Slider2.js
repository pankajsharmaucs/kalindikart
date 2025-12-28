"use client";

import React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Navigation, Pagination, Autoplay } from "swiper/modules";

export default function Slider2({ data }) {
  return (
    <Swiper
      slidesPerView={5}
      spaceBetween={20}
      navigation={true}
      pagination={{ type: "progressbar" }}
      autoplay={{ delay: 2000, disableOnInteraction: false }}
      modules={[Navigation, Pagination, Autoplay]}
      className="mySwiper"
    >
      {data.map((item, index) => (
        <SwiperSlide key={index}>
          <Link href={item.link}>
            <img
              src={item.img}
              alt="Product"
              style={{
                width: "100%",
                height: "250px",
                objectFit: "cover",
                borderRadius: "10px",
                cursor: "pointer",
              }}
            />
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
