'use client';

import { useAuth } from '../../../../context/AuthContext';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Swal from 'sweetalert2';
import {
  FaBox, FaChevronLeft, FaChevronRight, FaHome,
  FaThLarge, FaUser, FaShoppingCart, FaSearch
} from 'react-icons/fa';
import './order.css'; // Use the CSS provided earlier

export default function MyOrdersPage() {
  const { user: authUser, isLoggedIn, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [filter, setFilter] = useState('all');

  const brand = {
    primary: '#01A9E6',
    dark: '#00739D',
    bg: '#f1f3f6'
  };


  // 1. Fetch Orders Logic (Updated for Reliability)
  useEffect(() => {
    const fetchOrders = async () => {
      // Wait until Auth finishes loading
      if (authLoading) return;

      // Only fetch if logged in and we have an ID
      if (isLoggedIn && (authUser?.mobile || authUser?.email)) {
        setFetching(true);
        try {
          const params = new URLSearchParams();
          if (authUser.mobile) params.append('userId', authUser.mobile);
          if (authUser.email) params.append('userId', authUser.email);

          console.log("Fetching orders for:", params.toString()); // Debugging log

          const res = await fetch(`/api/orders?${params.toString()}`);

          if (!res.ok) throw new Error('Failed to fetch orders');

          const data = await res.json();

          // console.log(data[0].items[0]['image']);
          
          setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Fetch Error:", err);
          setOrders([]);
        } finally {
          setFetching(false);
        }
      } else {
        // Not logged in or no ID found
        setFetching(false);
      }
    };

    fetchOrders();
  }, [isLoggedIn, authUser?.mobile, authUser?.email, authLoading]);
  // Watch specific properties to prevent unnecessary re-runs

  // 2. Grouping & Counting Logic
  const { uniqueOrders, orderCounts } = useMemo(() => {
    const grouped = orders.reduce((acc, order) => {
      const num = order.order_number;
      if (!acc[num]) {
        acc[num] = { ...order, items: Array.isArray(order.items) ? [...order.items] : [] };
      } else if (Array.isArray(order.items)) {
        order.items.forEach(item => {
          if (!acc[num].items.find(i => i.product_id === item.product_id)) acc[num].items.push(item);
        });
      }
      return acc;
    }, {});

    const sorted = Object.values(grouped).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const counts = sorted.reduce((acc, o) => {
      const s = (o.order_status || '').toLowerCase();
      acc.all++;
      if (['pending', 'placed'].includes(s)) acc.pending++;
      else if (['processing', 'confirmed', 'packed'].includes(s)) acc.processing++;
      else if (s === 'shipped') acc.shipped++;
      else if (s === 'delivered') acc.delivered++;
      else if (['cancelled', 'failed'].includes(s)) acc.cancelled++;
      return acc;
    }, { all: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 });

    return { uniqueOrders: sorted, orderCounts: counts };
  }, [orders]);

  const filteredOrders = uniqueOrders.filter(o => {
    const s = (o.order_status || '').toLowerCase();
    if (filter === 'all') return true;
    if (filter === 'pending') return ['pending', 'placed'].includes(s);
    if (filter === 'processing') return ['processing', 'confirmed', 'packed'].includes(s);
    if (filter === 'cancelled') return ['cancelled', 'failed'].includes(s);
    return s === filter;
  });

  // 3. Skeleton Loader (Matches your Dashboard style)
  if (authLoading || fetching) {
    return (
      <div className="dashboard-wrapper animate-pulse" style={{ backgroundColor: brand.bg, minHeight: '100vh' }}>
        <div className="bg-white p-3 border-bottom d-flex align-items-center">
          <div className="rounded bg-light" style={{ width: '30px', height: '30px' }}></div>
          <div className="ms-3 w-50 bg-light rounded" style={{ height: '25px' }}></div>
        </div>
        <div className="container-fluid px-2 mt-3">
          {[1, 2, 3].map(i => <div key={i} className="bg-white rounded mb-3" style={{ height: '150px', border: '1px solid #eee' }}></div>)}
        </div>
      </div>
    );
  }

  
  const resolveImage = (images) => {
    if (!images) return '/placeholder.png';
    let img = images;

    if (typeof img === 'string') {
      try {
        const parsed = JSON.parse(img);
        if (Array.isArray(parsed)) img = parsed[0];
      } catch { }
    }

    if (Array.isArray(img)) img = img[0];
    if (typeof img !== 'string') return '/placeholder.png';
    if (img.startsWith('http')) return img;
    if (!img.startsWith('/')) return `/${img}`;
    return img;
  };
  
  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: brand.bg, minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER: Matches Dashboard but with Back Button */}
      <div className="bg-white p-3 d-flex align-items-center shadow-sm sticky-top">
        <Link href="/user/dashboard" className="text-dark me-3">
          <FaChevronLeft />
        </Link>
        <h5 className="mb-0 fw-bold">My Orders</h5>
        <div className="ms-auto">
          <FaSearch color={brand.primary} />
        </div>
      </div>

      {/* HORIZONTAL FILTER CHIPS (Mobile Friendly) */}
      <div className="d-flex overflow-auto px-2 py-3 no-scrollbar bg-white border-bottom" style={{ gap: '8px' }}>
        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(key => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn btn-sm rounded-pill px-3 fw-bold text-capitalize flex-shrink-0 ${filter === key ? 'text-white' : 'text-muted border'}`}
            style={{ backgroundColor: filter === key ? brand.primary : 'transparent', fontSize: '0.75rem' }}
          >
            {key} ({orderCounts[key]})
          </button>
        ))}
      </div>

      <div className="container-fluid px-2 mt-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-5 bg-white rounded shadow-sm border">
            <FaBox size={40} color="#ddd" className="mb-3" />
            <h6 className="text-muted">No {filter !== 'all' ? filter : ''} orders found</h6>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div key={order.order_number} className="bg-white rounded mb-3 shadow-sm border overflow-hidden">
              {/* Order Meta */}
              <div className="p-3 border-bottom d-flex justify-content-between align-items-start">
                <div>
                  <div className="fw-bold" style={{ fontSize: '0.9rem' }}>Order #{order.order_number}</div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>{new Date(order.created_at).toDateString()}</div>
                </div>
                <span className={`badge rounded-pill status-${order.order_status?.toLowerCase()}`}
                  style={{ fontSize: '0.65rem', padding: '5px 10px' }}>
                  {order.order_status}
                </span>
              </div>

              {/* Items List */}
              <div className="p-3">
                {order.items.map((item, idx) => (
                  <div key={idx} className="d-flex align-items-center mb-2">
                    <img
                      src={`/assets/products/${item.product_id}/${item.image}`}
                      alt=""
                      className="rounded border"
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                    <div className="ms-3 flex-grow-1">
                      <div className="fw-bold text-truncate" style={{ fontSize: '0.85rem', maxWidth: '180px' }}>{item.product_name}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>Qty: {item.quantity} | ₹{item.price}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="p-2 border-top bg-light d-flex gap-2">
                <button
                  className="btn btn-sm w-100 fw-bold border bg-white"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => {/* Trigger tracking modal */ }}
                >
                  Track Order
                </button>
                <Link
                  href={`/user/dashboard/my-orders/${order.order_number}`}
                  className="btn btn-sm w-100 fw-bold text-white"
                  style={{ fontSize: '0.8rem', backgroundColor: brand.primary }}
                >
                  Details
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      {/* BOTTOM NAVIGATION (Consistent with Dashboard) */}
      <nav className="fixed-bottom bg-white border-top d-flex justify-content-around py-2 shadow-lg d-md-none">
        <BottomTab icon={<FaHome />} label="Home" link="/" />
        <BottomTab icon={<FaThLarge />} label="Explore" link="/explore" />
        <BottomTab icon={<FaUser />} label="Account" active color={brand.primary} link="/user/dashboard" />
        <BottomTab icon={<FaShoppingCart />} label="Cart" link="/cart" />
      </nav>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .status-placed, .status-pending { background: #fff3cd; color: #856404; }
        .status-shipped, .status-processing { background: #cce5ff; color: #004085; }
        .status-delivered { background: #d4edda; color: #155724; }
        .status-cancelled { background: #f8d7da; color: #721c24; }
        @media (min-width: 768px) { .container-fluid { max-width: 550px; margin: 0 auto; } }
      `}</style>
    </div>
  );
}

function BottomTab({ icon, label, active, color, link = "#" }) {
  return (
    <Link href={link} className="text-decoration-none text-center" style={{ flex: 1, color: active ? color : '#888' }}>
      <div style={{ fontSize: '1.1rem' }}>{icon}</div>
      <div style={{ fontSize: '0.6rem', marginTop: '2px', fontWeight: active ? '600' : '400' }}>{label}</div>
    </Link>
  );
}