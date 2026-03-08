'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [shipModal, setShipModal] = useState(false);
  const [shipData, setShipData] = useState({ order_number: '', shipping_tracking_id: '', shipping_provider: '' });

  const itemsPerPage = 10;

  /** Fetch orders */
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/orders/total');
        const data = await res.json();
        setOrders(data || []);
        setFilteredOrders(data || []);
      } catch (err) {
        console.error('Error fetching orders:', err);
        Swal.fire('Error', 'Failed to fetch orders', 'error');
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  /** Filter orders by search */
  useEffect(() => {
    const filtered = orders.filter(o =>
      o.order_number.toString().includes(search) ||
      (o.product_name && o.product_name.toLowerCase().includes(search.toLowerCase())) ||
      (o.name && o.name.toLowerCase().includes(search.toLowerCase())) ||
      (o.email && o.email.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredOrders(filtered);
    setCurrentPage(1);
  }, [search, orders]);

  /** Pagination */
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  /** Cancel order */
  const cancelOrder = async (orderNumber, userId) => {
    const confirm = await Swal.fire({
      title: 'Are you sure?',
      text: `Do you want to cancel order ${orderNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Cancel',
      cancelButtonText: 'No, Keep'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number: orderNumber, userId })
      });

      const data = await res.json();
      if (!res.ok) {
        Swal.fire('Error', data.error || 'Cancel failed', 'error');
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Cancelled!',
        text: `Order ${orderNumber} cancelled successfully`,
        timer: 2000,
        showConfirmButton: false
      });

      // Update frontend
      setOrders(prev => prev.map(o => o.order_number === orderNumber ? { ...o, order_status: 'cancelled' } : o));
      setFilteredOrders(prev => prev.map(o => o.order_number === orderNumber ? { ...o, order_status: 'cancelled' } : o));

    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  /** Open ship modal */
  const openShipModal = (order) => {
    setShipData({
      order_number: order.order_number,
      shipping_tracking_id: order.shipping_tracking_id || '',
      shipping_provider: order.shipping_provider || ''
    });
    setShipModal(true);
  };

  /** Mark order as shipped */
  const markAsShipped = async () => {
    try {
      const { order_number, shipping_tracking_id, shipping_provider } = shipData;

      if (!shipping_tracking_id || !shipping_provider) {
        Swal.fire('Error', 'Please fill tracking ID and provider', 'error');
        return;
      }

      const res = await fetch('/api/orders/shipped', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number, shipping_tracking_id, shipping_provider })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to mark shipped');

      Swal.fire('Success', `Order ${order_number} marked as shipped`, 'success');

      // Update frontend
      setOrders(prev => prev.map(o => o.order_number === order_number
        ? { ...o, order_status: 'shipped', shipping_tracking_id, shipping_provider, shipped_date: new Date().toISOString() }
        : o
      ));
      setFilteredOrders(prev => prev.map(o => o.order_number === order_number
        ? { ...o, order_status: 'shipped', shipping_tracking_id, shipping_provider, shipped_date: new Date().toISOString() }
        : o
      ));

      setShipModal(false);
    } catch (err) {
      console.error(err);
      Swal.fire('Error', err.message || 'Something went wrong', 'error');
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
      <div className="mb-4 d-flex align-items-center flex-wrap">
        <h2 className="fw-bold me-4">Manage Orders</h2>
        <input
          type="text"
          className="form-control"
          placeholder="Search by order number, product, or user"
          value={search}
          style={{ width: '350px' }}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Orders Table */}
      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Order Number</th>
                <th>Product</th>
                <th>User</th>
                <th>Email</th>
                <th>Qty</th>
                <th>Total</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center">No orders found</td>
                </tr>
              ) : currentOrders.map((order, idx) => (
                <tr key={order.order_number || idx}>
                  <td>{indexOfFirst + idx + 1}</td>
                  <td>{order.order_number}</td>
                  <td>{order.product_name || 'N/A'}</td>
                  <td>{order.name || 'N/A'}</td>
                  <td>{order.email || 'N/A'}</td>
                  <td>{order.quantity}</td>
                  <td>₹{order.total_amount || (order.price * order.quantity)}</td>
                  <td className={order.order_status === 'cancelled' ? 'text-danger' : order.order_status === 'shipped' ? 'text-success' : ''}>
                    {order.order_status || 'booked'}
                  </td>
                  <td>
                    {order.order_status === 'booked' && (
                      <>
                        <button className="btn btn-sm btn-danger me-2" onClick={() => cancelOrder(order.order_number, order.user_id)}>Cancel</button>
                        <button className="btn btn-sm btn-success" onClick={() => openShipModal(order)}>Mark Shipped</button>
                      </>
                    )}
                    {order.order_status === 'shipped' && (
                      <span className="badge bg-success">Shipped</span>
                    )}
                    {order.order_status === 'cancelled' && (
                      <span className="badge bg-danger">Cancelled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="card-footer d-flex justify-content-between align-items-center">
          <span>
            Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredOrders.length)} of {filteredOrders.length} orders
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

      {/* Ship Modal */}
      {shipModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Mark Order Shipped</h5>
                <button type="button" className="btn-close" onClick={() => setShipModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Tracking ID</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipData.shipping_tracking_id}
                    onChange={e => setShipData({ ...shipData, shipping_tracking_id: e.target.value })}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Shipping Provider</label>
                  <input
                    type="text"
                    className="form-control"
                    value={shipData.shipping_provider}
                    onChange={e => setShipData({ ...shipData, shipping_provider: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShipModal(false)}>Cancel</button>
                <button className="btn btn-success" onClick={markAsShipped}>Mark Shipped</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .card { border-radius: 12px; }
        .table th, .table td { vertical-align: middle; }
      `}</style>
    </div>
  );
}