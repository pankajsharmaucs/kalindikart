'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

const PRIMARY = 'rgb(39, 171, 204)';
const PRIMARY_SOFT = 'rgba(39, 171, 204, 0.08)';

const resolveImage = (img) => {
  if (!img) return '/placeholder.png';
  return img.startsWith('/') ? img : `/${img}`;
};

const ORDER_PIPELINE = [
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'out_for_delivery', label: 'In Transit' },
  { key: 'delivered', label: 'Delivered' },
];

function getCurrentStepFromStatus(status = '') {
  const s = status.toLowerCase();
  if (s === 'pending' || s === 'placed') return 0;
  if (s === 'confirmed' || s === 'processing') return 1;
  if (s === 'packed') return 2;
  if (s === 'shipped') return 3;
  if (s === 'out_for_delivery') return 4;
  if (s === 'delivered') return 5;
  if (s === 'cancelled' || s === 'failed') return -1;
  return 0;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const storedMobile = localStorage.getItem('userMobile');
    if (storedMobile) setMobile(storedMobile);
    setLoading(false);
  }, []);

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

  const handleCancelOrder = async (order_number) => {
    const result = await Swal.fire({
      title: 'Cancel Order',
      text: 'Are you sure you want to cancel this order? This action cannot be reversed.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Cancel Order',
      cancelButtonText: 'Keep Order',
      customClass: {
        popup: 'swal-modern',
        title: 'swal-title',
        confirmButton: 'swal-confirm',
        cancelButton: 'swal-cancel',
      },
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

      Swal.fire({
        icon: 'success',
        title: 'Order Cancelled',
        text: 'Your order has been successfully cancelled.',
        timer: 2000,
        showConfirmButton: false,
        customClass: { popup: 'swal-modern', title: 'swal-title' },
      });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message,
        customClass: { popup: 'swal-modern', title: 'swal-title' },
      });
    }
  };

  const handleTrackOrder = (order) => {
    const status = (order.order_status || '').toLowerCase();
    const cancelled = status === 'cancelled' || status === 'failed';
    const currentStep = getCurrentStepFromStatus(order.order_status);
    const expectedDate = order.expected_delivery
      ? new Date(order.expected_delivery).toLocaleDateString('en-IN')
      : null;
    const placedDate = order.created_at
      ? new Date(order.created_at).toLocaleString('en-IN')
      : null;

    const timelineHtml = cancelled
      ? `<div class="track-cancelled">
          <p class="track-title">Order Cancelled</p>
          <p class="track-desc">This order was cancelled. Any refund will be processed according to your bank's timeline.</p>
        </div>`
      : `
      <div class="track-modal">
        <div class="track-row">
          <div class="track-col">
            <label>Tracking Number</label>
            <p>${order.tracking_number || 'Pending generation'}</p>
          </div>
          <div class="track-col">
            <label>Expected Delivery</label>
            <p>${expectedDate || 'To be updated'}</p>
          </div>
        </div>

        <div class="track-timeline">
          ${ORDER_PIPELINE.map((step, index) => {
            const done = currentStep >= index && currentStep !== -1;
            const active = currentStep === index;
            const isLast = index === ORDER_PIPELINE.length - 1;
            return `
            <div class="track-step-wrapper">
              <div class="track-step-container">
                <div class="track-marker ${done ? 'done' : ''} ${active ? 'active' : ''}">
                  ${done ? '<span class="check-icon">✓</span>' : ''}
                </div>
                ${!isLast ? `<div class="track-connector ${currentStep > index ? 'completed' : ''}"></div>` : ''}
              </div>
              <div class="track-label">
                <p class="track-step-name ${done ? 'done' : ''} ${active ? 'active' : ''}">${step.label}</p>
              </div>
            </div>
          `;
          }).join('')}
        </div>

        <div class="track-details">
          ${placedDate ? `<p><strong>Order Date:</strong> ${placedDate}</p>` : ''}
          ${order.shipping_provider ? `<p><strong>Courier:</strong> ${order.shipping_provider}</p>` : ''}
          ${order.address_line ? `<p><strong>Delivery Address:</strong> ${order.address_line}, ${order.city || ''} ${order.pincode || ''}</p>` : ''}
        </div>
      </div>
    `;

    Swal.fire({
      title: 'Order Tracking',
      html: timelineHtml,
      icon: cancelled ? 'error' : 'info',
      showConfirmButton: true,
      confirmButtonText: 'Close',
      customClass: {
        popup: 'swal-modern',
        title: 'swal-title',
        confirmButton: 'swal-confirm',
      },
      width: 600,
    });
  };

  const getStatusClass = (status) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
      case 'placed':
        return 'pending';
      case 'processing':
      case 'confirmed':
      case 'packed':
        return 'processing';
      case 'shipped':
        return 'shipped';
      case 'out_for_delivery':
        return 'transit';
      case 'delivered':
        return 'delivered';
      case 'cancelled':
      case 'failed':
        return 'cancelled';
      default:
        return 'default';
    }
  };

  // Group orders by order_number to handle multiple items per order
  const groupedOrders = orders.reduce((acc, order) => {
    const orderNum = order.order_number;
    if (!acc[orderNum]) {
      acc[orderNum] = {
        ...order,
        items: []
      };
    }
    // Add item to the order's items array
    if (order.items && order.items.length > 0) {
      acc[orderNum].items.push(...order.items);
    }
    return acc;
  }, {});

  const uniqueOrders = Object.values(groupedOrders);

  const filteredOrders = uniqueOrders.filter((o) =>
    filter === 'all' ? true : (o.order_status || '').toLowerCase() === filter
  );

  const orderCounts = {
    all: uniqueOrders.length,
    pending: uniqueOrders.filter((o) => ['pending', 'placed'].includes((o.order_status || '').toLowerCase())).length,
    processing: uniqueOrders.filter((o) => ['processing', 'confirmed', 'packed'].includes((o.order_status || '').toLowerCase())).length,
    shipped: uniqueOrders.filter((o) => (o.order_status || '').toLowerCase() === 'shipped').length,
    delivered: uniqueOrders.filter((o) => (o.order_status || '').toLowerCase() === 'delivered').length,
    cancelled: uniqueOrders.filter((o) => ['cancelled', 'failed'].includes((o.order_status || '').toLowerCase())).length,
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="loader-box">
          <div className="spinner"></div>
          <p>Loading orders...</p>
        </div>
      </div>
    );
  }

  if (!mobile) {
    return (
      <div className="page-wrapper">
        <div className="auth-box">
          <h2>Authentication Required</h2>
          <p>Please login to view your orders.</p>
          <button className="btn-primary" onClick={() => (window.location.href = '/login')}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-wrapper">
        <div className="page-layout">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <div className="sidebar-top">
              <h1 className="sidebar-title">Orders</h1>
            </div>

            <nav className="filter-menu">
              {[
                { key: 'all', label: 'All Orders' },
                { key: 'pending', label: 'Pending' },
                { key: 'processing', label: 'Processing' },
                { key: 'shipped', label: 'Shipped' },
                { key: 'delivered', label: 'Delivered' },
                { key: 'cancelled', label: 'Cancelled' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`filter-item ${filter === tab.key ? 'active' : ''}`}
                  onClick={() => setFilter(tab.key)}
                >
                  <span className="filter-label">{tab.label}</span>
                  <span className="filter-count">{orderCounts[tab.key]}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* MAIN */}
          <main className="main-content">
            <div className="content-header">
              <h2>{filter === 'all' ? 'All Orders' : filter.charAt(0).toUpperCase() + filter.slice(1)}</h2>
              <span className="result-count">{filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''}</span>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="empty-state">
                <h3>No Orders</h3>
                <p>You don't have any orders in this category.</p>
                <button className="btn-primary" onClick={() => (window.location.href = '/')}>
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="orders-grid">
                {filteredOrders.map((order) => {
                  const totalAmount = order.items.reduce((sum, item) => {
                    const price = Number(item.price || 0);
                    const qty = Number(item.quantity || 0);
                    return sum + price * qty;
                  }, 0);

                  const showCancel =
                    !['cancelled', 'delivered', 'failed'].includes(
                      (order.order_status || '').toLowerCase()
                    ) && !order.tracking_locked;

                  const orderDate = order.created_at
                    ? new Date(order.created_at).toLocaleDateString('en-IN')
                    : null;

                  const currentStep = getCurrentStepFromStatus(order.order_status);

                  return (
                    <article key={order.order_number} className="order-box">
                      <div className="order-header-row">
                        <div className="order-id-col">
                          <p className="order-id">Order #{order.order_number}</p>
                          {orderDate && <p className="order-date">{orderDate}</p>}
                        </div>
                        <div className="order-amount-col">
                          <p className="order-amount">₹{totalAmount.toLocaleString('en-IN')}</p>
                          <span className={`status-label ${getStatusClass(order.order_status)}`}>
                            {order.order_status || 'Unknown'}
                          </span>
                        </div>
                      </div>

                      {!['cancelled', 'failed'].includes((order.order_status || '').toLowerCase()) && (
                        <div className="timeline-horizontal">
                          {ORDER_PIPELINE.map((step, index) => {
                            const done = currentStep >= index && currentStep !== -1;
                            const active = currentStep === index;
                            const isLast = index === ORDER_PIPELINE.length - 1;
                            return (
                              <div key={step.key} className="timeline-h-step">
                                <div className="timeline-h-top">
                                  <div className={`timeline-h-node ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                                    {done && <span className="timeline-h-check">✓</span>}
                                    {active && <span className="timeline-h-pulse"></span>}
                                  </div>
                                  {!isLast && <div className={`timeline-h-line ${done ? 'completed' : ''}`}></div>}
                                </div>
                                <p className={`timeline-h-label ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                                  {step.label}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      <div className="items-section">
                        {order.items.map((item, i) => (
                          <div key={i} className="item-row">
                            <img src={resolveImage(item.image)} alt={item.product_name} className="item-img" />
                            <div className="item-col">
                              <p className="item-title">{item.product_name || 'Product'}</p>
                              <p className="item-qty">Qty: {item.quantity}</p>
                            </div>
                            <p className="item-price">₹{item.price}</p>
                          </div>
                        ))}
                      </div>

                      <div className="action-row">
                        <button className="btn-track" onClick={() => handleTrackOrder(order)}>
                          Track Order
                        </button>
                        {showCancel && (
                          <button className="btn-cancel-order" onClick={() => handleCancelOrder(order.order_number)}>
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx global>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        :root {
          --primary: ${PRIMARY};
          --primary-soft: ${PRIMARY_SOFT};
          --text-primary: #0f1419;
          --text-secondary: #57606f;
          --border-color: #dfe4ea;
          --bg-light: #f8f9fa;
          --bg-white: #ffffff;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          background: var(--bg-light);
          color: var(--text-primary);
        }

        .page-wrapper {
          min-height: 100vh;
          padding: 1rem;
          background: var(--bg-light);
        }

        .page-layout {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 240px 1fr;
          gap: 1rem;
        }

        /* SIDEBAR */
        .sidebar {
          background: var(--bg-white);
          border-radius: 8px;
          padding: 1.5rem 1rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
          height: fit-content;
          position: sticky;
          top: 1rem;
        }

        .sidebar-top {
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
        }

        .sidebar-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .filter-menu {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .filter-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.85rem 1rem;
          border: none;
          border-radius: 8px;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-size: 1rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .filter-item:hover {
          background: var(--bg-light);
          color: var(--text-primary);
        }

        .filter-item.active {
          background: var(--primary);
          color: #fff;
        }

        .filter-label {
          flex: 1;
        }

        .filter-count {
          background: rgba(0, 0, 0, 0.1);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          min-width: 24px;
          text-align: center;
        }

        .filter-item.active .filter-count {
          background: rgba(255, 255, 255, 0.3);
        }

        /* MAIN */
        .main-content {
          background: var(--bg-white);
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }

        .content-header h2 {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .result-count {
          font-size: 1rem;
          color: var(--text-secondary);
        }

        .orders-grid {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .order-box {
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 1.25rem;
          background: #fafbfc;
          transition: all 0.25s;
        }

        .order-box:hover {
          border-color: var(--primary);
          box-shadow: 0 4px 12px rgba(39, 171, 204, 0.15);
          transform: translateY(-2px);
        }

        .order-header-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.75rem;
        }

        .order-id-col {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .order-id {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .order-date {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .order-amount-col {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.4rem;
        }

        .order-amount {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--primary);
        }

        .status-label {
          display: inline-block;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .status-label.pending {
          background: rgba(251, 191, 36, 0.15);
          color: #d97706;
        }

        .status-label.processing {
          background: var(--primary-soft);
          color: var(--primary);
        }

        .status-label.shipped {
          background: rgba(59, 130, 246, 0.12);
          color: #2563eb;
        }

        .status-label.transit {
          background: rgba(34, 197, 94, 0.12);
          color: #16a34a;
        }

        .status-label.delivered {
          background: rgba(22, 163, 74, 0.12);
          color: #15803d;
        }

        .status-label.cancelled {
          background: rgba(239, 68, 68, 0.12);
          color: #dc2626;
        }

        .timeline-horizontal {
          display: flex;
          align-items: flex-start;
          margin: 1.5rem 0 1rem;
          position: relative;
        }

        .timeline-h-step {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        }

        .timeline-h-top {
          display: flex;
          align-items: center;
          width: 100%;
          justify-content: center;
          margin-bottom: 0.75rem;
          position: relative;
        }

        .timeline-h-node {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
          flex-shrink: 0;
        }

        .timeline-h-node.done {
          background: var(--primary);
          border-color: var(--primary);
        }

        .timeline-h-node.active {
          background: #fbbf24;
          border-color: #fbbf24;
          box-shadow: 0 0 0 5px rgba(251, 191, 36, 0.2);
          animation: timeline-pulse 2s infinite;
        }

        .timeline-h-check {
          color: #fff;
          font-weight: bold;
          font-size: 1.1rem;
          line-height: 1;
        }

        .timeline-h-pulse {
          position: absolute;
          width: 10px;
          height: 10px;
          background: #fff;
          border-radius: 50%;
          animation: pulse-dot 2s infinite;
        }

        @keyframes timeline-pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.2);
          }
          50% {
            box-shadow: 0 0 0 6px rgba(251, 191, 36, 0.1);
          }
        }

        @keyframes pulse-dot {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.3);
            opacity: 0.7;
          }
        }

        .timeline-h-line {
          flex: 1;
          height: 2px;
          background: #e5e7eb;
          margin-left: -2px;
          transition: all 0.5s ease;
          position: relative;
        }

        .timeline-h-line.completed {
          background: var(--primary);
        }

        .timeline-h-label {
          font-size: 0.7rem;
          font-weight: 500;
          color: #9ca3af;
          text-align: center;
          margin-top: 0.4rem;
          transition: all 0.3s ease;
          line-height: 1.2;
        }

        .timeline-h-label.done {
          color: var(--primary);
          font-weight: 600;
        }

        .timeline-h-label.active {
          color: #d97706;
          font-weight: 700;
        }

        .items-section {
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 0.75rem 0;
          margin: 0.75rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .item-row {
          display: flex;
          gap: 0.8rem;
          align-items: center;
        }

        .item-img {
          width: 56px;
          height: 56px;
          border-radius: 8px;
          object-fit: cover;
          border: 1px solid var(--border-color);
          background: var(--bg-light);
        }

        .item-col {
          flex: 1;
        }

        .item-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.2rem;
        }

        .item-qty {
          font-size: 0.8rem;
          color: var(--text-secondary);
        }

        .item-price {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .action-row {
          display: flex;
          gap: 0.6rem;
        }

        .btn-track,
        .btn-cancel-order,
        .btn-primary {
          flex: 1;
          padding: 0.75rem 1.25rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-track {
          background: var(--primary);
          color: #fff;
        }

        .btn-track:hover {
          opacity: 0.9;
        }

        .btn-cancel-order {
          background: #fff;
          color: #dc2626;
          border: 1px solid #dc2626;
        }

        .btn-cancel-order:hover {
          background: rgba(220, 38, 38, 0.08);
        }

        .btn-primary {
          background: var(--primary);
          color: #fff;
        }

        .btn-primary:hover {
          opacity: 0.9;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
        }

        .empty-state h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .empty-state p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .loader-box,
        .auth-box {
          text-align: center;
          padding: 3rem 2rem;
          background: var(--bg-white);
          border-radius: 8px;
          max-width: 400px;
          margin: 2rem auto;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }

        .loader-box h2,
        .auth-box h2 {
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .loader-box p,
        .auth-box p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border-color);
          border-top-color: var(--primary);
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* SWAL */
        .swal-modern {
          border-radius: 8px !important;
          padding: 1.5rem !important;
        }

        .swal-title {
          font-size: 1.1rem !important;
          font-weight: 700 !important;
        }

        .swal-confirm,
        .swal-cancel {
          border-radius: 6px !important;
          padding: 0.6rem 1.5rem !important;
          font-size: 0.85rem !important;
          font-weight: 600 !important;
        }

        .swal-confirm {
          background: var(--primary) !important;
        }

        .swal-cancel {
          background: var(--bg-light) !important;
          color: var(--text-primary) !important;
        }

        .track-modal {
          text-align: left;
          font-size: 0.9rem;
        }

        .track-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .track-col label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 0.4rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .track-col p {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.95rem;
        }

        .track-timeline {
          border-top: 1px solid var(--border-color);
          border-bottom: 1px solid var(--border-color);
          padding: 1.5rem 0;
          margin-bottom: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          position: relative;
        }

        .track-step-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          position: relative;
        }

        .track-step-container {
          display: flex;
          align-items: center;
          width: 100%;
          justify-content: center;
          margin-bottom: 0.75rem;
        }

        .track-marker {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: 3px solid var(--border-color);
          background: #fff;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          transition: all 0.3s ease;
        }

        .track-marker.done {
          border-color: var(--primary);
          background: var(--primary);
        }

        .track-marker.active {
          border-color: #fbbf24;
          background: #fbbf24;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.2);
          animation: pulse 2s infinite;
        }

        .check-icon {
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
        }

        .track-connector {
          height: 3px;
          flex: 1;
          background: var(--border-color);
          position: relative;
          margin-left: -2px;
          transition: all 0.5s ease;
        }

        .track-connector.completed {
          background: var(--primary);
        }

        .track-label {
          text-align: center;
          width: 100%;
        }

        .track-step-name {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
          transition: all 0.3s ease;
        }

        .track-step-name.done {
          color: var(--primary);
          font-weight: 600;
        }

        .track-step-name.active {
          color: #d97706;
          font-weight: 700;
        }

        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.2);
          }
          50% {
            box-shadow: 0 0 0 8px rgba(251, 191, 36, 0.1);
          }
        }

        .track-details {
          font-size: 0.85rem;
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }

        .track-details p {
          margin: 0;
          color: var(--text-secondary);
        }

        .track-details strong {
          color: var(--text-primary);
          font-weight: 700;
        }

        .track-cancelled {
          text-align: center;
        }

        .track-title {
          font-size: 1rem;
          font-weight: 700;
          color: #dc2626;
          margin-bottom: 0.5rem;
        }

        .track-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        @media (max-width: 900px) {
          .page-layout {
            grid-template-columns: 200px 1fr;
            gap: 0.75rem;
          }

          .sidebar {
            padding: 1rem;
          }

          .main-content {
            padding: 1rem;
          }
        }

        @media (max-width: 720px) {
          .page-layout {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .sidebar {
            position: static;
            padding: 1rem;
          }

          .filter-menu {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 0.4rem;
          }

          .filter-item {
            padding: 0.5rem 0.5rem;
            flex-direction: column;
            text-align: center;
            font-size: 0.75rem;
          }

          .filter-label {
            margin-bottom: 0.3rem;
          }

          .order-header-row {
            flex-direction: column;
            gap: 0.6rem;
          }

          .order-amount-col {
            align-items: flex-start;
            flex-direction: row;
            justify-content: space-between;
            width: 100%;
          }

          .action-row {
            flex-direction: column;
          }

          .btn-track,
          .btn-cancel-order {
            width: 100%;
          }

          .item-row {
            flex-wrap: wrap;
          }

          .track-row {
            grid-template-columns: 1fr;
          }

          .timeline-horizontal {
            margin: 1rem 0;
          }

          .timeline-h-step {
            flex: 1;
          }

          .timeline-h-node {
            width: 30px;
            height: 30px;
            border-width: 2px;
          }

          .timeline-h-check {
            font-size: 0.95rem;
          }

          .timeline-h-label {
            font-size: 0.7rem;
          }

          .track-timeline {
            flex-direction: column;
            padding: 1rem 0;
          }

          .track-step-wrapper {
            flex-direction: row;
            align-items: center;
            width: 100%;
            margin-bottom: 1rem;
          }

          .track-step-container {
            flex-direction: column;
            width: auto;
            margin-right: 1rem;
            margin-bottom: 0;
          }

          .track-marker {
            width: 28px;
            height: 28px;
            margin-bottom: 0.5rem;
          }

          .track-connector {
            width: 3px;
            height: 40px;
            margin-left: 0;
            margin-top: -2px;
          }

          .track-label {
            text-align: left;
            flex: 1;
          }

          .track-step-name {
            font-size: 0.8rem;
          }

          .track-step-wrapper:last-child .track-connector {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .page-wrapper {
            padding: 0.5rem;
          }

          .sidebar-top {
            margin-bottom: 1rem;
          }

          .content-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .content-header h2 {
            font-size: 1.2rem;
          }
        }
      `}</style>
    </>
  );
}