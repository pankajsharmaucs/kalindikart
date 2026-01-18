'use client';

import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

// Helper to resolve image URL
const resolveImage = (img) => {
  if (!img) return '/placeholder.png';
  // Prepend slash if missing
  return img.startsWith('/') ? img : `/${img}`;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobile, setMobile] = useState(null);

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
        const safeData = (data || []).map(order => ({
          ...order,
          items: order.items || [],
        }));
        setOrders(safeData);
      } catch (error) {
        console.error(error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [mobile]);

  // Cancel order
  const handleCancelOrder = async order_number => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to cancel this order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, cancel it!',
      cancelButtonText: 'No',
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ order_number }),
        });

        const data = await res.json();
        if (res.ok) {
          Swal.fire('Cancelled!', 'Your order has been cancelled.', 'success');
          setOrders(prev =>
            prev.map(o =>
              o.order_number === order_number
                ? { ...o, order_status: 'cancelled', payment_status: 'failed' }
                : o
            )
          );
        } else {
          throw new Error(data.error || 'Failed to cancel order');
        }
      } catch (error) {
        Swal.fire('Error', error.message, 'error');
      }
    }
  };

  // Track order
  const handleTrackOrder = order => {
    Swal.fire({
      title: 'Tracking Info',
      html: `
        <p><strong>Tracking Number:</strong> ${order.tracking_number || 'N/A'}</p>
        <p><strong>Provider:</strong> ${order.shipping_provider || 'N/A'}</p>
        <p><strong>Shipped Date:</strong> ${order.shipped_date ? new Date(order.shipped_date).toLocaleString() : 'N/A'}</p>
        <p><strong>Delivered Date:</strong> ${order.delivered_date ? new Date(order.delivered_date).toLocaleString() : 'N/A'}</p>
      `,
      icon: 'info',
    });
  };

  if (loading)
    return (
      <p className="text-center mt-5">
        Loading <span className="spinner-border spinner-border-sm"></span>
      </p>
    );

  if (!mobile)
    return (
      <div className="text-center mt-5">
        <h3>Please login or provide your mobile to view your orders</h3>
      </div>
    );

  return (
    <div className="container my-5">
      <h2 className="mb-4">My Orders</h2>

      {orders.length === 0 && <p className="mt-3">You have no orders yet.</p>}

      {orders.map(order => {
        const totalAmount = Number(order.total_amount || 0);
        const showCancel = !order.tracking_number && !['cancelled', 'delivered'].includes(order.order_status);
        const showTrack = !!order.tracking_number;

        return (
          <div key={order.order_number} className="card mb-4 shadow-sm p-3">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div>
                <strong>Order #: </strong> {order.order_number} <br />
                <strong>Date: </strong>{' '}
                {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
              </div>
              <div>
                <strong>Total: </strong> ₹{totalAmount.toFixed(2)}
              </div>
            </div>

            {/* Items */}
            <div>
              {order.items.length > 0 ? (
                <div>
                  {order.items.map((item, idx) => {
                    const price = Number(item.price || 0);
                    const quantity = Number(item.quantity || 0);

                    // Use the image path directly
                    const imageUrl = item.image || '/placeholder.png';

                    return (
                      <div key={idx} className="d-flex align-items-center mb-2">
                        <img
                          src={resolveImage(imageUrl)}
                          className="rounded me-2"
                          style={{ width: 50, height: 50, objectFit: 'cover' }}
                        />
                        <div className="flex-grow-1">
                          <div>{item.product_name || 'Product'}</div>
                          <small>₹{price.toFixed(2)} x {quantity} = ₹{(price * quantity).toFixed(2)}</small>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p>No items found for this order.</p>
              )}
            </div>

            {/* Footer */}
            <div className="d-flex gap-2 mt-2">
              {showCancel && (
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleCancelOrder(order.order_number)}
                >
                  Cancel
                </button>
              )}

              {showTrack && (
                <button
                  className="btn btn-sm btn-info"
                  onClick={() => handleTrackOrder(order)}
                >
                  Track
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
