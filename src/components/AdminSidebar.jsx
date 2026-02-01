// src/components/AdminSidebar.jsx
'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path) => pathname === path ? 'active bg-primary' : '';

  return (
    <nav className="col-md-3 col-lg-2 d-flex flex-column bg-dark text-white p-0 h-100 shadow position-relative">
      <div className="p-4 border-bottom border-secondary border-opacity-25 text-center">
        <h3 className="h5 mb-0 text-primary fw-bold">MODERN<span className="text-white">CMS</span></h3>
      </div>

      <div className="flex-grow-1 overflow-auto py-3">
        <small className="text-uppercase text-muted px-4 mb-2 d-block small fw-bold">Management</small>
        <ul className="nav nav-pills flex-column px-2 mb-4">
          <li className="nav-item">
            <Link href="/admin/products" className={`nav-link text-white d-flex align-items-center gap-2 py-2 mb-1 ${isActive('/admin/products')}`}>
              <span>📦</span> Products List
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/products/add" className={`nav-link text-white d-flex align-items-center gap-2 py-2 mb-1 ${isActive('/admin/products/add')}`}>
              <span>➕</span> Add Product
            </Link>
          </li>
        </ul>

        <small className="text-uppercase text-muted px-4 mb-2 d-block small fw-bold">Settings</small>
        <ul className="nav nav-pills flex-column px-2">
          <li className="nav-item">
            <Link href="/admin/seo" className={`nav-link text-white d-flex align-items-center gap-2 py-2 mb-1 ${isActive('/admin/seo')}`}>
              <span>🔍</span> SEO & Meta
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/admin/settings" className={`nav-link text-white d-flex align-items-center gap-2 py-2 mb-1 ${isActive('/admin/settings')}`}>
              <span>⚙️</span> Site Settings
            </Link>
          </li>
        </ul>
      </div>

      <div className="p-3 border-top border-secondary border-opacity-25 mt-auto">
        <button className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 fw-medium">
          Logout
        </button>
      </div>

      <style jsx>{`
        .nav-link:hover:not(.active) {
          background-color: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </nav>
  );
}