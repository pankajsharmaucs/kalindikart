'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcats, setLoadingSubcats] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    await logout();
    window.location.href = '/'; // or router.push('/')
  };

  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Fetch main categories
  useEffect(() => {
    fetch('/api/category')
      .then((res) => res.json())
      .then((data) => {
        setCategories(data || []);
        setLoadingCategories(false);
      })
      .catch((err) => {
        console.error('Failed to load categories:', err);
        setLoadingCategories(false);
      });
  }, []);

  // Fetch subcategories on hover
  useEffect(() => {
    if (!hoveredCategorySlug) {
      setSubcategories([]);
      return;
    }

    setLoadingSubcats(true);
    fetch(`/api/subcategory?category_slug=${hoveredCategorySlug}`)
      .then((res) => res.json())
      .then((data) => {
        setSubcategories(data || []);
        setLoadingSubcats(false);
      })
      .catch((err) => {
        console.error('Failed to load subcategories:', err);
        setSubcategories([]);
        setLoadingSubcats(false);
      });
  }, [hoveredCategorySlug]);

  const closeNavbar = () => {
    const megaMenu = document.querySelector('.mega-menu-container');

    if (megaMenu?.classList.contains('show')) {
      megaMenu.classList.remove('show');
    }
  };

  // Close menu when clicking outside (mobile safety)
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar navbar-expand-lg navbar-light sticky-top bg-white shadow-sm">
      <div className="container position-relative">
        {/* Logo */}
        <Link className="navbar-brand" href="/">
          <img src="/main/kalindikart_logo.png" width="100" alt="KalindiKart Logo" />
        </Link>

        {/* Mobile Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Main Menu */}
        <div className={`collapse navbar-collapse ${isMobileMenuOpen ? 'show' : ''}`}>
          <ul className="navbar-nav mx-auto mb-2 mb-lg-0 align-items-center">
            <li className="nav-item">
              <Link className={`nav-link ${isActive('/') ? 'active-link' : ''}`} href="/" onClick={closeNavbar}>
                Home
              </Link>
            </li>

            <li className="nav-item">
              <Link className={`nav-link ${isActive('/products') ? 'active-link' : ''}`} href="/products" onClick={closeNavbar}>
                Products
              </Link>
            </li>

            {/* Category Dropdown */}
            <li
              className="nav-item dropdown mega-dropdown position-static"
              ref={dropdownRef}
              onMouseLeave={() => !isMobileMenuOpen && setHoveredCategorySlug(null)}
            >
              <Link
                className={`nav-link dropdown-toggle ${isActive('/category') ? 'active-link' : ''}`}
                href="/category"
                role="button"
                onClick={(e) => {
                  closeNavbar();

                  if (window.innerWidth < 992) {
                    e.preventDefault();
                    setIsMobileMenuOpen(false); // usually false to close
                  }
                }}
                onMouseEnter={() => window.innerWidth >= 992 && setHoveredCategorySlug(categories[0]?.slug || null)}
              >
                Category
              </Link>

              {/* Mega Menu - Hover & Mobile Compatible */}
              <div
                className={`mega-menu-container ${hoveredCategorySlug || isMobileMenuOpen ? 'show' : ''}`}
                onMouseEnter={() => window.innerWidth >= 992 && hoveredCategorySlug && null}
                onMouseLeave={() => window.innerWidth >= 992 && setHoveredCategorySlug(null)}
              >
                <div className="container py-4">
                  <div className="row">
                    {/* Left: Categories with hover highlight */}
                    <div className="col-lg-3 pe-4 border-end">
                      <h5 className="fw-bold mb-4 text-dark d-none d-lg-block">All Categories</h5>

                      {loadingCategories ? (
                        <p className="text-muted small">Loading...</p>
                      ) : (
                        <ul className="list-unstyled category-list">
                          {categories.map((cat) => {
                            const slug = cat.slug || cat.category_name?.toLowerCase().replace(/\s+/g, '-');
                            const isHovered = hoveredCategorySlug === slug;

                            return (
                              <li
                                key={cat.id}
                                className={`category-hover-item ${isHovered ? 'hovered' : ''}`}
                                onMouseEnter={() => setHoveredCategorySlug(slug)}
                              >
                                <Link
                                  href={`/category/${cat.slug.replace(' ', '-')}`}
                                  className="text-decoration-none d-flex align-items-center py-3 px-3 rounded"
                                  onClick={closeNavbar}
                                >
                                  {cat.image ? (
                                    <img
                                      src={cat.image.startsWith('http')
                                        ? cat.image
                                        : cat.image.startsWith('/')
                                          ? cat.image
                                          : `/assets/category/${cat.image.split('/').pop()}`
                                      }
                                      alt={cat.category_name}
                                      width={32}
                                      height={32}
                                      className="me-3 rounded"
                                      style={{ objectFit: 'cover' }}
                                      onError={(e) => e.target.style.display = 'none'}
                                    />
                                  ) : (
                                    <div className="bg-light rounded me-3 d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                                      <i className="fas fa-image text-muted small"></i>
                                    </div>
                                  )}
                                  <span className={isHovered ? 'text-primary fw-bold' : 'text-dark'}>
                                    {cat.category_name}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {/* Right: Subcategories with Images */}
                    <div className="col-lg-9 ps-lg-5">
                      {loadingSubcats ? (
                        <p className="text-muted">Loading subcategories...</p>
                      ) : subcategories.length === 0 ? (
                        <p className="text-muted">
                          {hoveredCategorySlug?.replace(' ', '-') ? 'No subcategories' : 'Select a category'}
                        </p>
                      ) : (
                        <div className="row g-4">
                          {subcategories.map((subcat) => {
                            const subSlug = subcat.slug || subcat.sub_category_name?.toLowerCase().replace(/\s+/g, '-');
                            return (
                              <div className="col-6 col-md-4 col-lg-3" key={subcat.id}>
                                <Link
                                  href={`/category/${hoveredCategorySlug?.replace(' ', '-')}/${subSlug?.replace(' ', '-')}`}
                                  className="text-decoration-none"
                                  onClick={closeNavbar}
                                >
                                  <div className="subcat-item text-center">
                                    {subcat.image ? (
                                      <Image
                                        src={subcat.image}
                                        alt={subcat.sub_category_name}
                                        width={120}
                                        height={120}
                                        className="subcat-img mb-3 rounded shadow-sm"
                                      />
                                    ) : (
                                      <div className="placeholder-img bg-light rounded shadow-sm mb-3 d-flex align-items-center justify-content-center">
                                        <span className="text-muted small">No image</span>
                                      </div>
                                    )}
                                    <p className="subcat-name text-dark mb-0 fw-medium">
                                      {subcat.sub_category_name}
                                    </p>
                                  </div>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>

            {/* Other Links */}
            <li className="nav-item"><Link onClick={closeNavbar} className={`nav-link ${isActive('/collections') ? 'active-link' : ''}`} href="/collections">Collections</Link></li>
            <li className="nav-item"><Link onClick={closeNavbar} className={`nav-link ${isActive('/trending') ? 'active-link' : ''}`} href="/trending">Trending</Link></li>
            <li className="nav-item"><Link onClick={closeNavbar} className={`nav-link ${isActive('/about') ? 'active-link' : ''}`} href="/about">About us</Link></li>
            {/* <li className="nav-item"><Link onClick={closeNavbar} className={`nav-link ${isActive('/login') ? 'active-link' : ''}`} href="/login">Login</Link></li> */}
                      
            {isLoggedIn ? (
            <>
              <span>Welcome, {user?.name || user?.email}</span>
              <button onClick={handleLogout} className="btn btn-outline-danger">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="btn btn-primary-gold">
              Login
            </Link>
          )}
         
          </ul>

          {/* Right Icons */}
          <div className="nav-icons d-flex align-items-center">
            {/* <i className="fas fa-search me-3 cursor-pointer"></i> */}
            {/* <i className="far fa-user me-3 cursor-pointer"></i> */}
            {/* <div className="position-relative me-3"><i className="far fa-heart cursor-pointer"></i><span className="badge-count">0</span></div> */}
            <div className="position-relative"><i className="fas fa-shopping-cart cursor-pointer"></i><span className="badge-count">0</span></div>
          </div>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .nav-link {
          font-weight: 500;
          transition: all 0.3s ease;
          position: relative;
        }
        .nav-link.active-link {
          font-weight: 700;
          color: #c9a227 !important;
        }
        .nav-link.active-link::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #178ad6ff;
          border-radius: 2px;
        }

        /* Mega Menu Container */
        .mega-menu-container {
          position: absolute;
          top: 80%;
          left: 0;
          width: 100%;
          background: white;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          z-index: 1000;
          opacity: 0;
          visibility: hidden;
          transform: translateY(10px);
          transition: all 0.3s ease;
          border-top: 3px solid #178ad6ff;
        }
        .mega-menu-container.show {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        /* Hovered Category Style */
        .category-hover-item.hovered {
          background-color: #cef6ffbc;
          border-left: 4px solid #27bbc9ff;
        }
        .category-hover-item a {
          transition: color 0.3s ease;
        }
        .text-gold {
          color: #c9a227 !important;
        }

        /* Subcategory Image */
        .subcat-img {
          object-fit: cover;
          transition: transform 0.3s ease;
          border:1px solid #000!important;
        }
        .subcat-item:hover .subcat-img {
          transform: scale(1.08);
        }
        .placeholder-img {
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }
        .subcat-name {
          font-size: 0.95rem;
          line-height: 1.3;
        }

        .badge-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: #c9a227;
          color: white;
          font-size: 10px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cursor-pointer { cursor: pointer; }

        /* Mobile Adjustments */
        @media (max-width: 991px) {
          .mega-menu-container {
            position: static;
            box-shadow: none;
            border-top: none;
            transform: none;
            opacity: 1;
            visibility: visible;
            padding: 20px 0;
            background: #f9f9f9;
          }
          .mega-menu-container.show {
            display: block;
          }
          .category-list .category-hover-item {
            border-left: none !important;
            background: transparent !important;
          }
        }
      `}</style>
    </nav>
  );
}