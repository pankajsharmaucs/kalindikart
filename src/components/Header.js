'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../stores/cartStore';
import "./header.css";

/**
 * Utility to close Bootstrap offcanvas if used alongside Next.js
 */
const closeOffcanvas = () => {
  if (typeof window !== 'undefined' && window.bootstrap) {
    const el = document.getElementById("userOffcanvas");
    if (!el) return;
    const instance = window.bootstrap.Offcanvas.getInstance(el);
    instance?.hide();
  }
};

export default function Header() {
  const { user, isLoggedIn, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // --- State ---
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [hoveredCategorySlug, setHoveredCategorySlug] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSubcats, setLoadingSubcats] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isCatsOpen, setIsCatsOpen] = useState(false);

  // --- Store ---
  const cartCount = useCartStore((state) => state.cartCount);
  const fetchCartFromDB = useCartStore((state) => state.fetchCartFromDB);
  const userId = useCartStore((state) => state.userId);

  // --- Refs ---
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // --- Helpers ---
  const isActive = (href) => (href === '/' ? pathname === '/' : pathname.startsWith(href));

  const closeNavbar = useCallback(() => {
    setHoveredCategorySlug(null);
    setIsMobileMenuOpen(false);
    setExpandedCategory(null);
  }, []);

  const handleLogout = async () => {
    closeNavbar();
    await logout();
    router.push('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchModal(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleMobileNav = (e, href) => {
    e.preventDefault();
    closeNavbar();
    router.push(href);
  };

  // --- Fetching ---
  useEffect(() => {
    async function initCategories() {
      try {
        const res = await fetch('/api/category');
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    initCategories();
  }, []);

  useEffect(() => {
    if (!hoveredCategorySlug) {
      setSubcategories([]);
      return;
    }
    const fetchSubs = async () => {
      setLoadingSubcats(true);
      try {
        const res = await fetch(`/api/subcategory?category_slug=${hoveredCategorySlug}`);
        const data = await res.json();
        setSubcategories(data || []);
      } catch (err) {
        console.error('Failed to load subcategories:', err);
      } finally {
        setLoadingSubcats(false);
      }
    };
    fetchSubs();
  }, [hoveredCategorySlug]);

  useEffect(() => {
    if (isLoggedIn && userId) fetchCartFromDB(userId);
  }, [isLoggedIn, userId, fetchCartFromDB]);

  // --- Event Listeners ---
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setHoveredCategorySlug(null);
      }
    };
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
      if (e.key === 'Escape') setShowSearchModal(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock scroll when menu or search is open
  useEffect(() => {
    document.body.style.overflow = (isMobileMenuOpen || showSearchModal) ? 'hidden' : '';
    if (showSearchModal) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [isMobileMenuOpen, showSearchModal]);

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
        setSubcategories([]);
      }
    }
  };

  return (
    <>
      <header className="kk-header-new">
        <div className="kk-main-row">
          <div className="kk-container-main">
            {/* Logo */}
            <Link href="/" className="kk-logo-brand" onClick={closeNavbar}>
              <img src="/main/kalindikart_logo.png" alt="KalindiKart" />
            </Link>

            {/* Desktop Navigation */}
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
                                  src={cat.image.startsWith('http') || cat.image.startsWith('/') 
                                    ? cat.image 
                                    : `/assets/category/${cat.id}/${cat.image.split('/').pop()}`}
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
                          <div className="kk-loader">Loading...</div>
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
                                  {sub.image && (
                                    <Image 
                                      src={`/assets/subcat/${sub.id}/${sub.image.split('/').pop()}`} 
                                      alt={sub.sub_category_name} 
                                      width={60} 
                                      height={60} 
                                    />
                                  )}
                                  <p>{sub.sub_category_name}</p>
                                </Link>
                              );
                            })}
                          </div>
                        ) : <p>No subcategories found.</p>}
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
              <button className="kk-btn-action kk-search-desktop" onClick={() => setShowSearchModal(true)} title="Search">
                <i className="fas fa-search"></i>
              </button>

              <Link href="/cart" className="kk-btn-action" title="Cart">
                <i className="fas fa-shopping-cart"></i>
                {cartCount > 0 && <span className="kk-cart-badge">{cartCount}</span>}
              </Link>

              {isLoggedIn ? (
                <button className="kk-btn-action" onClick={() => setIsMobileMenuOpen(true)}>
                  <i className="fas fa-bars"></i>
                </button>
              ) : (
                <>
                  <Link href="/login" className="kk-btn-action" title="Login">
                    <i className="fas fa-user"></i>
                  </Link>
                  <button className="kk-btn-menu" onClick={() => setIsMobileMenuOpen(true)}>
                    <i className="fas fa-bars"></i>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {isMobileMenuOpen && (
          <>
            <div className="kk-overlay-mobile" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="kk-sidebar-mobile" ref={mobileMenuRef}>
              <div className="kk-sidebar-top">
                <Link href="/" onClick={closeNavbar}>
                  <img src="/main/kalindikart_logo.png" style={{width:"100px"}} alt="KalindiKart" className="kk-mobile-logo" />
                </Link>
                <button className="kk-close-sidebar" onClick={() => setIsMobileMenuOpen(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="kk-sidebar-nav">
                <Link href={isLoggedIn ? "/user/dashboard" : "/"} onClick={closeNavbar}>
                  <i className={isLoggedIn ? "fas fa-tachometer-alt" : "fas fa-home"}></i> 
                  {isLoggedIn ? " Dashboard" : " Home"}
                </Link>

                <Link href="/products" onClick={closeNavbar}>
                  <i className="fas fa-box"></i> Products
                </Link>

                <div className="kk-sidebar-cats">
                  <button className="kk-cats-title" onClick={() => setIsCatsOpen(!isCatsOpen)}>
                    <span><i className="fas fa-layer-group"></i> Categories</span>
                    <i className={`fas fa-chevron-${isCatsOpen ? "up" : "down"}`} />
                  </button>

                  <div className="kk-cats-body" style={{ maxHeight: isCatsOpen ? "1000px" : "0", overflow: 'hidden', transition: 'max-height 0.3s' }}>
                    {categories.map((cat) => {
                      const slug = cat.slug || cat.category_name?.toLowerCase().replace(/\s+/g, "-");
                      const isExpanded = expandedCategory === slug;
                      return (
                        <div key={cat.id} className="kk-cat-item">
                          <button className="kk-cat-btn" onClick={() => toggleMobileCategory(slug)}>
                            <span>{cat.category_name}</span>
                            <i className={`fas fa-plus ${isExpanded ? 'rotate-45' : ''}`} />
                          </button>
                          {isExpanded && (
                            <div className="kk-sidebar-subs">
                              {subcategories.filter(s => s.category_id === cat.id).map(sub => (
                                <Link key={sub.id} href={`/category/${slug}/${sub.slug}`} onClick={closeNavbar}>
                                  {sub.sub_category_name}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Link href="/collections" onClick={closeNavbar}><i className="fas fa-th-large"></i> Collections</Link>
                <Link href="/about" onClick={closeNavbar}><i className="fas fa-info-circle"></i> About</Link>

                {isLoggedIn ? (
                  <button onClick={handleLogout} className="kk-logout-btn">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                ) : (
                  <Link href="/login" onClick={closeNavbar}><i className="fas fa-sign-in-alt"></i> Login</Link>
                )}
              </div>
            </div>
          </>
        )}

        {/* Search Modal */}
        {showSearchModal && (
          <div className="kk-search-modal" onClick={() => setShowSearchModal(false)}>
            <div className="kk-search-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="kk-search-modal-header">
                <h3>Search Products</h3>
                <button onClick={() => setShowSearchModal(false)}><i className="fas fa-times"></i></button>
              </div>
              <form className="kk-modal-search-form" onSubmit={handleSearch}>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="What are you looking for?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit"><i className="fas fa-search"></i></button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Bootstrap Offcanvas (kept for secondary actions) */}
      <div className="offcanvas offcanvas-end user-offcanvas" tabIndex={-1} id="userOffcanvas" style={{ zIndex: 1050 }}>
        <div className="offcanvas-header">
          <h5 id="userOffcanvasLabel">My Account</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body d-flex flex-column gap-3">
          <Link href="/user/dashboard/profile" className="offcanvas-link" onClick={closeOffcanvas}>👤 Profile</Link>
          <Link href="/user/dashboard/my-orders" className="offcanvas-link" onClick={closeOffcanvas}>🛍 Orders</Link>
          <Link href="/cart" className="offcanvas-link" onClick={closeOffcanvas}>🛒 My Cart</Link>
        </div>
      </div>
    </>
  );
}