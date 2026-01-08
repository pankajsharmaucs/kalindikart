'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobile, setMobile] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedMobile = localStorage.getItem('userMobile');
    const storedUserId = localStorage.getItem('userId');

    if (storedMobile) setMobile(storedMobile);
    if (storedUserId) setUserId(storedUserId);

    setIsLoggedIn(!!storedMobile || !!storedUserId);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const params = new URLSearchParams();
        if (userId) params.append('user_id', userId);
        else if (mobile) params.append('mobile', mobile);

        const res = await fetch(`/api/orders?${params.toString()}`);
        const data = await res.json();
        setOrders(data || []);
      } catch (error) {
        console.error(error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, mobile, userId]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  if (!isLoggedIn)
    return (
      <div className="text-center mt-5">
        <h3>Please login or provide your mobile to view your orders</h3>
        <Link href="/login" className="btn btn-primary mt-3">Login</Link>
      </div>
    );

  return (
    <div className="container my-5">
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p className="mt-3">You have no orders yet.</p>
      ) : (
        <div className="table-responsive mt-3">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>Order Number</th>
                <th>Date</th>
                <th>Total</th>
                <th>Payment Status</th>
                <th>Order Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>₹{order.total_amount.toFixed(2)}</td>
                  <td>{order.payment_status}</td>
                  <td>{order.order_status}</td>
                  <td>
                    <Link
                      href={`/user/dashboard/order/${order.id}`}
                      className="btn btn-sm btn-primary"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
