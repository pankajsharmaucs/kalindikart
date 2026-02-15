import FloatingSocialButtons from "./FloatingSocialButtons";

export default function Footer() {
  return (
    <footer
      className="footer"
      style={{
        backgroundImage: "url('/main/footer-bg.png')",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
        color: "#fff",
      }}
    >

      {/* height control */}
      <div
        style={{
          paddingTop: "0px",
          paddingBottom: "14px",
        }}
      >

        {/* soft backdrop only behind content */}
        <div
          style={{
            // background: "rgba(6, 35, 80, 0.45)",
            borderRadius: "14px",
            // padding: "26px 20px",
          }}
        >
          <div className="container">
            <div className="row p-2">

              {/* Column 1: Company Info */}
              <div className="col-lg-4 col-md-6 mb-3">
                <img
                  src="/main/kalindikart_logo.png"
                  width="140"
                  alt="KalindiKart Logo"
                />
                <p
                  className="small mt-2"
                  style={{ lineHeight: "1.6", color: "#e2f1ff" }}
                >
                  Opulent Indulgence. We are dedicated to preserving the ancient art
                  of brass and bronze idol making, creating heirlooms for the modern home.
                </p>

                {/* Social Icons (OLD CODE KE JAISA) */}
                <div className="social-icons mt-3">
                  <a href="#" className="me-3 text-white">
                    <i className="fab fa-facebook-f"></i>
                  </a>
                  <a href="#" className="me-3 text-white">
                    <i className="fab fa-instagram"></i>
                  </a>
                  <a href="#" className="me-3 text-white">
                    <i className="fab fa-twitter"></i>
                  </a>
                  <a href="#" className="text-white">
                    <i className="fab fa-youtube"></i>
                  </a>
                </div>
              </div>

              {/* Column 2: Quick Links */}
              <div className="col-lg-2 col-md-6 col-6 mb-3">
                <h5 className="text-white mb-2">Products</h5>
                <a href="/about" className="d-block text-light mb-1">About Us</a>
                <a href="/contact" className="d-block text-light mb-1">Contact Us</a>
                <a href="/bulk-orders" className="d-block text-light mb-1">Bulk Orders</a>
                <a href="/faqs" className="d-block text-light">FAQs</a>
              </div>

              {/* Column 3: Customer Care */}
              <div className="col-lg-3 col-md-6 col-6 mb-3">
                <h5 className="text-white mb-2">Discover</h5>
                <a href="/shipping-policy" className="d-block text-light mb-1">Shipping Policy</a>
                <a href="/refund-returns" className="d-block text-light mb-1">Refund & Returns</a>
                <a href="/terms-of-service" className="d-block text-light mb-1">Terms of Service</a>
                <a href="/privacy-policy" className="d-block text-light">Privacy Policy</a>
              </div>

              <div className="col-lg-2 col-md-6 col-6 mb-3">
                <h5 className="text-white mb-2">Information</h5>
                <a href="/about" className="d-block text-light mb-1">About Us</a>
                <a href="/contact" className="d-block text-light mb-1">Contact Us</a>
                <a href="/bulk-orders" className="d-block text-light mb-1">Bulk Orders</a>
                <a href="/faqs" className="d-block text-light">FAQs</a>
              </div>



              {/* Column 4: Newsletter */}
              <div className="col-lg-3 col-md-6 col-sm-6 col-12 mb-3">
                <h5 className="text-white mb-2">Join Our Newsletter</h5>
                <p className="small text-light mb-2">
                  Get 10% off your first order & updates on new arrivals.
                </p>
                <div className="input-group mb-2">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your email address"
                  />
                  <button className="btn btn-primary" type="button">
                    Subscribe
                  </button>
                </div>
              </div>

            </div>


            <FloatingSocialButtons />

            {/* Bottom copyright */}
            <div
              className="text-center pt-3 mt-3"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.25)",
                fontSize: "13px",
                color: "#e2f1ff",
              }}
            >
              © 2026 KalindiKart. All Rights Reserved.
            </div>




          </div>
        </div>
      </div>
    </footer>
  );
} 