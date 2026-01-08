'use client';

import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function UserDashboardPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch number of orders from your API
      fetch(`/api/user/orders/count?user_id=${user?.id}`)
        .then((res) => res.json())
        .then((data) => setOrdersCount(data.count || 0))
        .catch(() => setOrdersCount(0));
    }
  }, [isLoggedIn, user]);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  if (!isLoggedIn)
    return (
      <div className="text-center mt-5">
        <h3>Please login to view your dashboard</h3>
        <Link href="/login" className="btn btn-primary mt-3">
          Login
        </Link>
      </div>
    );

  return (
    <div className="container my-5">
      <h2>Welcome, {user?.name || user?.email}!</h2>
      <p className="text-muted">Here is a quick overview of your account.</p>

      <div className="row mt-4">
        <div className="col-md-4">
          <div className="card shadow-sm p-4 text-center">
            <h5>Total Orders</h5>
            <p className="display-6">{ordersCount}</p>
            <Link href="/user/dashboard/my-orders" className="btn btn-outline-primary mt-2">
              View Orders
            </Link>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm p-4 text-center">
            <h5>My Profile</h5>
            <p>{user?.name}</p>
            <p>{user?.email}</p>
            <Link href="/user/profile" className="btn btn-outline-primary mt-2">
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card shadow-sm p-4 text-center">
            <h5>Cart Items</h5>
            <p className="display-6">{/* Add cartItems.length here if needed */}</p>
            <Link href="/cart" className="btn btn-outline-primary mt-2">
              Go to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
