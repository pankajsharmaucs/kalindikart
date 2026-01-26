'use client';

import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  FaShoppingBag,
  FaUserCircle,
  FaShoppingCart,
} from 'react-icons/fa';

export default function UserDashboardPage() {
  const { user, isLoggedIn, loading } = useAuth();
  const [ordersCount, setOrdersCount] = useState(0);

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      fetch(`/api/user/orders/count?user_id=${user.id}`)
        .then((res) => res.json())
        .then((data) => setOrdersCount(data.count || 0))
        .catch(() => setOrdersCount(0));
    }
  }, [isLoggedIn, user]);

  if (loading) {
    return <p className="text-center mt-5">Loading...</p>;
  }

  if (!isLoggedIn) {
    return (
      <div className="text-center mt-5">
        <h3>Please login to view your dashboard</h3>
        <Link href="/login" className="btn btn-primary-gold mt-3">
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      {/* Header */}
      <div className="dashboard-header mb-4">
        <h2 className="fw-bold">Welcome, {user?.name || user?.email}</h2>
        <p className="text-muted">Manage your orders & profile</p>
      </div>

      {/* Cards */}
      <div className="row g-4">

        {/* Orders */}
        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card gradient-blue h-100 d-flex flex-column">
            <div className="dashboard-icon">
              <FaShoppingBag />
            </div>

            <h5>Total Orders</h5>
            <div className="card-number">{ordersCount}</div>

            <Link
              href="/user/dashboard/my-orders"
              className="card-link"
            >
              View Orders →
            </Link>
          </div>
        </div>

        {/* Profile */}
        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card gradient-light h-100 d-flex flex-column">
            <div className="dashboard-icon">
              <FaUserCircle />
            </div>

            <h5>My Profile</h5>
            <p className="small text-muted text-center">
              Update your personal information
            </p>

            <Link href="/user/profile" className="card-link">
              Edit Profile →
            </Link>
          </div>
        </div>

        {/* Cart */}
        <div className="col-lg-4 col-md-6">
          <div className="dashboard-card gradient-dark h-100 d-flex flex-column">
            <div className="dashboard-icon">
              <FaShoppingCart />
            </div>

            <h5>My Cart</h5>
            <p className="small text-muted text-center">
              Continue shopping & checkout
            </p>

            <Link href="/cart" className="card-link">
              Go to Cart →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
