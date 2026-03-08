import './globals.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { AuthProvider } from '../context/AuthContext';
import LayoutWrapper from '../components/LayoutWrapper';

export const metadata = {
  title: 'KalindiKart - Arts, Home Decor, Gem Stones & Gods Brass Idol Store',
  description: 'Now Get unique brass idols, Gems, home decor, and artifacts.',
  icons: {
    icon: '/favicon.png?v=2',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:wght@400;600;700&family=Poppins:wght@300;400;500;600&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css" />
      </head>

      <body>
        <AuthProvider>

          {/* Top Banner */}
          <div style={{
            background: '#00739D',
            color: '#fff',
            fontSize: '14px',
            padding: '10px 0',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'flex',
              whiteSpace: 'nowrap',
              gap: '40px',
              animation: 'kk-marquee 20s linear infinite'
            }}>
              <style>{`
                @keyframes kk-marquee {
                  0% { transform: translateX(100%); }
                  100% { transform: translateX(-100%); }
                }
              `}</style>

              <span><i className="fas fa-truck-fast" style={{ color: '#5FD3FD' }}></i> Free Pan-India & COD</span>
              <span><i className="fas fa-bolt" style={{ color: '#5FD3FD' }}></i> Same Day Delhi/NCR</span>
              <span><i className="fas fa-gift" style={{ color: '#5FD3FD' }}></i> Free Brass Gift @ ₹5k+</span>
            </div>
          </div>

          {/* Header/Footer Controlled Here */}
          <LayoutWrapper>
            {children}
          </LayoutWrapper>

          <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
          <script src="https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js"></script>
          <script async src="//www.instagram.com/embed.js"></script>

        </AuthProvider>
      </body>
    </html>
  );
}