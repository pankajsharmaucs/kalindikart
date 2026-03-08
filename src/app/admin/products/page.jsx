'use client';

import { useEffect, useState } from 'react';
import swal from 'sweetalert';



export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);

    const [editProduct, setEditProduct] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const itemsPerPage = 10;

    /** Fetch products on mount */
    useEffect(() => {
        async function fetchProducts() {
            try {
                const res = await fetch('/api/products');
                const data = await res.json();
                setProducts(data || []);
                setFilteredProducts(data || []);
            } catch (err) {
                console.error('Error fetching products:', err);
            } finally {
                setLoading(false);
            }
        }
        fetchProducts();
    }, []);

    /** Filter products by search */
    useEffect(() => {
        const filtered = products.filter(p =>
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.slug.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredProducts(filtered);
        setCurrentPage(1);
    }, [search, products]);

    /** Pagination calculations */
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    /** Open edit modal */
    const handleEdit = async (productSlug) => {
        try {
            const res = await fetch(`/api/products?slug=${productSlug}`);
            const data = await res.json();
            if (!data) {
                alert('Product not found');
                return;
            }
            // Ensure images is array
            data.images = Array.isArray(data.images) ? data.images : JSON.parse(data.images || '[]');
            setEditProduct(data);
            setShowModal(true);
        } catch (err) {
            console.error('Error fetching product:', err);
        }
    };


    const handleSave = async () => {
        try {
            if (!editProduct) return;

            const payload = {
                id: editProduct.id,
                title: editProduct.title,
                slug: editProduct.slug,
                category_id: Number(editProduct.category_id),
                sub_cat_id: editProduct.sub_category_id || editProduct.sub_cat_id || null,
                price: Number(editProduct.price),
                discount: Number(editProduct.discount),
                tax: Number(editProduct.tax),
                shipping_cost: Number(editProduct.shipping_cost),
                quantity: Number(editProduct.quantity),
                description: editProduct.description,
                images: Array.isArray(editProduct.images)
                    ? editProduct.images
                    : JSON.parse(editProduct.images || '[]'),
            };

            const res = await fetch('/api/products', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (data.error) throw new Error(data.error);

            // Update frontend list
            setProducts(products.map(p => (p.id === editProduct.id ? editProduct : p)));
            setFilteredProducts(filteredProducts.map(p => (p.id === editProduct.id ? editProduct : p)));
            setShowModal(false);

            // ✅ SweetAlert success
            swal({
                title: "Success!",
                text: "Product updated successfully!",
                icon: "success",
                button: "OK",
                closeOnClickOutside: false, // prevent closing by clicking outside
                className: "swal-center",   // optional custom class
            });
        } catch (err) {
            console.error(err);
            swal("Error", "Failed to update product", "error");
        }
    };


    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    );

    return (
        <div className="container-fluid p-md-4 p-1">

            {/* Header */}
            <div className="mb-4 d-flex align-items-center flex-wrap">
                <h2 className="fw-bold me-4">Products</h2>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by title or slug"
                    value={search}
                    style={{ width: '350px' }}
                    onChange={e => setSearch(e.target.value)}
                />
            </div>

            {/* Products Table */}
            <div className="card shadow-sm border-0">
                <div className="table-responsive">
                    <table className="table align-middle mb-0">
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>Title</th>
                                <th>Slug</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center">No products found</td>
                                </tr>
                            ) : currentProducts.map((product, idx) => (
                                <tr key={product.id || idx}>
                                    <td>{indexOfFirst + idx + 1}</td>
                                    <td>{product.title}</td>
                                    <td>{product.slug}</td>
                                    <td>{product.category_name || 'N/A'}</td>
                                    <td>₹{product.price}</td>
                                    <td>{product.quantity}</td>
                                    <td>
                                        <button className="btn btn-sm btn-primary me-2" onClick={() => handleEdit(product.slug)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="card-footer d-flex justify-content-between align-items-center">
                    <span>
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredProducts.length)} of {filteredProducts.length} products
                    </span>
                    <nav>
                        <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => prev - 1)}>Prev</button>
                            </li>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
                                </li>
                            ))}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                <button className="page-link" onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && editProduct && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Edit Product</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editProduct.title}
                                        onChange={e => setEditProduct({ ...editProduct, title: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Slug</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={editProduct.slug}
                                        onChange={e => setEditProduct({ ...editProduct, slug: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Price</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={editProduct.price}
                                        onChange={e => setEditProduct({ ...editProduct, price: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Quantity</label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        value={editProduct.quantity}
                                        onChange={e => setEditProduct({ ...editProduct, quantity: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Description</label>
                                    <textarea
                                        className="form-control"
                                        value={editProduct.description}
                                        onChange={e => setEditProduct({ ...editProduct, description: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleSave}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Card styling */}
            <style jsx>{`
        .card {
          border-radius: 12px;
        }
        .table th, .table td {
          vertical-align: middle;
        }
      `}</style>
        </div>
    );
}