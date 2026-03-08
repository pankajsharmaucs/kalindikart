'use client';

import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalBookedOrders: 0,
    totalUsers: 0
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // 1️⃣ Fetch total orders count
        const ordersCountRes = await fetch('/api/orders/total');
        const ordersCountData = await ordersCountRes.json();

        // 2️⃣ Fetch products
        const productsRes = await fetch('/api/products');
        const productsData = await productsRes.json();

        // 3️⃣ Fetch total users
        const usersRes = await fetch('/api/user/total');
        const usersData = await usersRes.json();

        console.log(ordersCountData);
        

        // Compute booked orders
        const bookedOrders = Array.isArray(ordersCountData)
          ? ordersCountData.filter(o => o.order_status === 'booked' || o.order_status === 'pending')
          : [];

        // Set stats
        setStats({
          totalOrders: ordersCountData.length || 0, 
          totalProducts: Array.isArray(productsData) ? productsData.length : 0,
          totalBookedOrders: bookedOrders.length,
          totalUsers: usersData.length || 0
        });

        // Take the 5 most recent orders for table
        setRecentOrders(Array.isArray(ordersCountData) ? ordersCountData.slice(0, 5) : []);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="spinner-border text-primary" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );

  return (
    <div className="container-fluid p-4">
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold">Admin Dashboard</h2>
        <p className="text-muted mb-4">Overview of your store</p>
      </div>

      {/* Stats Cards */}
      <div className="row g-4">
        <div className="col-md-6 col-lg-3">
          <div className="card dashboard-card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="icon bg-primary text-white">📦</div>
              <div className="ms-3">
                <h6 className="text-muted mb-1">Total Orders</h6>
                <h3 className="fw-bold mb-0">{stats.totalOrders}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card dashboard-card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="icon bg-success text-white">🛍️</div>
              <div className="ms-3">
                <h6 className="text-muted mb-1">Total Products</h6>
                <h3 className="fw-bold mb-0">{stats.totalProducts}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card dashboard-card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="icon bg-warning text-white">📋</div>
              <div className="ms-3">
                <h6 className="text-muted mb-1">Booked Orders</h6>
                <h3 className="fw-bold mb-0">{stats.totalBookedOrders}</h3>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6 col-lg-3">
          <div className="card dashboard-card shadow-sm border-0">
            <div className="card-body d-flex align-items-center">
              <div className="icon bg-danger text-white">👤</div>
              <div className="ms-3">
                <h6 className="text-muted mb-1">Total Users</h6>
                <h3 className="fw-bold mb-0">{stats.totalUsers}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card shadow-sm border-0 mt-5">
        <div className="card-header bg-white">
          <h5 className="mb-0">Recent Orders</h5>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center">No recent orders</td>
                </tr>
              ) : recentOrders.map((order, idx) => (
                <tr key={order.order_number || idx}>
                  <td>{idx + 1}</td>
                  <td>{order.fullname || order.fullname || "N/A"}</td>
                  <td>{order.title}</td>
                  <td>
                    <span className={`badge ${order.order_status === 'completed' ? 'bg-success' :
                        order.order_status === 'cancelled' ? 'bg-danger' : 'bg-warning'
                      }`}>
                      {order.order_status}
                    </span>
                  </td>
                  <td>₹{order.total_amount}</td>
                  <td>{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        .dashboard-card {
          border-radius: 12px;
          transition: all 0.25s ease;
        }
        .dashboard-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
        }
        .icon {
          width: 55px;
          height: 55px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
      `}</style>
    </div>
  );
}