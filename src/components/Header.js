'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../stores/cartStore';

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcats, setLoadingSubcats] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Zustand cart store
  const cartItems = useCartStore((state) => state.cartItems);
  const fetchCartFromDB = useCartStore((state) => state.fetchCartFromDB);
  const userId = useCartStore((state) => state.userId);

  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null); // ✅ New ref for mobile menu

  const handleLogout = async () => {
    setShowUserDropdown(false);
    setIsMobileMenuOpen(false);
    await logout();
    window.location.href = '/';
  };

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  // Fetch categories
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
    if (!hoveredCategorySlug) return setSubcategories([]);

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

  // Fetch cart from DB if logged in
  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchCartFromDB(userId);
    }
  }, [isLoggedIn, userId, fetchCartFromDB]);

  // ✅ FIXED: Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      // Desktop category dropdown
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setHoveredCategorySlug(null);
      }
      
      // User dropdown
      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }
      
      // Mobile menu - ✅ Check if click is outside mobile menu AND hamburger button
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        const hamburger = e.target.closest('.kk-hamburger-btn');
        if (!hamburger) {
          setIsMobileMenuOpen(false);
        }
      }
    };

    if (isMobileMenuOpen || showUserDropdown || hoveredCategorySlug) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobileMenuOpen, showUserDropdown, hoveredCategorySlug]);

  const closeNavbar = () => {
    setHoveredCategorySlug(null);
    setIsMobileMenuOpen(false);
    setShowUserDropdown(false);
  };

  // Mobile navigation handler
  const handleMobileNav = (e, href) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔥 Mobile Nav Clicked:', href);
    closeNavbar();
    setTimeout(() => {
      router.push(href);
    }, 150);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <nav className="kk-header-navbar">
        <div className="container">
          <div className="kk-header-wrapper" ref={mobileMenuRef}>
            {/* Logo */}
            <Link className="kk-header-logo" href="/" onClick={closeNavbar}>
              <img src="/main/kalindikart_logo.png" alt="KalindiKart" className="kk-logo-image" />
            </Link>

            {/* Desktop Menu */}
            <div className="kk-desktop-nav d-none d-lg-flex">
              <Link className={`kk-nav-item ${isActive('/') ? 'kk-active' : ''}`} href="/">
                <i className="fas fa-home me-1"></i>
                Home
              </Link>

              <Link className={`kk-nav-item ${isActive('/products') ? 'kk-active' : ''}`} href="/products">
                <i className="fas fa-box me-1"></i>
                Products
              </Link>

              {/* Category Dropdown */}
              <div
                className="kk-category-dropdown"
                ref={dropdownRef}
                onMouseEnter={() => setHoveredCategorySlug(categories[0]?.slug || null)}
                onMouseLeave={() => setHoveredCategorySlug(null)}
              >
                <Link className={`kk-nav-item ${isActive('/category') ? 'kk-active' : ''}`} href="/category">
                  <i className="fas fa-th-large me-1"></i>
                  Category
                  <i className="fas fa-chevron-down ms-1 small"></i>
                </Link>

                <div className={`kk-mega-dropdown ${hoveredCategorySlug ? 'kk-show' : ''}`}>
                  <div className="container py-3">
                    <div className="row">
                      {/* Categories */}
                      <div className="col-3 border-end">
                        <h6 className="kk-mega-header">All Categories</h6>
                        {loadingCategories ? (
                          <p className="text-muted small">Loading...</p>
                        ) : (
                          <ul className="kk-category-list">
                            {categories.map((cat) => {
                              const slug = cat.slug || cat.category_name?.toLowerCase().replace(/\s+/g, '-');
                              const isHovered = hoveredCategorySlug === slug;
                              return (
                                <li
                                  key={cat.id}
                                  className={`kk-category-listitem ${isHovered ? 'kk-hovered' : ''}`}
                                  onMouseEnter={() => setHoveredCategorySlug(slug)}
                                >
                                  <Link href={`/category/${slug}`} onClick={closeNavbar}>
                                    {cat.image && (
                                      <img
                                        src={
                                          cat.image.startsWith('http')
                                            ? cat.image
                                            : cat.image.startsWith('/')
                                            ? cat.image
                                            : `/assets/category/${cat.image.split('/').pop()}`
                                        }
                                        alt={cat.category_name}
                                        className="kk-cat-thumbnail"
                                      />
                                    )}
                                    <span>{cat.category_name}</span>
                                    <i className="fas fa-chevron-right ms-auto small"></i>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </div>

                      {/* Subcategories */}
                      <div className="col-9">
                        {loadingSubcats ? (
                          <p className="text-muted">Loading...</p>
                        ) : subcategories.length === 0 ? (
                          <p className="text-muted">
                            {hoveredCategorySlug ? 'No subcategories available' : 'Hover over a category'}
                          </p>
                        ) : (
                          <div className="kk-subcat-grid">
                            {subcategories.map((subcat) => {
                              const subSlug =
                                subcat.slug || subcat.sub_category_name?.toLowerCase().replace(/\s+/g, '-');
                              return (
                                <Link
                                  key={subcat.id}
                                  href={`/category/${hoveredCategorySlug}/${subSlug}`}
                                  className="kk-subcat-item"
                                  onClick={closeNavbar}
                                >
                                  {subcat.image ? (
                                    <Image
                                      src={subcat.image}
                                      alt={subcat.sub_category_name}
                                      width={80}
                                      height={80}
                                      className="kk-subcat-image"
                                    />
                                  ) : (
                                    <div className="kk-subcat-noimage">
                                      <i className="fas fa-image"></i>
                                    </div>
                                  )}
                                  <p className="kk-subcat-title">{subcat.sub_category_name}</p>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link className={`kk-nav-item ${isActive('/collections') ? 'kk-active' : ''}`} href="/collections">
                <i className="fas fa-layer-group me-1"></i>
                Collections
              </Link>

              <Link className={`kk-nav-item ${isActive('/trending') ? 'kk-active' : ''}`} href="/trending">
                <i className="fas fa-fire me-1"></i>
                Trending
              </Link>

              <Link className={`kk-nav-item ${isActive('/about') ? 'kk-active' : ''}`} href="/about">
                <i className="fas fa-info-circle me-1"></i>
                About
              </Link>
            </div>

            {/* Right Icons */}
            <div className="kk-header-actions">
              {/* Cart */}
              <Link href="/cart" className="kk-icon-button kk-cart-button" onClick={closeNavbar}>
                <i className="fas fa-shopping-cart"></i>
                {cartTotal > 0 && <span className="kk-cart-badge">{cartTotal}</span>}
              </Link>

              {/* User */}
              {isLoggedIn ? (
                <div className="kk-user-section" ref={userDropdownRef}>
                  <button className="kk-icon-button kk-user-button" onClick={() => setShowUserDropdown(!showUserDropdown)}>
                    <i className="fas fa-user-circle"></i>
                  </button>

                  {showUserDropdown && (
                    <div className="kk-user-dropdown">
                      <div className="kk-user-profile">
                        <i className="fas fa-user-circle kk-user-icon"></i>
                        <div>
                          <div className="kk-user-displayname">{user?.name || 'User'}</div>
                          <div className="kk-user-contact">{user?.email || user?.mobile}</div>
                        </div>
                      </div>
                      <div className="kk-dropdown-divider"></div>
                      <Link
                        href="/user/dashboard/my-orders"
                        className="kk-dropdown-item"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <i className="fas fa-box me-2"></i>
                        My Orders
                      </Link>
                      <Link
                        href="/user/dashboard/profile"
                        className="kk-dropdown-item"
                        onClick={() => {
                          setShowUserDropdown(false);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <i className="fas fa-user-edit me-2"></i>
                        My Address
                      </Link>
                      <div className="kk-dropdown-divider"></div>
                      <button className="kk-dropdown-item kk-logout-item" onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt me-2"></i>
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="kk-login-button" onClick={closeNavbar}>
                  <i className="fas fa-sign-in-alt me-1"></i>
                  Login
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button className="kk-hamburger-btn d-lg-none" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
              </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="kk-mobile-navigation">
                <a href="/" className="kk-mobile-navitem" onClick={(e) => handleMobileNav(e, '/')}>
                  <i className="fas fa-home"></i>
                  <span>Home</span>
                </a>
                <a href="/products" className="kk-mobile-navitem" onClick={(e) => handleMobileNav(e, '/products')}>
                  <i className="fas fa-box"></i>
                  <span>Products</span>
                </a>
                <a href="/category" className="kk-mobile-navitem" onClick={(e) => handleMobileNav(e, '/category')}>
                  <i className="fas fa-th-large"></i>
                  <span>Category</span>
                </a>
                <a href="/collections" className="kk-mobile-navitem" onClick={(e) => handleMobileNav(e, '/collections')}>
                  <i className="fas fa-layer-group"></i>
                  <span>Collections</span>
                </a>
                <a href="/trending" className="kk-mobile-navitem" onClick={(e) => handleMobileNav(e, '/trending')}>
                  <i className="fas fa-fire"></i>
                  <span>Trending</span>
                </a>
                <a href="/about" className="kk-mobile-navitem" onClick={(e) => handleMobileNav(e, '/about')}>
                  <i className="fas fa-info-circle"></i>
                  <span>About</span>
                </a>
                {isLoggedIn && (
                  <>
                    <div className="kk-mobile-separator"></div>
                    <a href="/user/dashboard/my-orders" className="kk-mobile-navitem" onClick={(e) => handleMobileNav(e, '/user/dashboard/my-orders')}>
                      <i className="fas fa-box"></i>
                      <span>My Orders</span>
                    </a>
                    <button className="kk-mobile-navitem kk-mobile-logout" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i>
                      <span>Logout</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <style jsx global>{`
        /* ============= KALINDIKART HEADER ============= */
        .kk-header-navbar {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          position: sticky;
          top: 0;
          z-index: 9999999;
          padding: 0.75rem 0;
        }

        .kk-header-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          position: relative;
        }

        /* Logo */
        .kk-header-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
        }

        .kk-logo-image {
          height: 45px;
          width: auto;
        }

        /* Desktop Nav */
        .kk-desktop-nav {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          flex: 1;
          justify-content: center;
        }

        .kk-nav-item {
          padding: 0.6rem 1rem;
          color: #333;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          border-radius: 6px;
          transition: all 0.3s ease;
          position: relative;
          display: flex;
          align-items: center;
        }

        .kk-nav-item:hover {
          background: rgba(23, 138, 214, 0.05);
          color: #178ad6;
        }

        .kk-nav-item.kk-active {
          color: #178ad6;
          background: rgba(23, 138, 214, 0.1);
        }

        .kk-nav-item.kk-active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 30px;
          height: 3px;
          background: #178ad6;
          border-radius: 2px;
        }

        /* Category Dropdown */
        .kk-category-dropdown {
          position: relative;
        }

        /* Mega Menu */
        .kk-mega-dropdown {
          position: absolute;
          top: 100%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          margin-top: 0.5rem;
          width: 800px;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s ease;
          border-top: 3px solid #178ad6;
        }

        .kk-mega-dropdown.kk-show {
          opacity: 1;
          visibility: visible;
        }

        .kk-mega-header {
          font-weight: 700;
          color: #333;
          margin-bottom: 0.75rem;
          font-size: 0.95rem;
        }

        /* Category List */
        .kk-category-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .kk-category-listitem {
          margin-bottom: 0.25rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .kk-category-listitem.kk-hovered {
          background: rgba(23, 138, 214, 0.1);
        }

        .kk-category-listitem a {
          display: flex;
          align-items: center;
          padding: 0.6rem 0.75rem;
          color: #333;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 500;
          border-radius: 6px;
        }

        .kk-category-listitem:hover {
          background: rgba(23, 138, 214, 0.05);
        }

        .kk-cat-thumbnail {
          width: 24px;
          height: 24px;
          border-radius: 4px;
          margin-right: 0.5rem;
          object-fit: cover;
        }

        /* Subcategory Grid */
        .kk-subcat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }

        .kk-subcat-item {
          text-align: center;
          text-decoration: none;
          padding: 0.75rem;
          border-radius: 6px;
          transition: all 0.3s ease;
        }

        .kk-subcat-item:hover {
          background: #f8f9fa;
          transform: translateY(-3px);
        }

        .kk-subcat-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          object-fit: cover;
          margin-bottom: 0.5rem;
          border: 1px solid #e0e0e0;
        }

        .kk-subcat-noimage {
          width: 80px;
          height: 80px;
          background: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.5rem;
        }

        .kk-subcat-noimage i {
          color: #ccc;
          font-size: 1.5rem;
        }

        .kk-subcat-title {
          font-size: 0.8rem;
          color: #333;
          font-weight: 500;
          margin: 0;
          line-height: 1.3;
        }

        /* Header Actions */
        .kk-header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .kk-icon-button {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: white;
          border: 1px solid #e0e0e0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          color: #333;
          font-size: 1.1rem;
          text-decoration: none;
        }

        .kk-icon-button:hover {
          background: #f8f9fa;
          border-color: #178ad6;
          color: #178ad6;
        }

        .kk-cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: linear-gradient(135deg, #e79e3e,#e95943);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* User Dropdown */
        .kk-user-section {
          position: relative;
        }

        .kk-user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: white;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          border-radius: 8px;
          min-width: 220px;
          overflow: hidden;
          z-index: 1001;
        }

        .kk-user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
        }

        .kk-user-icon {
          font-size: 2rem;
        }

        .kk-user-displayname {
          font-weight: 700;
          font-size: 0.95rem;
        }

        .kk-user-contact {
          font-size: 0.75rem;
          opacity: 0.9;
        }

        .kk-dropdown-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          color: #333;
          font-size: 0.9rem;
          font-weight: 500;
          text-decoration: none;
          background: white;
          border: none;
          width: 100%;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .kk-dropdown-item:hover {
          background: #f8f9fa;
          color: #178ad6;
        }

        .kk-logout-item {
          color: #dc3545;
        }

        .kk-logout-item:hover {
          background: rgba(220, 53, 69, 0.05);
        }

        .kk-dropdown-divider {
          height: 1px;
          background: #e0e0e0;
        }

        /* Login Button */
        .kk-login-button {
          background: linear-gradient(135deg, #e79e3e,#e95943);
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.9rem;
          text-decoration: none;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }

        .kk-login-button:hover {
          background: linear-gradient(135deg, #e79e3e,#e95943);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(201, 162, 39, 0.3);
        }

        /* Hamburger */
        .kk-hamburger-btn {
          width: 40px;
          height: 40px;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          color: #333;
        }

        /* ============= MOBILE NAVIGATION ============= */
        .kk-mobile-navigation {
          display: flex;
          flex-direction: column;
          padding: 1rem 0;
          border-top: 1px solid #e0e0e0;
          margin-top: 0.75rem;
          animation: kkSlideDown 0.3s ease;
          width: 100%;
        }

        @keyframes kkSlideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .kk-mobile-navitem {
          padding: 0.85rem 1.1rem;
          color: #333;
          font-weight: 600;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.85rem;
          border-radius: 6px;
          margin-bottom: 0.3rem;
          background: white;
          border: none;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          width: 100%;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .kk-mobile-navitem::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(23, 138, 214, 0.05);
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .kk-mobile-navitem:active::before {
          opacity: 1;
        }

        .kk-mobile-navitem i {
          width: 22px;
          text-align: center;
          flex-shrink: 0;
          font-size: 1.05rem;
        }

        .kk-mobile-navitem:active {
          background: #e9ecef;
          color: #178ad6;
          transform: scale(0.98);
        }

        .kk-mobile-logout {
          color: #dc3545;
        }

        .kk-mobile-logout:active {
          background: rgba(220, 53, 69, 0.1);
        }

        .kk-mobile-separator {
          height: 1px;
          background: #e0e0e0;
          margin: 0.5rem 0;
        }

        /* ============= RESPONSIVE ============= */
        @media (max-width: 991px) {
          .kk-logo-image {
            height: 38px;
          }

          .kk-mega-dropdown {
            width: 100%;
            left: 0;
            transform: none;
          }

          .kk-mobile-navigation {
            width: 100%;
            order: 999;
          }
        }

        @media (max-width: 576px) {
          .kk-header-navbar {
            padding: 0.5rem 0;
          }

          .kk-icon-button {
            width: 36px;
            height: 36px;
            font-size: 1rem;
          }

          .kk-cart-badge {
            width: 18px;
            height: 18px;
            font-size: 0.65rem;
          }

          .kk-mobile-navitem {
            font-size: 0.9rem;
            padding: 0.75rem 0.95rem;
          }

          .kk-mobile-navigation {
            max-height: calc(100vh - 100px);
            overflow-y: auto;
          }
        }
      `}</style>
    </>
  );
}