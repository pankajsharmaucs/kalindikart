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

  const showAddressPopup = (order) => {
    Swal.fire({
      title: 'Shipping Address',
      html: `
      <div style="text-align:left; font-size:14px;">
        <p><strong>Name:</strong> ${order.fullname || 'N/A'}</p>
        <p><strong>Mobile:</strong> ${order.mobile || 'N/A'}</p>
        <p><strong>Email:</strong> ${order.email || 'N/A'}</p>
        <hr/>
        <p><strong>Address Line 1:</strong> ${order.address_line1 || 'N/A'}</p>
        <p><strong>Address Line 2:</strong> ${order.address_line2 || 'N/A'}</p>
        <p><strong>Address Line 3:</strong> ${order.address_line3 || 'N/A'}</p>
        <p><strong>Landmark:</strong> ${order.landmark || 'N/A'}</p>
        <p><strong>Pincode:</strong> ${order.pincode || 'N/A'}</p>
      </div>
    `,
      icon: 'info',
      confirmButtonText: 'Close',
      width: '500px'
    });
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

  const printInvoice = (order) => {
    const invoiceWindow = window.open('', '_blank');

    const gstRate = 18;
    const price = parseFloat(order.price || 0);
    const qty = parseInt(order.order_qty || 0);
    const subtotal = price * qty;
    const gstAmount = (subtotal * gstRate) / 100;
    const total = subtotal + gstAmount;

    invoiceWindow.document.write(`
    <html>
      <head>
        <title>Invoice - ${order.order_number}</title>
        <style>
          body {
            font-family: Arial;
            padding: 20px;
            color: #000;
          }
          .header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .box {
            width: 48%;
          }
          h2, h4 {
            margin: 0 0 10px 0;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          table, th, td {
            border: 1px solid #000;
          }
          th, td {
            padding: 8px;
            text-align: center;
          }
          .text-left {
            text-align: left;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
          }
          .note {
            margin-top: 20px;
            font-size: 12px;
            text-align: center;
          }
        </style>
      </head>
      <body>

        <h2>INVOICE</h2>

        <div class="header">
          <!-- Customer Address -->
          <div class="box">
            <h4>Billing To:</h4>
            <p><strong>${order.fullname}</strong></p>
            <p>${order.address_line1 || ''}</p>
            <p>${order.address_line2 || ''}</p>
            <p>${order.address_line3 || ''}</p>
            <p>${order.landmark || ''}</p>
            <p>Pincode: ${order.pincode || ''}</p>
            <p>Mobile: ${order.mobile || ''}</p>
            <p>Email: ${order.email || ''}</p>
          </div>

          <!-- Order Info -->
          <div class="box">
            <h4>Order Details:</h4>
            <p><strong>Order ID:</strong> ${order.order_number}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Payment:</strong> ${order.payment_method}</p>
            <p><strong>Status:</strong> ${order.order_status}</p>
          </div>
        </div>

        <!-- Product Table -->
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th class="text-left">Product</th>
              <th>Qty</th>
              <th>Price</th>
              <th>GST (${gstRate}%)</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td class="text-left">${order.product_name}</td>
              <td>${qty}</td>
              <td>₹${price.toFixed(2)}</td>
              <td>₹${gstAmount.toFixed(2)}</td>
              <td>₹${total.toFixed(2)}</td>
            </tr>

            <!-- Final Row -->
            <tr>
              <td colspan="5"><strong>Grand Total</strong></td>
              <td><strong>₹${total.toFixed(2)}</strong></td>
            </tr>
          </tbody>
        </table>

        <!-- Footer -->
        <div class="footer">
          <div>
            <p><strong>Your Company Name</strong></p>
          </div>
          <div style="text-align:right;">
            <p>Authorised Signature</p>
            <br/><br/>
            ______________________
          </div>
        </div>

        <div class="note">
          This is a computer generated bill.
        </div>

        <script>
          window.onload = function() {
            window.print();
          }
        </script>

      </body>
    </html>
  `);

    invoiceWindow.document.close();
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
                  <td>{order.order_qty}</td>
                  <td>₹{order.total_amount || (order.price * order.quantity)}</td>
                  <td className={order.order_status === 'cancelled' ? 'text-danger' : order.order_status === 'shipped' ? 'text-success' : ''}>
                    {order.order_status || 'booked'}
                  </td>
                  <td>

                    {/* View Address Button */}
                    <button
                      className="btn btn-sm btn-primary me-2"
                      onClick={() => showAddressPopup(order)}
                    >
                      User Details
                    </button>

                    <button
                      className="btn btn-sm btn-success me-2 "
                      onClick={() => printInvoice(order)}
                    >
                      Print Bill
                    </button>


                    {order.order_status === 'booked' && (
                      <>
                        <button className="btn btn-sm btn-warning  me-2" onClick={() => openShipModal(order)}>Mark Shipped</button>
                        <button className="btn btn-sm btn-danger" onClick={() => cancelOrder(order.order_number, order.user_id)}>Cancel</button>
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