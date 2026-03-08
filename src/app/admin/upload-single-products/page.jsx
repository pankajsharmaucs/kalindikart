'use client';

import { useState } from 'react';
import swal from 'sweetalert';

export default function UploadSingleProduct() {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [tax, setTax] = useState('');
  const [shippingCost, setShippingCost] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => setImages([...e.target.files]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !slug || !categoryId || !price || images.length === 0) {
      swal('Error', 'Please fill all required fields and select images', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('slug', slug);
    formData.append('category_id', categoryId);
    formData.append('sub_cat_id', subCategoryId || '');
    formData.append('price', price);
    formData.append('discount', discount || 0);
    formData.append('tax', tax || 0);
    formData.append('shipping_cost', shippingCost || 0);
    formData.append('quantity', quantity || 0);
    formData.append('description', description);
    images.forEach((img) => formData.append('images', img));

    try {
      setLoading(true);
      const res = await fetch('/api/products', { // new API route
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      swal('Success', data.message || 'Product added successfully', 'success');

      // Reset form
      setTitle('');
      setSlug('');
      setCategoryId('');
      setSubCategoryId('');
      setPrice('');
      setDiscount('');
      setTax('');
      setShippingCost('');
      setQuantity('');
      setDescription('');
      setImages([]);
      e.target.reset();
    } catch (err) {
      console.error(err);
      swal('Error', err.message || 'Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 col-md-8 col-12">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="fw-bold text-center mb-4">Add Single Product</h2>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Title*</label>
                  <input type="text" className="form-control" value={title} onChange={e => setTitle(e.target.value)} required />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Slug*</label>
                  <input type="text" className="form-control" value={slug} onChange={e => setSlug(e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Category ID*</label>
                  <input type="number" className="form-control" value={categoryId} onChange={e => setCategoryId(e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Sub Category ID</label>
                  <input type="number" className="form-control" value={subCategoryId} onChange={e => setSubCategoryId(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Price*</label>
                  <input type="number" className="form-control" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Discount</label>
                  <input type="number" className="form-control" value={discount} onChange={e => setDiscount(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tax</label>
                  <input type="number" className="form-control" value={tax} onChange={e => setTax(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Shipping Cost</label>
                  <input type="number" className="form-control" value={shippingCost} onChange={e => setShippingCost(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Quantity</label>
                  <input type="number" className="form-control" value={quantity} onChange={e => setQuantity(e.target.value)} />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Description</label>
                  <textarea className="form-control" value={description} onChange={e => setDescription(e.target.value)} rows={3}></textarea>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Images*</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="form-control"
                    multiple
                    onChange={handleImageChange}
                    required
                  />

                  {images.length > 0 && (
                    <>
                      <div className="mt-3 d-flex flex-wrap gap-2">
                        {images.map((img, idx) => (
                          <div key={idx} className="position-relative" style={{ width: '80px', height: '80px' }}>
                            <img
                              src={URL.createObjectURL(img)}
                              alt={`preview-${idx}`}
                              className="img-thumbnail"
                              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }}
                            />
                            <button
                              type="button"
                              onClick={() => setImages(images.filter((_, i) => i !== idx))}
                              className="btn btn-danger btn-sm position-absolute"
                              style={{ top: '-8px', right: '-8px', borderRadius: '50%', width: '20px', height: '20px', padding: '0', lineHeight: '18px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2">
                        <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => setImages([])}>Remove All Images</button>
                      </div>
                    </>
                  )}
                </div>

              </div>

              <div className="mt-4 d-grid">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? <> <span className="spinner-border spinner-border-sm me-2"></span> Uploading...</> : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}