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