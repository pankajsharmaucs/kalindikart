'use client'; // Required for the logout click handler

import 'bootstrap/dist/css/bootstrap.min.css';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import './loader.css'; // optional CSS file for styling
import { useState } from 'react';

export default function AdminLayout({ children }) {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true); // show loader

    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      // redirect after logout
      window.location.href = '/admin/login';
    }
  };

  return (
    <div className="container-fluid vh-100 overflow-hidden p-0">

      {isLoading && (
        <div className="fixed-loader">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Logging out...</span>
          </div>
        </div>
      )}
      <div className="row g-0 h-100">


        {/* Main Content Area */}
        <div className="col flex-grow-1 h-100 d-flex flex-column bg-light shadow-sm">

          {/* Top Navigation Bar */}
          <header className="navbar sticky-top bg-white shadow-sm px-4 py-2 border-bottom d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center">
              {/* Logo */}
              <Link href="/" className="kk-logo-brand" >
                <div className='d-flex align-items-end'>
                  <img src="/main/kalindikart_logo.png" alt="KalindiKart" />
                </div>
              </Link>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted small d-none d-md-inline">Welcome back, Admin</span>

              {/* Profile Dropdown */}
              <div className="dropdown">
                <button
                  className="btn btn-sm btn-outline-secondary border rounded-circle p-2 dropdown-toggle hide-caret"
                  type="button"
                  id="adminProfileDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  👤
                </button>
                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2" aria-labelledby="adminProfileDropdown">

                  <li><h6 className="dropdown-header">Admin Panel</h6></li>

                  <li>
                    <button
                      onClick={() => router.push('/admin/dashboard')}
                      className="dropdown-item d-flex align-items-center gap-2"
                    >
                      📊 Dashboard
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => router.push('/admin/upload-single-products')}
                      className="dropdown-item d-flex align-items-center gap-2"
                    >
                      ➕ Upload Single Product
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => router.push('/admin/upload-bulk-products')}
                      className="dropdown-item d-flex align-items-center gap-2"
                    >
                      📦 Upload Bulk Products
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => router.push('/admin/products')}
                      className="dropdown-item d-flex align-items-center gap-2"
                    >
                      🧾 Manage Products
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => router.push('/admin/manage-orders')}
                      className="dropdown-item d-flex align-items-center gap-2"
                    >
                      🧾 Manage Orders
                    </button>
                  </li>

                  <li>
                    <button
                      onClick={() => router.push('/admin/settings')}
                      className="dropdown-item d-flex align-items-center gap-2"
                    >
                      🌐 Manage Website
                    </button>
                  </li>
                  {/* 
                  <li>
                    <button
                      onClick={() => router.push('/admin/manage-seo')}
                      className="dropdown-item d-flex align-items-center gap-2"
                    >
                      🔎 Manage SEO
                    </button>
                  </li> */}

                  <li><hr className="dropdown-divider" /></li>

                  <li>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger d-flex align-items-center gap-2"
                    >
                      🚪 Logout
                    </button>
                  </li>

                </ul>
              </div>
            </div>
          </header>

          {/* Scrollable Workspace */}
          <main className="flex-grow-1 overflow-auto p-3 p-md-4" style={{ backgroundColor: '#f4f7f6' }}>
            <div className="container-fluid">
              {children}
            </div>
          </main>

        </div>
      </div>

      <style jsx>{`
        /* Removes the default arrow from the profile button */
        .hide-caret::after {
          display: none !important;
        }
        .dropdown-item {
          cursor: pointer;
          font-size: 0.9rem;
          padding: 0.6rem 1.2rem;
        }
        .dropdown-item:hover {
          background-color: #fff5f5;
        }
      `}</style>
    </div>
  );
}