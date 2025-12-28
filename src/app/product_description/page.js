  "use client";

  import { useState } from "react";
  import { Swiper, SwiperSlide } from "swiper/react";
  import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";

  import "swiper/css";
  import "swiper/css/navigation";
  import "swiper/css/pagination";
  import "swiper/css/free-mode";
  import "swiper/css/thumbs";

  export default function ProductDescription() {
    const [thumbsSwiper, setThumbsSwiper] = useState(null);

    const images = [1016, 1015, 1018, 1019];

    return (
      <div className="container py-4">

        <div className="row">

          {/* Thumbnails */}
          <div className="col-md-2">
            <Swiper
              onSwiper={setThumbsSwiper}
              direction="vertical"
              spaceBetween={10}
              slidesPerView={4}
              freeMode={true}
              watchSlidesProgress={true}
              modules={[FreeMode, Thumbs]}
              style={{ height: "420px" }}
            >
              {images.map((id) => (
                <SwiperSlide key={id}>
                  <img
                    src={`https://picsum.photos/id/${id}/400/400`}
                    className="img-fluid rounded"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Main Slider */}
          <div className="col-md-6">
            <Swiper
              spaceBetween={10}
              navigation={true}
              pagination={{ clickable: true }}
              thumbs={{ swiper: thumbsSwiper }}
              modules={[Navigation, Pagination, Thumbs]}
              className="mySwiper2"
              style={{ height: "420px" }}
            >
              {images.map((id) => (
                <SwiperSlide key={id}>
                  <img
                    src={`https://picsum.photos/id/${id}/1200/1200`}
                    className="img-fluid rounded"
                    style={{ height: "100%", objectFit: "contain" }}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Product Details */}
          <div className="col-md-4">
            <h3>River Goddess Ganga</h3>
            <h4 className="text-success">₹11,340</h4>
            <button className="btn btn-dark w-100 my-2">Add to Cart</button>
            <button className="btn btn-outline-primary w-100">Buy Now</button>
          </div>

        </div>
      </div>
    );
  }
