'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import { useCartStore } from '../stores/cartStore';
import "./header.css";
import FloatingSocialButtons from './FloatingSocialButtons';

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


  const [adminToken, setAdminToken] = useState(null);

  useEffect(() => {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1];

    setAdminToken(token);
  }, []);

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

  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 1) {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        // data should be your array: [{"id":2, ...}, {"id":1, ...}]
        setSearchResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
        setSearchResults([]);
      }
    } else {
      setSearchResults([]);
    }
  };

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

  // Live Search Effect (Debounced)
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
          const data = await res.json();
          setSearchResults(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Search API Error:", err);
        }
      } else {
        setSearchResults([]);
      }
    }, 300); // Wait 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Final Submit Handler
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      setShowSearchModal(false);
      setSearchResults([]); // Clear dropdown
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

              {adminToken ?
                <>
                  <Link href="/admin" className="kk-btn-action" title="Login">
                    <i className="fas fa-user"></i>
                  </Link>
                </>
                : (
                  isLoggedIn ? (
                    <button
                      className="kk-btn-action"
                      onClick={() => setIsMobileMenuOpen(true)}
                    >
                      <i className="fas fa-bars"></i>
                    </button>
                  ) : (
                    <>
                      <Link href="/login" className="kk-btn-action" title="Login">
                        <i className="fas fa-user"></i>
                      </Link>
                    </>
                  )
                )}

            </div>
          </div >
        </div >

        {/* Mobile Sidebar */}
        {
          isMobileMenuOpen && (
            <>
              <div className="kk-overlay-mobile" onClick={() => setIsMobileMenuOpen(false)} />
              <div className="kk-sidebar-mobile" ref={mobileMenuRef}>
                <div className="kk-sidebar-top">
                  <Link href="/" onClick={closeNavbar}>
                    <img src="/main/kalindikart_logo.png" style={{ width: "100px" }} alt="KalindiKart" className="kk-mobile-logo" />
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

                  {isLoggedIn && (
                    <Link href="/user/my-orders" onClick={closeNavbar}>
                      <i className={isLoggedIn ? "fas fa-archive" : "fas fa-home"}></i>
                      Orders
                    </Link>
                  )}


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
                              {cat.image && (
                                <img
                                  src={cat.image.startsWith('http') || cat.image.startsWith('/')
                                    ? cat.image
                                    : `/assets/category/${cat.id}/${cat.image.split('/').pop()}`}
                                  alt={cat.category_name}
                                />
                              )}
                              <span>{cat.category_name}</span>
                              <i className={`fas fa-plus ${isExpanded ? 'rotate-45' : ''}`} />
                            </button>
                            {isExpanded && (
                              <div className="kk-sidebar-subs">
                                {subcategories.filter(s => s.category_id === cat.id).map(sub => (
                                  <Link key={sub.id} href={`/category/${slug}/${sub.slug}`} onClick={closeNavbar}>
                                    {sub.image && (
                                      <Image
                                        src={`/assets/subcat/${sub.id}/${sub.image.split('/').pop()}`}
                                        alt={sub.sub_category_name}
                                        width={40}
                                        height={40}
                                      />
                                    )}
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
          )
        }

        {
          showSearchModal && (
            <div
              className="kk-search-modal position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center px-3"
              style={{ zIndex: 2000, backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', paddingTop: '10vh' }}
              onClick={() => setShowSearchModal(false)}
            >
              <div
                className="kk-search-modal-content bg-white rounded-4 shadow-lg w-100 p-3 p-md-4"
                style={{ maxWidth: '600px', height: 'fit-content', animation: 'slideDown 0.3s ease' }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0" style={{ color: '#00739D' }}>Search Products</h5>
                  <button className="btn-close shadow-none" onClick={() => setShowSearchModal(false)}></button>
                </div>

                {/* Search Form Wrapper */}
                <div className="position-relative">
                  <form onSubmit={handleSearch}>
                    <div className="input-group input-group-lg border rounded-3 overflow-hidden" style={{ borderColor: '#01A9E6' }}>
                      <input
                        ref={searchInputRef}
                        type="text"
                        className="form-control border-0 shadow-none px-3"
                        placeholder="Start typing..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        style={{ fontSize: '14px' }}
                      />
                      <button className="btn text-white px-4" type="submit" style={{ backgroundColor: '#01A9E6' }}>
                        <i className="fas fa-search"></i>
                      </button>
                    </div>
                  </form>

                  {/* --- DROPDOWN RESULTS --- */}
                  {searchResults.length > 0 && (
                    <div
                      className="list-group position-absolute w-100 shadow-lg mt-2 rounded-3 border-0"
                      style={{
                        zIndex: 3000,
                        maxHeight: '350px',
                        overflowY: 'auto',
                        top: '100%',
                        backgroundColor: '#fff'
                      }}
                    >
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="list-group-item list-group-item-action d-flex align-items-center p-3 border-0 border-bottom"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                            // Build the dynamic URL: /products/category-slug/product-slug
                            const categoryPath = item.category_slug ? item.category_slug.toLowerCase().replace(/\s+/g, '-') : 'all';
                            const productPath = item.slug;

                            router.push(`/products/${categoryPath}/${productPath}`);

                            // UI Cleanup
                            setShowSearchModal(false);
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
                        >
                          <img
                            src={`/assets/products/${item.id}/${item.images?.[0]}`}
                            alt=""
                            className="rounded border me-3"
                            style={{ width: '45px', height: '45px', objectFit: 'cover' }}
                            onError={(e) => e.target.src = '/placeholder.png'}
                          />
                          <div className="flex-grow-1 text-start">
                            <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '200px', fontSize: '0.9rem' }}>
                              {item.title}
                            </div>
                            <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>{item.category_name}</small>
                          </div>
                          <div className="text-end ps-2">
                            <span className="fw-bold" style={{ color: '#00739D' }}>₹{item.price}</span>
                          </div>
                        </div>
                      ))}

                      {/* View All Option */}
                      <button
                        className="list-group-item list-group-item-action text-center py-2 bg-light small fw-bold"
                        onClick={handleSearch}
                        style={{ color: '#01A9E6' }}
                      >
                        View All Results for "{searchQuery}"
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        }

      </header >

      {/* Bootstrap Offcanvas (kept for secondary actions) */}
      < div className="offcanvas offcanvas-end user-offcanvas" tabIndex={- 1
      } id="userOffcanvas" style={{ zIndex: 1050 }}>
        <div className="offcanvas-header">
          <h5 id="userOffcanvasLabel">My Account</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body d-flex flex-column gap-3">
          <Link href="/user/dashboard/profile" className="offcanvas-link" onClick={closeOffcanvas}>👤 Profile</Link>
          <Link href="/user/dashboard/my-orders" className="offcanvas-link" onClick={closeOffcanvas}>🛍 Orders</Link>
          <Link href="/cart" className="offcanvas-link" onClick={closeOffcanvas}>🛒 My Cart</Link>
        </div>
      </div >

      <FloatingSocialButtons />

    </>
  );
}