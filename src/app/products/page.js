'use client';

import React, { useState, useEffect, Suspense } from 'react';
import ProductCard from '../../components/ProductCard';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

function ProductsContent() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('default');

  // Search state synced with URL
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [showFilters, setShowFilters] = useState(false);

  // 1. Sync state if URL changes (back/forward buttons)
  useEffect(() => {
    const query = searchParams.get('search');
    setSearchQuery(query || '');
  }, [searchParams]);

  // 2. Fetch Products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        
        const normalized = data.map((item) => ({
          ...item,
          category_slug: item.category_slug?.toLowerCase().replace(/\s+/g, '-') || '',
        }));

        setProducts(normalized);
        setFilteredProducts(normalized);

        const uniqueCats = [...new Set(normalized.map((p) => p.category_name).filter(Boolean))];
        setCategories(uniqueCats);

        const prices = normalized.map((p) => parseFloat(p.price) || 0);
        const max = Math.max(...prices, 1000);
        setMaxPrice(max);
        setPriceRange([0, max]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 3. Apply all filters locally
  useEffect(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category_name));
    }

    result = result.filter(
      (p) => parseFloat(p.price) >= priceRange[0] && parseFloat(p.price) <= priceRange[1]
    );

    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name-az') result.sort((a, b) => a.title.localeCompare(b.title));
    else if (sortBy === 'name-za') result.sort((a, b) => b.title.localeCompare(a.title));
    else if (sortBy === 'discount') result.sort((a, b) => (b.discount || 0) - (a.discount || 0));

    setFilteredProducts(result);
  }, [products, selectedCategories, priceRange, sortBy, searchQuery]);

  // Handlers
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    const params = new URLSearchParams(searchParams);
    if (value) params.set('search', value);
    else params.delete('search');
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSortBy('default');
    setSearchQuery('');
    router.replace(pathname, { scroll: false });
  };

  if (loading) return <div className="loading-state"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="products-page bg-light min-vh-100">
      <div className="container py-4 px-3">
        <div className="row g-4">
          
          {/* Header */}
          <div className="col-12 text-center py-md-5 py-3  mb-2 hero-banner">
            <h1 className="fw-bold mb-2">All Products</h1>
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb justify-content-center mb-0">
                <li className="breadcrumb-item"><a href="/">Home</a></li>
                <li className="breadcrumb-item active">Latest Products</li>
              </ol>
            </nav>
          </div>

          {/* Sidebar */}
          <div className="col-lg-3">
            {/* Mobile Button */}
            <button className="btn mobile-filter-btn d-lg-none w-100 mb-3" onClick={() => setShowFilters(!showFilters)}>
              <i className={`bi bi-${showFilters ? 'x-lg' : 'funnel-fill'} me-2`}></i>
              {showFilters ? 'Hide' : 'Show'} Filters
              {(selectedCategories.length > 0 || searchQuery) && (
                <span className="badge-count">{selectedCategories.length + (searchQuery ? 1 : 0)}</span>
              )}
            </button>

            {/* Sidebar Card */}
            <div className={`card filter-card shadow-sm ${showFilters ? 'mobile-show' : 'd-none d-lg-block'}`}>
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                  <h6 className="mb-0 fw-bold"><i className="bi bi-sliders me-2"></i>Filters</h6>
                  <button className="btn btn-sm text-primary p-0" onClick={clearFilters}>Clear All</button>
                </div>

                {/* Search Box */}
                <div className="filter-group mb-4">
                  <label className="small fw-bold mb-2">Search</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                    <input type="text" className="form-control border-start-0" placeholder="Search..." 
                      value={searchQuery} onChange={(e) => handleSearchChange(e.target.value)} />
                  </div>
                </div>

                {/* Category List */}
                <div className="filter-group mb-4">
                  <label className="small fw-bold mb-2">Categories</label>
                  <div className="category-scroll">
                    {categories.map((cat) => (
                      <div key={cat} className="form-check mb-1">
                        <input className="form-check-input" type="checkbox" id={cat}
                          checked={selectedCategories.includes(cat)} onChange={() => toggleCategory(cat)} />
                        <label className="form-check-label small w-100 d-flex justify-content-between" htmlFor={cat}>
                          {cat} <span className="text-muted">({products.filter(p => p.category_name === cat).length})</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Slider */}
                <div className="filter-group mb-4">
                  <label className="small fw-bold mb-2">Price Range</label>
                  <div className="price-display mb-2">₹{priceRange[0]} - ₹{priceRange[1]}</div>
                  <input type="range" className="form-range" min="0" max={maxPrice} value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} />
                </div>

                {/* Sort dropdown */}
                <div className="filter-group">
                  <label className="small fw-bold mb-2">Sort By</label>
                  <select className="form-select form-select-sm" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                    <option value="default">Newest First</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="name-az">A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="col-lg-9">
            {filteredProducts.length > 0 ? (
              <div className="row g-3 g-md-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="empty-state text-center py-5 card shadow-sm">
                <i className="bi bi-search display-1 text-muted"></i>
                <h4 className="mt-3">No matching products</h4>
                <button className="btn btn-outline-primary mt-2" onClick={clearFilters}>Reset Filters</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for Mobile Sidebar */}
      {showFilters && <div className="sidebar-overlay d-lg-none" onClick={() => setShowFilters(false)} />}

      <style jsx>{`
        /* Root brand colors mapped from your setup */
        .products-page {
          --primary: #01A9E6;
          --dark: #00739D;
          --bg-soft: #f0f8ff;
        }

        .hero-banner {
          background: linear-gradient(rgba(255,255,255,0.4), rgba(255,255,255,0.4)), url("/assets/parallex_bg.png");
          background-size: cover;
          border-radius: 12px;
          color: #333;
        }

        .mobile-filter-btn {
          background-color: var(--primary);
          color: white;
          border: none;
          padding: 10px;
          border-radius: 8px;
          position: relative;
        }

        .badge-count {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ff4d4d;
          color: white;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: 50px;
        }

        .category-scroll {
          max-height: 200px;
          overflow-y: auto;
          padding-right: 5px;
        }

        .category-scroll::-webkit-scrollbar { width: 4px; }
        .category-scroll::-webkit-scrollbar-thumb { background: #ddd; border-radius: 10px; }

        .price-display {
          background: var(--bg-soft);
          color: var(--dark);
          font-weight: bold;
          text-align: center;
          padding: 5px;
          border-radius: 5px;
          font-size: 0.85rem;
        }

        .form-range::-webkit-slider-thumb { background: var(--primary); }
        .form-check-input:checked { background-color: var(--primary); border-color: var(--dark); }

        @media (min-width: 992px) {
          .filter-card {
            position: sticky;
            top: 20px;
            z-index: 100;
          }
        }

        @media (max-width: 991px) {
          .filter-card.mobile-show {
            position: fixed;
            top: 0;
            left: 0;
            width: 85%;
            height: 100vh;
            z-index: 2000;
            border-radius: 0;
            display: block !important;
            animation: slideIn 0.3s ease-out;
          }
          .sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(2px);
            z-index: 1999;
          }
        }

        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        .loading-state {
          height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

// Wrapper for Suspense (Required for useSearchParams in Next.js App Router)
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="text-center py-5">Loading Products...</div>}>
      <ProductsContent />
    </Suspense>
  );
}