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
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const cartItems = useCartStore((state) => state.cartItems);
  const fetchCartFromDB = useCartStore((state) => state.fetchCartFromDB);
  const userId = useCartStore((state) => state.userId);

  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuOverlayRef = useRef(null);
  const searchInputRef = useRef(null);

  const handleLogout = async () => {
    setShowUserDropdown(false);
    setIsMobileMenuOpen(false);
    await logout();
    window.location.href = '/';
  };

  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

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

  useEffect(() => {
    if (isLoggedIn && userId) {
      fetchCartFromDB(userId);
    }
  }, [isLoggedIn, userId, fetchCartFromDB]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setHoveredCategorySlug(null);
      }

      if (userDropdownRef.current && !userDropdownRef.current.contains(e.target)) {
        setShowUserDropdown(false);
      }

      if (mobileMenuOverlayRef.current && e.target === mobileMenuOverlayRef.current) {
        setIsMobileMenuOpen(false);
        setExpandedCategory(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen, showUserDropdown, hoveredCategorySlug]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (showSearchModal) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
  }, [showSearchModal]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const closeNavbar = () => {
    setHoveredCategorySlug(null);
    setIsMobileMenuOpen(false);
    setShowUserDropdown(false);
    setExpandedCategory(null);
  };

  const handleMobileNav = (e, href) => {
    e.preventDefault();
    closeNavbar();
    setTimeout(() => {
      router.push(href);
    }, 100);
  };

  const toggleMobileCategory = async (categorySlug) => {
    if (expandedCategory === categorySlug) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(categorySlug);

      try {
        const res = await fetch(`/api/subcategory?category_slug=${categorySlug}`);
        const data = await res.json();
        setSubcategories(data || []);
      } catch (err) {
        console.error('Failed to load subcategories:', err);
        setSubcategories([]);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchModal(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <header className="kk-header-new">
        {/* ========== ROW 1: LOGO + NAV + ACTIONS (TOP) ========== */}
        <div className="kk-main-row">
          <div className="kk-container-main">
            <Link href="/" className="kk-logo-brand" onClick={closeNavbar}>
              <img src="/main/kalindikart_logo.png" alt="KalindiKart" />
            </Link>

            {/* Desktop Nav */}
            <nav className="kk-nav-desktop">
              <Link href="/" className={isActive('/') ? 'active' : ''}>Home</Link>
              <Link href="/products" className={isActive('/products') ? 'active' : ''}>Products</Link>

              <div
                className="kk-cat-dropdown"
                ref={dropdownRef}
                onMouseEnter={() => setHoveredCategorySlug(categories[0]?.slug || null)}
                onMouseLeave={() => setHoveredCategorySlug(null)}
              >
                <Link href="/category" className={isActive('/category') ? 'active' : ''}>
                  Category <i className="fas fa-chevron-down"></i>
                </Link>

                {hoveredCategorySlug && (
                  <div className="kk-mega-panel">
                    <div className="kk-mega-layout">
                      <div className="kk-cats-col">
                        <h6>All Categories</h6>
                        {categories.map((cat) => {
                          const slug = cat.slug || cat.category_name?.toLowerCase().replace(/\s+/g, '-');
                          return (
                            <Link
                              key={cat.id}
                              href={`/category/${slug}`}
                              className={hoveredCategorySlug === slug ? 'active' : ''}
                              onMouseEnter={() => setHoveredCategorySlug(slug)}
                              onClick={closeNavbar}
                            >
                              {cat.image && (
                                <img
                                  src={
                                    cat.image.startsWith('http') || cat.image.startsWith('/')
                                      ? cat.image
                                      : `/assets/category/${cat.id}/${cat.image.split('/').pop()}`
                                  }
                                  alt={cat.category_name}
                                />
                              )}
                              <span>{cat.category_name}</span>
                            </Link>
                          );
                        })}
                      </div>

                      <div className="kk-subcats-col">
                        {loadingSubcats ? (
                          <p>Loading...</p>
                        ) : subcategories.length > 0 ? (
                          <div className="kk-sub-grid">
                            {subcategories.map((sub) => {
                              const subSlug = sub.slug || sub.sub_category_name?.toLowerCase().replace(/\s+/g, '-');
                              return (
                                <Link
                                  key={sub.id}
                                  href={`/category/${hoveredCategorySlug}/${subSlug}`}
                                  onClick={closeNavbar}
                                >
                                  {sub.image && <Image src={`/assets/subcat/${sub.id}/${sub.image.split('/').pop()}`} alt={sub.sub_category_name} width={60} height={60} />}
                                  <p>{sub.sub_category_name}</p>
                                </Link>
                              );
                            })}
                          </div>
                        ) : (
                          <p>No subcategories</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <Link href="/collections" className={isActive('/collections') ? 'active' : ''}>Collections</Link>
              <Link href="/trending" className={isActive('/trending') ? 'active' : ''}>Trending</Link>
              <Link href="/about" className={isActive('/about') ? 'active' : ''}>About</Link>
            </nav>

            {/* Actions */}
            <div className="kk-actions-bar">


              {/* Search Button - Hidden on mobile, visible on desktop */}
              <button className="kk-btn-action kk-search-desktop" onClick={() => setShowSearchModal(true)} title="Search">
                <i className="fas fa-search"></i>
              </button>

              <Link href="/cart" className="kk-btn-action" title="Cart">
                <i className="fas fa-shopping-cart"></i>
                {cartTotal > 0 && <span>{cartTotal}</span>}
              </Link>

              {isLoggedIn ? (
                <div className="kk-user-wrap" ref={userDropdownRef}>
                  <button
                    className="kk-btn-action"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    title="Account"
                  >
                    <i className="fas fa-user-circle"></i>
                  </button>

                  {showUserDropdown && (
                    <div className="kk-user-dropdown">
                      <div className="kk-user-top">
                        <i className="fas fa-user-circle"></i>
                        <div>
                          <strong>{user?.name || 'User'}</strong>
                          <small>{user?.email || user?.mobile}</small>
                        </div>
                      </div>
                      <Link href="/user/dashboard/my-orders" onClick={() => setShowUserDropdown(false)}>
                        <i className="fas fa-box"></i> My Orders
                      </Link>
                      <Link href="/user/dashboard/profile" onClick={() => setShowUserDropdown(false)}>
                        <i className="fas fa-user-edit"></i> Address
                      </Link>
                      <button onClick={handleLogout}>
                        <i className="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/login" className="kk-btn-action" title="Login">
                  <i className="fas fa-user"></i>
                </Link>
              )}

              {/* Mobile Menu Button - Only visible on mobile */}
              <button className="kk-btn-menu kk-menu-toggle" onClick={() => setIsMobileMenuOpen(true)} title="Menu">
                <i className="fas fa-bars"></i>
              </button>

            </div>
          </div>
        </div>

        {/* ========== MOBILE MENU ========== */}
        {isMobileMenuOpen && (
          <>
            <div className="kk-overlay-mobile" ref={mobileMenuOverlayRef} onClick={() => setIsMobileMenuOpen(false)} />
            <div className="kk-sidebar-mobile" ref={mobileMenuRef}>
              {isLoggedIn && (
                <div className="kk-sidebar-top">
                  <i className="fas fa-user-circle"></i>
                  <div>
                    <strong>{user?.name || 'User'}</strong>
                    <small>{user?.email || user?.mobile}</small>
                  </div>
                </div>
              )}

              <div className="kk-sidebar-nav">

                <Link href="/" className="kk-logo-brand" onClick={closeNavbar}>
                  <img src="/main/kalindikart_logo.png" alt="KalindiKart" />
                </Link>

                <a href="/" onClick={(e) => handleMobileNav(e, '/')}>
                  <i className="fas fa-home"></i> Home
                </a>

                <a href="/products" onClick={(e) => handleMobileNav(e, '/products')}>
                  <i className="fas fa-box"></i> Products
                </a>

                <div className="kk-sidebar-cats">
                  <div className="kk-cats-title">
                    <i className="fas fa-th-large"></i> Categories
                  </div>

                  {categories.map((cat) => {
                    const slug = cat.slug || cat.category_name?.toLowerCase().replace(/\s+/g, '-');
                    const isExpanded = expandedCategory === slug;

                    return (
                      <div key={cat.id}>
                        <button onClick={() => toggleMobileCategory(slug)}>
                          {cat.image && (
                            <img
                              src={
                                cat.image.startsWith('http') || cat.image.startsWith('/')
                                  ? cat.image
                                  : `/assets/category/${cat.id}/${cat.image.split('/').pop()}`
                              }
                              alt={cat.category_name}
                            />
                          )}
                          <span>{cat.category_name}</span>
                          <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                        </button>

                        {isExpanded && subcategories.length > 0 && (
                          <div className="kk-sidebar-subs">
                            {subcategories.map((sub) => {
                              const subSlug = sub.slug || sub.sub_category_name?.toLowerCase().replace(/\s+/g, '-');
                              return (
                                <a
                                  key={sub.id}
                                  href={`/category/${slug}/${subSlug}`}
                                  onClick={(e) => handleMobileNav(e, `/category/${slug}/${subSlug}`)}
                                >
                                  {sub.image && <Image src={`/assets/subcat/${sub.id}/${sub.image.split('/').pop()}`} alt={sub.sub_category_name} width={30} height={30} />}
                                  {sub.sub_category_name}
                                </a>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <a href="/collections" onClick={(e) => handleMobileNav(e, '/collections')}>
                  <i className="fas fa-layer-group"></i> Collections
                </a>

                <a href="/trending" onClick={(e) => handleMobileNav(e, '/trending')}>
                  <i className="fas fa-fire"></i> Trending
                </a>

                <a href="/about" onClick={(e) => handleMobileNav(e, '/about')}>
                  <i className="fas fa-info-circle"></i> About
                </a>

                {isLoggedIn && (
                  <>
                    <hr />
                    <a href="/user/dashboard/my-orders" onClick={(e) => handleMobileNav(e, '/user/dashboard/my-orders')}>
                      <i className="fas fa-box"></i> My Orders
                    </a>
                    <button onClick={handleLogout} style={{ color: '#dc3545' }}>
                      <i className="fas fa-sign-out-alt"></i> Logout
                    </button>
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* ========== SEARCH MODAL ========== */}
        {showSearchModal && (
          <div
            className="kk-search-modal"
            onClick={() => setShowSearchModal(false)}
          >
            <div
              className="kk-search-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="kk-search-modal-header">
                <h3>Search Products</h3>
                <button
                  className="kk-modal-close"
                  onClick={() => setShowSearchModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="kk-search-modal-body">
                <form className="kk-modal-search-form" onSubmit={handleSearch}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search 400,000+ beautiful handpicked products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit">
                    <i className="fas fa-search"></i>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </header>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: rgb(39, 171, 204);
          --primary-soft: rgba(39, 171, 204, 0.08);
          --text-primary: #0f1419;
          --text-secondary: #57606f;
          --border-color: #dfe4ea;
          --bg-light: #f8f9fa;
          --bg-white: #ffffff;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          background: var(--bg-light);
          color: var(--text-primary);
          font-size: 13px;
          overflow-x: hidden;
        }

        .kk-header-new {
          background: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          position: sticky;
          top: 0;
          z-index: 999999;
        }

        .kk-main-row {
          background: white;
          padding: 0.75rem 0;
        }

        .kk-container-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
        }

        .kk-logo-brand {
          flex-shrink: 0;
          text-decoration: none;
        }

        .kk-logo-brand img {
          height: 50px;
          display: block;
        }

        .kk-nav-desktop {
          display: none;
          align-items: center;
          gap: 0.5rem;
          flex: 1;
          justify-content: center;
        }

        @media (min-width: 992px) {
          .kk-nav-desktop {
            display: flex;
          }
        }

        .kk-nav-desktop a,
        .kk-nav-desktop > div > a {
          padding: 0.65rem 1.1rem;
          color: var(--text-primary);
          text-decoration: none;
          font-weight: 500;
          font-size: 15px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          transition: all 0.2s;
        }

        .kk-nav-desktop a:hover,
        .kk-nav-desktop a.active {
          background: var(--primary-soft);
          color: var(--primary);
        }

        .kk-cat-dropdown {
          position: relative;
        }

        .kk-mega-panel {
          position: absolute;
          top: 80%;
          left: 50%;
          transform: translateX(-50%);
          background: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          border-radius: 8px;
          margin-top: 0.5rem;
          width: 750px;
          border-top: 3px solid var(--primary);
          z-index: 9999999999!important;
        }

        .kk-mega-layout {
          display: grid;
          grid-template-columns: 200px 1fr;
          padding: 1rem;
          gap: 1.5rem;
        }

        .kk-cats-col h6 {
          font-weight: 700;
          margin-bottom: 0.75rem;
          font-size: 13px;
        }

        .kk-cats-col a {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 0.75rem;
          color: var(--text-primary);
          text-decoration: none;
          border-radius: 6px;
          font-size: 13px;
          margin-bottom: 0.25rem;
          transition: all 0.2s;
        }

        .kk-cats-col a:hover,
        .kk-cats-col a.active {
          background: var(--primary-soft);
          color: var(--primary);
        }

        .kk-cats-col a img {
          width: 24px;
          height: 24px;
          border-radius: 4px;
        }

        .kk-sub-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.75rem;
        }

        .kk-sub-grid a {
          text-align: center;
          padding: 0.5rem;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.2s;
        }

        .kk-sub-grid a:hover {
          background: var(--bg-light);
        }

        .kk-sub-grid img {
          width: 60px;
          height: 60px;
          border-radius: 6px;
          margin-bottom: 0.4rem;
        }

        .kk-sub-grid p {
          font-size: 12px;
          color: var(--text-primary);
          margin: 0;
        }

/* Default: hide everywhere */
.kk-menu-toggle {
  display: none;
}

/* Mobile only */
@media (max-width: 991px) {
  .kk-menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}



        .kk-actions-bar {
          display: flex;
          align-items: center;
          gap: 0.5rem;  
        }

        /* Search button - hidden on mobile, visible on desktop */
        .kk-search-desktop {
          display: none;
        }

        @media (min-width: 992px) {
          .kk-search-desktop {
            display: flex;
          }
        }

        .kk-btn-action {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-color);
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          font-size: 1.1rem;
          text-decoration: none;
          position: relative;
          transition: all 0.2s;
        }

        .kk-btn-action:hover {
          background: var(--bg-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .kk-btn-action span {
          position: absolute;
          top: -4px;
          right: -4px;
          background: #dc3545;
          color: white;
          font-size: 10px;
          font-weight: 700;
          min-width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kk-user-wrap {
          position: relative;
        }

        .kk-user-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: white;
          box-shadow: 0 8px 20px rgba(0,0,0,0.12);
          border-radius: 8px;
          min-width: 220px;
          overflow: hidden;
          z-index: 1001;
        }

        .kk-user-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, var(--primary), #27bbc9);
          color: white;
        }

        .kk-user-top i {
          font-size: 2rem;
        }

        .kk-user-top strong {
          display: block;
          font-size: 13px;
        }

        .kk-user-top small {
          font-size: 11px;
          opacity: 0.9;
        }

        .kk-user-dropdown a,
        .kk-user-dropdown button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          color: var(--text-primary);
          text-decoration: none;
          background: white;
          border: none;
          width: 100%;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .kk-user-dropdown a:hover,
        .kk-user-dropdown button:hover {
          background: var(--bg-light);
          color: var(--primary);
        }

        .kk-user-dropdown button {
          color: #dc3545;
          border-top: 1px solid var(--border-color);
        }

        .kk-search-modal {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 10000;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 5rem;
          animation: fadeIn 0.2s;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .kk-search-modal-content {
          background: white;
          border-radius: 12px;
          width: 90%;
          max-width: 600px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.2);
          animation: slideDown 0.3s;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .kk-search-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
        }

        .kk-search-modal-header h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }

        .kk-modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-secondary);
          font-size: 1.2rem;
          transition: all 0.2s;
        }

        .kk-modal-close:hover {
          background: var(--bg-light);
          color: var(--text-primary);
        }

        .kk-search-modal-body {
          padding: 1.5rem;
        }

        .kk-modal-search-form {
          display: flex;
          background: var(--bg-light);
          border: 2px solid var(--border-color);
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .kk-modal-search-form:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-soft);
        }

        .kk-modal-search-form input {
          flex: 1;
          border: none;
          padding: 0.9rem 1.2rem;
          font-size: 14px;
          outline: none;
          background: transparent;
        }

        .kk-modal-search-form input::placeholder {
          color: var(--text-secondary);
        }

        .kk-modal-search-form button {
          width: 50px;
          height: 50px;
          background: var(--primary);
          border: none;
          cursor: pointer;
          color: white;
          font-size: 1.1rem;
          transition: all 0.2s;
        }

        .kk-modal-search-form button:hover {
          background: #2d9bb8;
        }

        .kk-btn-menu {
          width: 40px;
          height: 40px;
          border: 1px solid var(--border-color);
          background: white;
          border-radius: 6px;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.1rem;
          color: var(--text-primary);
          flex-shrink: 0;
          transition: all 0.2s;
        }

        .kk-btn-menu:hover {
          background: var(--bg-light);
          border-color: var(--primary);
          color: var(--primary);
        }

        .kk-overlay-mobile {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 9998;
          animation: fadeIn 0.2s;
        }

        .kk-sidebar-mobile {
          position: fixed;
          top: 0;
          left: 0;
          width: 280px;
          height: 100%;
          background: white;
          box-shadow: 4px 0 20px rgba(0,0,0,0.15);
          z-index: 9999;
          overflow-y: auto;
          animation: slideInLeft 0.3s;
        }

        @keyframes slideInLeft {
          from {
            transform: translateX(-100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .kk-sidebar-top {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem 1rem;
          background: linear-gradient(135deg, var(--primary), #27bbc9);
          color: white;
        }

        .kk-sidebar-top i {
          font-size: 2.5rem;
        }

        .kk-sidebar-top strong {
          display: block;
          font-size: 14px;
        }

        .kk-sidebar-top small {
          font-size: 11px;
          opacity: 0.9;
        }

        .kk-sidebar-nav {
          padding: 0.5rem 0;
        }

        .kk-sidebar-nav > a,
        .kk-sidebar-nav > button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.9rem 1rem;
          color: var(--text-primary);
          text-decoration: none;
          background: white;
          border: none;
          width: 100%;
          border-left: 3px solid transparent;
          font-size: 13px;
          transition: all 0.2s;
        }

        .kk-sidebar-nav > a:hover,
        .kk-sidebar-nav > button:hover {
          background: var(--bg-light);
          border-left-color: var(--primary);
        }

        .kk-sidebar-nav i {
          width: 20px;
        }

        .kk-sidebar-cats {
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          margin: 0.5rem 0;
        }

        .kk-cats-title {
          padding: 0.9rem 1rem;
          font-weight: 600;
          background: var(--bg-light);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 13px;
        }

        .kk-sidebar-cats button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          background: white;
          border: none;
          border-bottom: 1px solid var(--bg-light);
          width: 100%;
          cursor: pointer;
          font-size: 13px;
          transition: all 0.2s;
        }

        .kk-sidebar-cats button:hover {
          background: var(--bg-light);
        }

        .kk-sidebar-cats button img {
          width: 28px;
          height: 28px;
          border-radius: 4px;
        }

        .kk-sidebar-cats button span {
          flex: 1;
          text-align: left;
        }

        .kk-sidebar-cats button i {
          font-size: 12px;
          color: var(--text-secondary);
        }

        .kk-sidebar-subs {
          background: #fafafa;
        }

        .kk-sidebar-subs a {
          display: block;
          padding: 0.65rem 1rem 0.65rem 3rem;
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 12px;
          border-left: 3px solid transparent;
          transition: all 0.2s;
        }

        .kk-sidebar-subs a:hover {
          background: white;
          border-left-color: var(--primary);
          color: var(--primary);
        }

        .kk-sidebar-nav hr {
          border: none;
          border-top: 1px solid var(--border-color);
          margin: 0.5rem 0;
        }

        @media (max-width: 576px) {
          body {
            font-size: 12px;
          }

          .kk-logo-brand img {
            height: 50px;
          }

          .kk-btn-menu,
          .kk-btn-action {
            width: 36px;
            height: 36px;
          }

          .kk-sidebar-mobile {
            width: 260px;
          }

          .kk-search-modal {
            padding-top: 3rem;
          }

          .kk-search-modal-content {
            width: 95%;
          }
        }
      `}</style>
    </>
  );
}
