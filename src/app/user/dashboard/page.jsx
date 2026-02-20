'use client';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  FaBox, FaHouseUser, FaUserAlt, FaTicketAlt, FaHeadset, FaChevronRight, 
  FaWallet, FaHandHoldingUsd, FaHome, FaThLarge, FaUser, FaShoppingCart, FaPlus 
} from 'react-icons/fa';

export default function UserDashboardPage() {
  const { user: authUser, isLoggedIn, loading: authLoading } = useAuth();
  const [userData, setUserData] = useState(null);
  const [fetching, setFetching] = useState(true);

  const brand = {
    primary: '#01A9E6',
    dark: '#00739D',
    bg: '#f1f3f6'
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (isLoggedIn && authUser?.mobile) {
        try {
          const res = await fetch(`/api/user/by-mobile?mobile=${authUser.mobile}`);
          const data = await res.json();
          if (data.exists) setUserData(data.user);
        } catch (err) {
          console.error("API Error:", err);
        } finally {
          setFetching(false);
        }
      } else if (!authLoading) {
        setFetching(false);
      }
    };
    fetchUserDetails();
  }, [isLoggedIn, authUser, authLoading]);

  // --- SKELETON LOADER (Professional Ghost State) ---
  const Skeleton = () => (
    <div className="dashboard-wrapper animate-pulse" style={{ backgroundColor: brand.bg, minHeight: '100vh' }}>
      <div className="bg-white p-3 d-flex justify-content-between border-bottom">
        <div className="w-50 bg-light rounded" style={{height: '50px'}}></div>
        <div className="rounded-pill bg-light" style={{width: '50px', height: '30px'}}></div>
      </div>
      <div className="p-3 bg-light opacity-50" style={{height: '40px'}}></div>
      <div className="container-fluid px-2 mt-3">
        <div className="row g-2">
          {[1, 2, 3, 4].map(i => <div key={i} className="col-6"><div className="bg-white rounded" style={{height: '60px', border: '1px solid #eee'}}></div></div>)}
        </div>
        <div className="bg-white rounded mt-3" style={{height: '100px', border: '1px solid #eee'}}></div>
        <div className="bg-white rounded mt-3" style={{height: '120px', border: '1px solid #eee'}}></div>
      </div>
    </div>
  );

  if (authLoading || fetching) return <Skeleton />;

  if (!isLoggedIn) {
    return (
      <div className="container text-center vh-100 d-flex flex-column justify-content-center align-items-center">
        <h3 className="fw-bold">Welcome to Kalindikart</h3>
        <p className="text-muted">Please login to access your account details.</p>
        <Link href="/login" className="btn btn-lg text-white px-5 shadow-sm" style={{ backgroundColor: brand.primary }}>
          Login
        </Link>
      </div>
    );
  }

  // --- LOGIC FOR FORMATTING ADDRESS ---
  const formatAddress = () => {
    if (!userData) return null;

    const parts = [
      userData.address_line1,
      userData.address_line2,
      userData.address_line3,
      userData.landmark,
      userData.pincode ? `PIN: ${userData.pincode}` : null
    ].filter(part => part && part.toString().trim() !== '');

    return parts.length > 0 ? parts.join(', ') : null;
  };

  const currentAddress = formatAddress();

  return (
    <div className="dashboard-wrapper" style={{ backgroundColor: brand.bg, minHeight: '100vh', paddingBottom: '80px' }}>
      
      {/* 1. Profile Header */}
      <div className="bg-white p-3 d-flex align-items-center justify-content-between shadow-sm">
        <div>
          <h5 className="mb-0 fw-bold text-capitalize">{userData?.fullname || 'Kalindi Member'}</h5>
          <div className="d-flex align-items-center mt-1">
            <span className="badge" style={{ backgroundColor: '#E1F5FE', color: brand.dark, fontSize: '0.75rem' }}>
              ✦ Kalindikart Plus Member
            </span>
          </div>
          <div className="mt-1 text-muted" style={{ fontSize: '0.8rem' }}>
            {userData?.mobile || authUser?.mobile} <FaChevronRight size={8} />
          </div>
        </div>
        <div className="d-flex align-items-center px-2 py-1 border rounded-pill bg-white shadow-sm">
           <span className="me-1">⚡</span>
           <span className="fw-bold">3</span>
        </div>
      </div>

      {/* 2. Promo Banner */}
      <div className="px-3 py-2 text-white d-flex justify-content-between align-items-center shadow-sm" 
           style={{ background: `linear-gradient(90deg, ${brand.dark}, ${brand.primary})`, fontSize: '0.85rem' }}>
        <span>Explore <span className="fw-bold">Kalindikart Premium</span> benefits</span>
        <FaChevronRight size={10} />
      </div>

      <div className="container-fluid px-2 mt-3">
        
        {/* 3. Grid Quick Links */}
        <div className="row g-2 mb-3">
          <QuickLink icon={<FaBox color={brand.primary} />} label="Orders" link="/user/dashboard/my-orders" />
          <QuickLink icon={<FaUserAlt color={brand.primary} />} label="Profile" link="/user/dashboard/profile" />
          <QuickLink icon={<FaHouseUser color={brand.primary} />} label="Address" link="/user/dashboard/address" />
          <QuickLink icon={<FaHeadset color={brand.primary} />} label="Support" link="/help" />
        </div>

        {/* 4. ADDRESS SECTION (Dynamic) */}
        <div className="bg-white rounded mb-3 shadow-sm overflow-hidden border">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center bg-white">
            <h6 className="fw-bold mb-0" style={{fontSize: '0.95rem'}}>Delivery Address</h6>
            <Link href="/user/dashboard/address" className="text-decoration-none small fw-bold" style={{color: brand.primary}}>
              {currentAddress ? 'Change' : 'Add New'}
            </Link>
          </div>
          <div className="p-3" style={{ background: '#fafafa' }}>
            {currentAddress ? (
              <p className="small text-dark mb-0 lh-base">{currentAddress}</p>
            ) : (
              <div className="py-2 text-center">
                 <p className="small text-muted mb-2">No address added yet</p>
                 <Link href="/user/dashboard/address" className="btn btn-sm btn-outline-info rounded-pill px-3" style={{fontSize: '0.75rem'}}>
                   <FaPlus className="me-1" /> Add Address
                 </Link>
              </div>
            )}
          </div>
        </div>

        {/* 5. Finance Section */}
        <div className="bg-white rounded shadow-sm border overflow-hidden mb-3">
          <div className="p-3 border-bottom bg-white">
            <h6 className="fw-bold mb-0" style={{fontSize: '0.95rem'}}>Kalindikart Finance</h6>
          </div>
          <FinanceItem icon={<FaHandHoldingUsd color={brand.primary} />} title="Pre-approved Loan" subtitle="Check instant credit limit" />
          <FinanceItem icon={<FaWallet color="#2ecc71" />} title="Kalindi Wallet" subtitle="Balance: ₹0.00" />
        </div>
      </div>

      {/* 6. Mobile Bottom Navigation */}
      <nav className="fixed-bottom bg-white border-top d-flex justify-content-around py-2 shadow-lg d-md-none">
        <BottomTab icon={<FaHome />} label="Home" />
        <BottomTab icon={<FaThLarge />} label="Explore" />
        <BottomTab icon={<FaUser />} label="Account" active color={brand.primary} />
        <BottomTab icon={<FaShoppingCart />} label="Cart" />
      </nav>

      <style jsx>{`
        .animate-pulse { animation: pulse 1.8s ease-in-out infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        @media (min-width: 768px) { .container-fluid { max-width: 550px; margin: 0 auto; } }
      `}</style>
    </div>
  );
}

// --- Sub-Components ---
function QuickLink({ icon, label, link }) {
  return (
    <div className="col-6">
      <Link href={link} className="text-decoration-none">
        <div className="bg-white p-3 d-flex align-items-center border rounded shadow-sm">
          <span style={{ fontSize: '1.2rem' }}>{icon}</span>
          <span className="ms-3 fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{label}</span>
        </div>
      </Link>
    </div>
  );
}

function FinanceItem({ icon, title, subtitle }) {
  return (
    <div className="d-flex align-items-center p-3 border-bottom bg-white">
      <div className="fs-4 me-3">{icon}</div>
      <div className="flex-grow-1">
        <div className="fw-bold text-dark" style={{fontSize: '0.9rem'}}>{title}</div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{subtitle}</div>
      </div>
      <FaChevronRight size={10} color="#ddd" />
    </div>
  );
}

function BottomTab({ icon, label, active, color }) {
  return (
    <div className="text-center" style={{ flex: 1, color: active ? color : '#888' }}>
      <div style={{ fontSize: '1.1rem' }}>{icon}</div>
      <div style={{ fontSize: '0.6rem', marginTop: '2px', fontWeight: active ? '600' : '400' }}>{label}</div>
    </div>
  );
}