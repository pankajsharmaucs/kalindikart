// src/app/admin/products/page.jsx
'use client'
import { useEffect, useState } from 'react'

export default function AdminProductsPage() {
  const [products, setProducts] = useState([])
  const [pagination, setPagination] = useState({ pages: 1, currentPage: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Fetch products based on current page and search string
  const fetchProducts = async (pageNumber = 1) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products?page=${pageNumber}&limit=10&search=${search}`)
      const data = await res.json()
      setProducts(data.products || [])
      setPagination(data.pagination || { pages: 1, currentPage: 1 })
      setPage(pageNumber)
    } catch (err) {
      console.error("Fetch Error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts(1)
  }, [])

  // Handle Bulk Upload via AJAX
  const handleBulkUpload = async (e) => {
    e.preventDefault()
    setUploading(true)
    const formData = new FormData(e.target)

    try {
      const res = await fetch('/api/products/bulk', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        alert("Bulk upload successful!")
        e.target.reset() // Clear file inputs
        fetchProducts(1) // Refresh table
      } else {
        alert("Upload failed. Please check the files.")
      }
    } catch (err) {
      console.error("Upload Error:", err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Products Management</h2>
        <a href="/admin/products/add" className="btn btn-primary shadow-sm px-4">+ New Product</a>
      </div>

      {/* Bulk Upload Section */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-header bg-white py-3">
          <h6 className="mb-0 fw-bold text-secondary">Bulk Import Products</h6>
        </div>
        <div className="card-body">
          <form onSubmit={handleBulkUpload} className="row g-3">
            <div className="col-md-4">
              <label className="form-label small fw-medium">Excel Data (.xlsx)</label>
              <input type="file" name="file" className="form-control" accept=".xlsx" required />
            </div>
            <div className="col-md-4">
              <label className="form-label small fw-medium">Images (.zip)</label>
              <input type="file" name="images" className="form-control" accept=".zip" required />
            </div>
            <div className="col-md-4 d-flex align-items-end">
              <button 
                type="submit" 
                className="btn btn-dark w-100 shadow-sm" 
                disabled={uploading}
              >
                {uploading ? (
                  <><span className="spinner-border spinner-border-sm me-2"></span> Uploading...</>
                ) : 'Upload Bulk Data'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Product List Card */}
      <div className="card shadow-sm border-0">
        <div className="card-body p-0">
          {/* Filter Bar */}
          <div className="p-3 border-bottom bg-light bg-opacity-50">
            <div className="row g-2">
              <div className="col-md-4">
                <div className="input-group input-group-sm">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search Title, SKU or ID..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <button className="btn btn-primary" onClick={() => fetchProducts(1)}>Search</button>
                </div>
              </div>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                  </td></tr>
                ) : products.length === 0 ? (
                  <tr><td colSpan="7" className="text-center py-5 text-muted">No products found.</td></tr>
                ) : products.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-4 text-muted small">#{p.id}</td>
                    <td>
                      <div className="fw-bold">{p.title}</div>
                      <small className="text-muted" style={{fontSize: '0.75rem'}}>{p.slug}</small>
                    </td>
                    <td><span className="badge bg-light text-dark border font-monospace">{p.sku || 'N/A'}</span></td>
                    <td>{p.category_name}</td>
                    <td className="fw-semibold">₹{p.price}</td>
                    <td>
                      <span className={`badge rounded-pill ${p.status === 'active' ? 'bg-success-subtle text-success' : 'bg-warning-subtle text-warning'}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-end pe-4">
                      <button className="btn btn-sm btn-outline-secondary">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Improved Pagination Footer */}
        <div className="card-footer bg-white d-flex justify-content-between align-items-center py-3">
          <span className="text-muted small">
            Showing Page <strong>{pagination.currentPage}</strong> of {pagination.pages}
          </span>
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => fetchProducts(page - 1)}>Previous</button>
              </li>
              
              {/* Dynamic Page Numbers */}
              {[...Array(pagination.pages)].map((_, i) => (
                <li key={i+1} className={`page-item ${page === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => fetchProducts(i + 1)}>{i + 1}</button>
                </li>
              ))}

              <li className={`page-item ${page === pagination.pages ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => fetchProducts(page + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}