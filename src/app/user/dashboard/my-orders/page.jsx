

'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

// Helper to resolve image URL
const resolveImage = (img) => {
  if (!img) return '/placeholder.png';
  return img.startsWith('/') ? img : `/${img}`;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState(null);
  const [filter, setFilter] = useState('all');

  // Get mobile from localStorage
  useEffect(() => {
    const storedMobile = localStorage.getItem('userMobile');
    if (storedMobile) setMobile(storedMobile);
    setLoading(false);
  }, []);

  // Fetch orders
  useEffect(() => {
    if (!mobile) return;

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders?mobile=${mobile}`);
        const data = await res.json();

        const safeData = Array.isArray(data)
          ? data.map((order) => ({
              ...order,
              items: Array.isArray(order.items) ? order.items : [],
            }))
          : [];

        setOrders(safeData);
      } catch (err) {
        console.error(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [mobile]);

  // Cancel order
  const handleCancelOrder = async (order_number) => {
    const result = await Swal.fire({
      title: 'Cancel Order?',
      text: 'Are you sure you want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, Cancel It',
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_number }),
      });

      if (!res.ok) throw new Error('Failed to cancel order');

      setOrders((prev) =>
        prev.map((o) =>
          o.order_number === order_number
            ? { ...o, order_status: 'cancelled', payment_status: 'failed' }
            : o
        )
      );

      Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  // Track order
  const handleTrackOrder = (order) => {
    Swal.fire({
      title: '📦 Tracking Information',
      html: `
        <p><b>Tracking Number:</b> ${order.tracking_number || 'N/A'}</p>
        <p><b>Provider:</b> ${order.shipping_provider || 'N/A'}</p>
        <p><b>Shipped:</b> ${
          order.shipped_date ? new Date(order.shipped_date).toLocaleDateString() : 'N/A'
        }</p>
        <p><b>Delivered:</b> ${
          order.delivered_date ? new Date(order.delivered_date).toLocaleDateString() : 'In Transit'
        }</p>
      `,
      icon: 'info',
    });
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'status-pending';
      case 'processing':
        return 'status-processing';
      case 'shipped':
        return 'status-shipped';
      case 'delivered':
        return 'status-delivered';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  };

  const filteredOrders = orders.filter((o) =>
    filter === 'all' ? true : o.order_status?.toLowerCase() === filter
  );

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="mt-3">Loading your orders...</p>
      </div>
    );
  }

  if (!mobile) {
    return (
      <div className="container py-5 text-center">
        <h3>Login Required</h3>
        <button className="btn btn-primary" onClick={() => (window.location.href = '/login')}>
          Login
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="orders-page-wrapper">
        <div className="container py-3">

          <div className="orders-header">
            <h2>My Orders</h2>
            <p>{orders.length} orders found</p>
          </div>

          <div className="filter-tabs">
            {['all', 'pending', 'delivered', 'cancelled'].map((s) => (
              <button
                key={s}
                className={`filter-btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="orders-list">
            {filteredOrders.map((order) => {
              // ✅ FINAL TOTAL FIX
              const totalAmount = order.items.reduce((sum, item) => {
                const price = Number(item.price || 0);
                const qty = Number(item.quantity || 0);
                return sum + price * qty;
              }, 0);

              const showCancel =
                !order.tracking_number &&
                !['cancelled', 'delivered'].includes(order.order_status);

              return (
                <div key={order.order_number} className="order-card">
                  <div className="order-header">
                    <div>
                      <b>#{order.order_number}</b>
                    </div>
                    <div>
                      <span className={`status-badge ${getStatusBadge(order.order_status)}`}>
                        {order.order_status}
                      </span>
                      <div className="order-total">
                        ₹{totalAmount.toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="order-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="order-item">
                        <img src={resolveImage(item.image)} className="item-image" />
                        <div>
                          <div>{item.product_name}</div>
                          <small>
                            ₹{item.price} × {item.quantity}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="order-actions">
                    {order.tracking_number && (
                      <button className="btn-track" onClick={() => handleTrackOrder(order)}>
                        Track
                      </button>
                    )}
                    {showCancel && (
                      <button
                        className="btn-cancel"
                        onClick={() => handleCancelOrder(order.order_number)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      
     <style jsx global>{`
        /* ============= PAGE WRAPPER ============= */
        .orders-page-wrapper {
          background: #eff9fb;
          min-height: 100vh;
          padding: 1rem 0 2rem 0;
        }

        /* ============= HEADER ============= */
        .orders-header {
          background: white;
          padding: 1rem;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          margin-bottom: 1rem;
        }

        .orders-icon {
          width: 55px;
          height: 55px;
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.4rem;
        }

        .orders-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }

        .orders-subtitle {
          color: #666;
          margin: 0;
          font-size: 0.9rem;
        }

        /* ============= FILTER TABS ============= */
        .filter-tabs {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }

        .filter-btn {
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          color: #666;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .filter-btn:hover {
          border-color: #178ad6;
          color: #178ad6;
        }

        .filter-btn.active {
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
          border-color: transparent;
        }

        /* ============= EMPTY STATE ============= */
        .empty-orders {
          text-align: center;
          padding: 3rem 2rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.08);
        }

        .empty-orders .empty-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1.5rem;
          background: #f8f9fa;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .empty-orders .empty-icon i {
          font-size: 2.5rem;
          color: #adb5bd;
        }

        .empty-orders h4 {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .btn-shop {
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
          border: none;
          padding: 0.65rem 1.5rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          margin-top: 1rem;
        }

        /* ============= ORDERS LIST ============= */
        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .order-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        /* Order Header */
        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.875rem 1rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .order-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .order-number {
          font-weight: 700;
          color: #333;
          font-size: 0.95rem;
        }

        .order-date {
          color: #999;
          font-size: 0.8rem;
        }

        .order-status-section {
          text-align: right;
        }

        .status-badge {
          display: inline-block;
          padding: 0.35rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .status-pending {
          background: rgba(255, 193, 7, 0.2);
          color: #ff9800;
        }

        .status-processing {
          background: rgba(33, 150, 243, 0.2);
          color: #2196f3;
        }

        .status-shipped {
          background: rgba(103, 58, 183, 0.2);
          color: #673ab7;
        }

        .status-delivered {
          background: rgba(76, 175, 80, 0.2);
          color: #4caf50;
        }

        .status-cancelled {
          background: rgba(244, 67, 54, 0.2);
          color: #f44336;
        }

        .status-default {
          background: rgba(158, 158, 158, 0.2);
          color: #9e9e9e;
        }

        .order-total {
          font-size: 1.1rem;
          font-weight: 700;
          color: #178ad6;
          margin-top: 0.25rem;
        }

        /* Order Items */
        .order-items {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .order-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.6rem;
          background: #f8f9fa;
          border-radius: 6px;
        }

        .item-image {
          width: 55px;
          height: 55px;
          border-radius: 6px;
          object-fit: cover;
          border: 1px solid #e0e0e0;
        }

        .item-details {
          flex: 1;
        }

        .item-name {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .item-price-qty {
          color: #666;
          font-size: 0.8rem;
        }

        .no-items {
          color: #999;
          font-size: 0.9rem;
          text-align: center;
          margin: 0;
        }

        /* Order Actions */
        .order-actions {
          display: flex;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border-top: 1px solid #f0f0f0;
        }

        .btn-track,
        .btn-cancel {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-track {
          background: linear-gradient(135deg, #178ad6, #27bbc9);
          color: white;
        }

        .btn-track:hover {
          opacity: 0.9;
        }

        .btn-cancel {
          background: white;
          border: 1px solid #dc3545;
          color: #dc3545;
        }

        .btn-cancel:hover {
          background: #dc3545;
          color: white;
        }

        /* ============= RESPONSIVE ============= */
        @media (max-width: 576px) {
          .orders-page-wrapper {
            padding: 0.75rem 0 1.5rem 0;
          }

          .orders-header {
            padding: 0.875rem;
          }

          .orders-icon {
            width: 50px;
            height: 50px;
            font-size: 1.25rem;
          }

          .orders-title {
            font-size: 1.25rem;
          }

          .order-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.75rem;
          }

          .order-status-section {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .item-image {
            width: 50px;
            height: 50px;
          }

          .item-name {
            font-size: 0.85rem;
          }

          .order-actions {
            flex-direction: column;
          }

          .btn-track,
          .btn-cancel {
            width: 100%;
          }
        }
      `}</style>

    </>
  );
}
