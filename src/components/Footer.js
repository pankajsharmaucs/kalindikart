export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row p-2">
          {/* Column 1: Company Info */}
          <div className="col-lg-4 col-md-6 mb-4">
            <img src="/main/kalindikart_logo.png" width="150px" alt="KalindiKart Logo" />
            <p className="small">Opulent Indulgence. We are dedicated to preserving the ancient art of brass and bronze idol making, creating heirlooms for the modern home.</p>
            <div className="social-icons mt-3">
              <a href="#"><i className="fab fa-facebook-f"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
          {/* Column 2: Quick Links */}
          <div className="col-lg-2 col-md-6 mb-4">
            <h5>Quick Links</h5>
            <a href="/about">About Us</a>
            <a href="/contact">Contact Us</a>
            <a href="/bulk-orders">Bulk Orders</a>
            <a href="/faqs">FAQs</a>
          </div>
          {/* Column 3: Policy Links */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Customer Care</h5>
            <a href="/shipping-policy">Shipping Policy</a>
            <a href="/refund-returns">Refund & Returns</a>
            <a href="/terms-of-service">Terms of Service</a>
            <a href="/privacy-policy">Privacy Policy</a>
          </div>
          {/* Column 4: Newsletter */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5>Join Our Newsletter</h5>
            <p className="small">Get 10% off your first order & updates on new arrivals.</p>
            <div className="input-group mb-3">
              <input type="email" className="form-control newsletter-input" placeholder="Your email address" aria-label="Email Address" />
              <button className="btn newsletter-btn" type="button">Subscribe</button>
            </div>
          </div>
        </div>
        <div className="text-center pt-4 border-top border-secondary">
          <p className="small mb-0">&copy; 2025 KalindiKart. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}