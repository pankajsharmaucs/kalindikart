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
import { formatDateTime } from '../../../../utils/Converter';

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
      if (['booked', 'placed'].includes(s)) acc.booked++;
      else if (s === 'shipped') acc.shipped++;
      else if (s === 'delivered') acc.delivered++;
      else if (['cancelled', 'failed'].includes(s)) acc.cancelled++;
      return acc;
    }, { all: 0, booked: 0, shipped: 0, delivered: 0, cancelled: 0 });

    return { uniqueOrders: sorted, orderCounts: counts };
  }, [orders]);

  const filteredOrders = uniqueOrders.filter(o => {
    const s = (o.order_status || '').toLowerCase();
    if (filter === 'all') return true;
    if (filter === 'booked') return ['booked', 'placed'].includes(s);
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


  const cancelOrder = async (orderNumber) => {
    try {
      const identifier = authUser?.mobile || authUser?.email;

      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_number: orderNumber,
          userId: identifier
        })
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: 'error',
          title: 'Cancel Failed',
          text: data.error || 'Unable to cancel the order',
          confirmButtonText: 'OK'
        });
        return;
      }

      Swal.fire({
        icon: 'success',
        title: 'Cancelled!',
        text: 'Order cancelled successfully',
        timer: 2000,
        showConfirmButton: false
      });

      // Refresh Orders in frontend
      setOrders(prev =>
        prev.map(o =>
          o.order_number === orderNumber
            ? { ...o, order_status: "cancelled" }
            : o
        )
      );

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Oops!',
        text: 'Something went wrong',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: brand.bg, minHeight: '100vh', paddingBottom: '80px' }}>

      {/* HEADER */}
      <div className="bg-white p-3 d-flex align-items-center shadow-sm sticky-top">
        <Link href="/user/dashboard" className="text-dark me-3">
          <FaChevronLeft />
        </Link>
        <h5 className="mb-0 fw-bold">My Orders</h5>
        <div className="ms-auto">
          <FaSearch color={brand.primary} />
        </div>
      </div>

      {/* FILTER CHIPS */}
      <div className="d-flex overflow-auto px-2 py-3 no-scrollbar bg-white border-bottom" style={{ gap: '8px' }}>
        {['all', 'booked', 'shipped', 'delivered', 'cancelled'].map(key => (

          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`btn btn-sm rounded-pill px-3 fw-bold text-capitalize flex-shrink-0 ${filter === key ? 'text-white' : 'text-muted border'}`}
            style={{ backgroundColor: filter === key ? brand.primary : 'transparent', fontSize: '0.75rem' }}
          >
            {key} ({orderCounts[key] || 0})
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

          filteredOrders.map(order => {

            const status = order.order_status?.toLowerCase()

            /* STATUS MAPPING */
            const displayStatus =
              status === "pending" || status === "processing"
                ? "booked"
                : status

            /* TRACKING STEPS */
            const isBooked = true
            const isShipped = status === "shipped" || status === "delivered"
            const isDelivered = status === "delivered"

            return (

              <div key={order.order_number} className="bg-white rounded mb-3 shadow-sm border overflow-hidden">

                {/* ORDER META */}
                <div className="p-3 border-bottom d-flex justify-content-between align-items-start">

                  <div>
                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                      #{order.order_number}
                    </div>

                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(order.created_at).toDateString()}
                    </div>
                  </div>

                  <span
                    className={`badge rounded-pill status-${displayStatus}`}
                    style={{ fontSize: '0.65rem', padding: '5px 10px' }}
                  >
                    {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
                  </span>

                </div>


                {/* ITEMS */}
                <div className="p-3">

                  {order.items.map((item, idx) => (

                    <div key={idx} className="d-flex align-items-center mb-2">

                      <img
                        src={`/assets/products/${item.product_id}/${item.image}`}
                        className="rounded border"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />

                      <div className="ms-3 flex-grow-1">

                        <div className="fw-bold text-truncate" style={{ fontSize: '14px', maxWidth: '180px' }}>
                          {item.product_name}
                        </div>

                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          Qty: {item.quantity} | ₹{item.price}
                        </div>

                      </div>

                    </div>

                  ))}

                </div>


                {/* ACTION BUTTONS */}

                <div className="p-2 border-top bg-light d-flex justify-content-between">

                  {order.shipping_tracking_id && (

                    <button
                      className="btn btn-track btn-sm me-1 fw-bold"
                      data-bs-toggle="modal"
                      data-bs-target={`#trackingModal-${order.order_number}`}
                    >
                      Track Order
                    </button>

                  )}

                  {status !== "shipped" && status !== "delivered" && status !== "cancelled" && (

                    <button
                      className="btn btn-cancel btn-sm fw-bold"
                      data-bs-toggle="modal"
                      data-bs-target={`#cancelModal-${order.order_number}`}
                    >
                      Cancel
                    </button>

                  )}

                </div>


                {/* TRACKING MODAL */}

                {/* <div className="modal fade" id={`trackingModal-${order.order_number}`} tabIndex="-1">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                      <div className="modal-header">
                        <h5 className="modal-title fw-bold">Order Tracking</h5>
                        <button className="btn-close" data-bs-dismiss="modal"></button>
                      </div>

                      <div className="modal-body text-center">

                        <ul className="tracking-steps">

                          <li className={isBooked ? "active" : ""}>
                            <span className="step-icon">✔</span>
                            <div>Order Booked</div>
                          </li>

                          <li className={isShipped ? "active" : ""}>
                            <span className="step-icon">🚚</span>
                            <div>Shipped</div>
                          </li>

                          <li className={isDelivered ? "active" : ""}>
                            <span className="step-icon">📦</span>
                            <div>Delivered</div>
                          </li>

                        </ul>

                      </div>
                    </div>
                  </div>
                </div> */}

                <div className="modal fade" id={`trackingModal-${order.order_number}`} tabIndex="-1">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                      <div className="modal-header">
                        <h5 className="modal-title fw-bold">Order Tracking</h5>
                        <button className="btn-close" data-bs-dismiss="modal"></button>
                      </div>

                      <div className="modal-body">

                        <ul className="tracking-vertical">

                          {/* BOOKED */}
                          <li className="active">
                            <div className="track-icon">✔</div>
                            <div className="track-content">
                              <div className="track-title">Order Booked</div>
                              <div className="track-date">
                                On {new Date(order.created_at).toDateString()}
                              </div>
                            </div>
                          </li>


                          {/* SHIPPED */}
                          <li className={order.shipped_date ? "active" : ""}>
                            <div className="track-icon">🚚</div>
                            <div className="track-content">
                              <div className="track-title">Shipped</div>

                              {order.shipped_date ? (
                                <div className="track-date">
                                  {formatDateTime(order.shipped_date)}
                                </div>
                              ) : (
                                <div className="track-pending">Pending</div>
                              )}

                            </div>
                          </li>


                          {/* DELIVERED */}
                          <li className={order.delivered_date ? "active" : ""}>
                            <div className="track-icon">📦</div>
                            <div className="track-content">
                              <div className="track-title">Delivered</div>

                              {order.delivered_date ? (
                                <div className="track-date">
                                  On {new Date(order.delivered_date).toDateString()}
                                </div>
                              ) : (
                                <div className="track-pending">Pending</div>
                              )}

                            </div>
                          </li>

                        </ul>

                      </div>
                    </div>
                  </div>
                </div>


                {/* CANCEL MODAL */}

                <div className="modal fade" id={`cancelModal-${order.order_number}`} tabIndex="-1">
                  <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">

                      <div className="modal-header">
                        <h5 className="modal-title fw-bold text-danger">Cancel Order</h5>
                        <button className="btn-close" data-bs-dismiss="modal"></button>
                      </div>

                      <div className="modal-body">

                        <label className="form-label fw-bold">Select Cancel Reason</label>

                        <select className="form-select mb-3">
                          <option>Ordered by mistake</option>
                          <option>Found cheaper elsewhere</option>
                          <option>Delivery time too long</option>
                          <option>Changed my mind</option>
                          <option>Other</option>
                        </select>

                        <button
                          className="btn btn-danger w-100"
                          onClick={() => cancelOrder(order.order_number)}
                          data-bs-dismiss="modal"
                        >
                          Confirm Cancel
                        </button>

                      </div>

                    </div>
                  </div>
                </div>

              </div>

            )

          })

        )}

      </div>


      {/* BOTTOM NAV */}

      <nav className="fixed-bottom bg-white border-top d-flex justify-content-around py-2 shadow-lg d-md-none">
        <BottomTab icon={<FaHome />} label="Home" link="/" />
        <BottomTab icon={<FaThLarge />} label="Explore" link="/explore" />
        <BottomTab icon={<FaUser />} label="Account" active color={brand.primary} link="/user/dashboard" />
        <BottomTab icon={<FaShoppingCart />} label="Cart" link="/cart" />
      </nav>


      <style jsx>{`

    .no-scrollbar::-webkit-scrollbar{display:none;}
    .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none;}

    .status-booked{background:#fff3cd;color:#856404}
    .status-shipped{background:#cce5ff;color:#004085}
    .status-delivered{background:#d4edda;color:#155724}
    .status-cancelled{background:#f8d7da;color:#721c24}

    .tracking-vertical{
      list-style:none;
      padding:0;
      margin:0;
      position:relative;
      }

      .tracking-vertical li{
      display:flex;
      align-items:flex-start;
      margin-bottom:25px;
      position:relative;
      }

      .tracking-vertical li::before{
      content:'';
      position:absolute;
      left:16px;
      top:35px;
      width:2px;
      height:100%;
      background:#eee;
      }

      .tracking-vertical li:last-child::before{
      display:none;
      }

      .track-icon{
      width:32px;
      height:32px;
      border-radius:50%;
      background:#ddd;
      display:flex;
      align-items:center;
      justify-content:center;
      font-size:14px;
      margin-right:12px;
      flex-shrink:0;
      }

      .tracking-vertical li.active .track-icon{
      background:#28a745;
      color:#fff;
      }

      .track-title{
      font-weight:600;
      font-size:14px;
      }

      .track-date{
      font-size:12px;
      color:#777;
      }

      .track-pending{
      font-size:12px;
      color:#bbb;
      }

    /* TRACKING */

    .tracking-steps{
    display:flex;
    justify-content:space-between;
    list-style:none;
    padding:0;
    margin-top:20px;
    }

    .tracking-steps li{
    flex:1;
    text-align:center;
    position:relative;
    color:#bbb;
    font-size:12px;
    }

    .tracking-steps li::after{
    content:'';
    position:absolute;
    top:15px;
    left:0;
    width:100%;
    height:3px;
    background:#eee;
    z-index:-1;
    }

    .tracking-steps li:last-child::after{
    display:none;
    }

    .tracking-steps li.active{
    color:#28a745;
    font-weight:600;
    }

    .step-icon{
    display:inline-block;
    width:35px;
    height:35px;
    line-height:35px;
    border-radius:50%;
    background:#eee;
    margin-bottom:6px;
    }

    .tracking-steps li.active .step-icon{
    background:#28a745;
    color:#fff;
    }

    @media (min-width:768px){
    .container-fluid{max-width:850px;margin:0 auto;}
    }

`}</style>

    </div>
  )

}

function BottomTab({ icon, label, active, color, link = "#" }) {
  return (
    <Link href={link} className="text-decoration-none text-center" style={{ flex: 1, color: active ? color : '#888' }}>
      <div style={{ fontSize: '1.1rem' }}>{icon}</div>
      <div style={{ fontSize: '0.6rem', marginTop: '2px', fontWeight: active ? '600' : '400' }}>{label}</div>
    </Link>
  );
}