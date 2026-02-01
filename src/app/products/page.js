// ============================================
// FILE: app/products/page.jsx
// ============================================
'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '../../components/ProductCard';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch products');
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Invalid API response');

        const normalizedProducts = data.map((item) => ({
          ...item,
          category_slug: item.category_slug
            ? item.category_slug.toLowerCase().replace(/\s+/g, '-')
            : '',
        }));

        setProducts(normalizedProducts);
        setFilteredProducts(normalizedProducts);

        const uniqueCategories = [
          ...new Set(normalizedProducts.map((p) => p.category_name).filter(Boolean)),
        ];
        setCategories(uniqueCategories);

        const prices = normalizedProducts.map((p) => parseFloat(p.price) || 0);
        const max = Math.max(...prices, 1000);
        setMaxPrice(max);
        setPriceRange([0, max]);
      } catch (err) {
        console.error(err);
        setError(err.message || 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category_name));
    }

    result = result.filter(
      (p) =>
        parseFloat(p.price) >= priceRange[0] &&
        parseFloat(p.price) <= priceRange[1]
    );

    if (searchQuery.trim()) {
      result = result.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (sortBy === 'price-low') {
      result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    } else if (sortBy === 'name-az') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'name-za') {
      result.sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortBy === 'discount') {
      result.sort((a, b) => parseFloat(b.discount || 0) - parseFloat(a.discount || 0));
    }

    setFilteredProducts(result);
  }, [products, selectedCategories, priceRange, sortBy, searchQuery]);

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPrice]);
    setSortBy('default');
    setSearchQuery('');
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 text-muted small">Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5 text-center">
        <i className="bi bi-exclamation-circle display-1 text-danger mb-3"></i>
        <h4 className="text-danger">Error: {error}</h4>
        <button className="btn btn-primary mt-3" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 pb-5">
      <div className="container py-4">
        <div className="row g-4">
          {/* ========== LEFT SIDEBAR - FILTERS ========== */}
          <div className="col-lg-3">
            {/* Mobile Filter Toggle */}
            <button
              className="btn btn-primary w-100 d-lg-none mb-3 position-relative"
              onClick={() => setShowFilters(!showFilters)}
            >
              <i className={`bi bi-${showFilters ? 'x' : 'funnel'} me-2`}></i>
              {showFilters ? 'Hide' : 'Show'} Filters
              {(selectedCategories.length > 0 || searchQuery) && (
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {selectedCategories.length + (searchQuery ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Filter Sidebar */}
            <div
              className={`card shadow-sm sticky-top ${showFilters ? 'd-block' : 'd-none d-lg-block'}`}
              style={{ top: '90px', maxHeight: 'calc(100vh - 110px)', overflowY: 'auto' }}
            >
              <div className="card-body p-3">
                {/* Filter Header */}
                <div className="d-flex justify-content-between align-items-center pb-3 mb-3 border-bottom">
                  <h6 className="mb-0 fw-bold">
                    <i className="bi bi-sliders me-2"></i>Filters
                  </h6>
                  {(selectedCategories.length > 0 || priceRange[0] !== 0 || priceRange[1] !== maxPrice || searchQuery || sortBy !== 'default') && (
                    <button className="btn btn-sm btn-outline-primary" onClick={clearFilters}>
                      <i className="bi bi-arrow-clockwise me-1"></i>Clear
                    </button>
                  )}
                </div>

                {/* Search Filter */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small mb-2">
                    <i className="bi bi-search me-2"></i>Search
                  </label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button
                        className="btn btn-sm position-absolute top-50 end-0 translate-middle-y border-0"
                        onClick={() => setSearchQuery('')}
                      >
                        <i className="bi bi-x text-muted"></i>
                      </button>
                    )}
                  </div>
                </div>

                {/* Category Filter */}
                {categories.length > 0 && (
                  <div className="mb-4">
                    <label className="form-label fw-semibold small mb-2 d-flex justify-content-between align-items-center">
                      <span><i className="bi bi-tags me-2"></i>Categories</span>
                      {selectedCategories.length > 0 && (
                        <span className="badge bg-primary">{selectedCategories.length}</span>
                      )}
                    </label>
                    <div style={{ maxHeight: '180px', overflowY: 'auto' }}>
                      {categories.map((cat) => (
                        <div key={cat} className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`cat-${cat}`}
                            checked={selectedCategories.includes(cat)}
                            onChange={() => toggleCategory(cat)}
                          />
                          <label className="form-check-label small d-flex justify-content-between w-100" htmlFor={`cat-${cat}`}>
                            <span>{cat}</span>
                            <span className="text-muted">
                              ({products.filter((p) => p.category_name === cat).length})
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Price Range Filter */}
                <div className="mb-4">
                  <label className="form-label fw-semibold small mb-2">
                    <i className="bi bi-currency-rupee me-2"></i>Price Range
                  </label>
                  <div className="alert alert-info py-2 text-center small fw-bold">
                    ₹{priceRange[0].toLocaleString('en-IN')} - ₹{priceRange[1].toLocaleString('en-IN')}
                  </div>
                  <input
                    type="range"
                    className="form-range mb-3"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  />
                  <div className="row g-2">
                    <div className="col">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        placeholder="Min"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                      />
                    </div>
                    <div className="col-auto d-flex align-items-center">
                      <span className="text-muted small">to</span>
                    </div>
                    <div className="col">
                      <input
                        type="number"
                        className="form-control form-control-sm text-center"
                        placeholder="Max"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || maxPrice])}
                      />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-3">
                  <label className="form-label fw-semibold small mb-2">
                    <i className="bi bi-sort-down me-2"></i>Sort By
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="default">Default</option>
                    <option value="price-low">Price: Low → High</option>
                    <option value="price-high">Price: High → Low</option>
                    <option value="name-az">Name: A-Z</option>
                    <option value="name-za">Name: Z-A</option>
                    <option value="discount">Highest Discount</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ========== RIGHT SIDE - PRODUCTS ========== */}
          <div className="col-lg-9">
            {/* Results Header */}
                       {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="row g-3 g-md-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="card shadow-sm text-center py-5">
                <div className="card-body">
                  <i className="bi bi-bag-x display-1 text-muted mb-4"></i>
                  <h4 className="fw-bold mb-3">No Products Found</h4>
                  <p className="text-muted mb-4">
                    We couldn't find any products matching your filters.<br />
                    Try adjusting your search criteria.
                  </p>
                  <button className="btn btn-primary" onClick={clearFilters}>
                    <i className="bi bi-arrow-clockwise me-2"></i>Clear All Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Overlay */}
      {showFilters && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-lg-none"
          style={{ zIndex: 1040 }}
          onClick={() => setShowFilters(false)}
        />
      )}

      <style jsx>{`
        /* Mobile Filter Sidebar */
        @media (max-width: 991px) {
          .sticky-top.d-block {
            position: fixed !important;
            top: 0 !important;
            left: 0;
            width: 85%;
            max-width: 360px;
            height: 100vh;
            z-index: 1050;
            border-radius: 0 1rem 1rem 0 !important;
            animation: slideIn 0.3s ease;
            max-height: 100vh !important;
          }

          @keyframes slideIn {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }
        }

        /* Custom Scrollbar */
        .sticky-top::-webkit-scrollbar {
          width: 6px;
        }

        .sticky-top::-webkit-scrollbar-thumb {
          background: #dee2e6;
          border-radius: 10px;
        }

        .sticky-top::-webkit-scrollbar-track {
          background: #f8f9fa;
        }

        /* Form Range Custom Color */
        .form-range::-webkit-slider-thumb {
          background-color: #D4AF37;
        }

        .form-range::-moz-range-thumb {
          background-color: #D4AF37;
        }

        /* Form Check Custom Color */
        .form-check-input:checked {
          background-color: #D4AF37;
          border-color: #D4AF37;
        }

        /* Smooth Transitions */
        .btn,
        .form-control,
        .form-select,
        .form-check-input {
          transition: all 0.3s ease;
        }
      `}</style>
    </div>
  );
}
