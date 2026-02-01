// src/app/admin/products/add/page.jsx
export default function AddProductPage() {
  return (
    <div className="card shadow-sm mx-auto" style={{ maxWidth: '800px' }}>
      <div className="card-header bg-white py-3">
        <h5 className="mb-0">Add Single Product</h5>
      </div>
      <div className="card-body">
        <form className="row g-3">
          <div className="col-md-12">
            <label className="form-label">Product Title</label>
            <input type="text" className="form-control" placeholder="e.g. Wireless Headphones" />
          </div>
          <div className="col-md-6">
            <label className="form-label">SKU</label>
            <input type="text" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Category</label>
            <select className="form-select">
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Home</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">Price (₹)</label>
            <input type="number" className="form-control" />
          </div>
          <div className="col-md-6">
            <label className="form-label">Stock Status</label>
            <select className="form-select">
              <option>In Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
          <div className="col-12">
            <label className="form-label">Description</label>
            <textarea className="form-control" rows="4"></textarea>
          </div>
          <div className="col-12 text-end mt-4">
            <button type="button" className="btn btn-light me-2">Cancel</button>
            <button type="submit" className="btn btn-primary px-4">Save Product</button>
          </div>
        </form>
      </div>
    </div>
  );
}