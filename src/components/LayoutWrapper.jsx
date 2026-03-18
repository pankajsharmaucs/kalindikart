'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from './Header';
import Footer from './Footer';

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/admin');

  const [settings, setSettings] = useState({});

  /* ===============================
     FETCH SETTINGS
  ============================== */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();

        if (data.success) {
          setSettings(data.data || {});
        }
      } catch (err) {
        console.error('Settings fetch error:', err);
      }
    };

    fetchSettings();
  }, []);

  return (
    <>
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
          display: 'inline-block',
          whiteSpace: 'nowrap',
          animation: 'kk-bounce 10s ease-in-out infinite alternate'
        }}>
          <style>{`
              @keyframes kk-bounce {
                0% { transform: translateX(0%); }
                100% { transform: translateX(calc(100vw - 100%)); }
              }
            `}</style>

          {/* 🔥 Dynamic */}
          <span>
            {settings.site_name || 'KalindiKart'}
          </span>


        </div>
      </div>

      {!isAdminRoute && <Header />}
      <main>{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}