// app/layout.js
import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// Note: You must ensure Header and Footer are defined in a separate file 
// (e.g., ../components/Header.js) and are valid React components.
import Header from '../components/Header';
import Footer from '../components/Footer';
import { AuthProvider } from '@/context/AuthContext';

// Add metadata for <head> tags
export const metadata = {
  title: 'KalindiKart - Arts, Home Decor, Powerful Gems & Gods Brass Idol Store',
  description: 'Your one-stop shop for unique brass idols, home decor, and artifacts.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Font Awesome & Google Fonts CDNs (CSS) */}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />

        {/* Swiper CDN for CSS */}
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />

        {/* The Instagram embed script is safer at the end of the body, 
            but keeping it here as you had it is acceptable if it's the only place.
            However, moving it to the body is recommended.
            I will move it to the body below for better execution timing. 
        */}
      </head>
      <body>

        <AuthProvider>
          {/* Top Notification Bar */}
          <div className="top-bar">
            <div className="container">
              FREE DELIVERY PAN INDIA. COD AVAILABLE NOW &nbsp;|&nbsp; SAME DAY DELIVERY AVAILABLE IN DELHI/NCR
              &nbsp;|&nbsp; FREE BRASS GIFT 🎁 ON ORDERS ABOVE ₹5,000! ✨
            </div>
          </div>

          {/* 2. PLACE THE HEADER */}
          <Header />

          {/* The main content area where page.js renders */}
          <main>{children}</main>

          {/* 3. PLACE THE FOOTER */}
          <Footer />

          {/* --- ALL JS SCRIPTS MOVED TO THE END OF BODY (Fixes Timing Issues) --- */}

          {/* Bootstrap & Swiper CDNs (Should run before the components initialize) */}
          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>

          {/* Instagram Embed Script (Crucial for blockquote embeds) */}
          <script async src="//www.instagram.com/embed.js"></script>

          {/* The previous inline Swiper initialization script is REMOVED.
             Initialization is now handled inside the components/HeroSwiper.js 
             and components/ReelsSlider.js useEffect hooks. */}
        </AuthProvider>
      </body>
    </html>
  );
}