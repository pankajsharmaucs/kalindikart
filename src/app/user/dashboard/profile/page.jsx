'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../../stores/cartStore';

export default function ProfilePage() {
  const router = useRouter();

  const { isLoggedIn, userId, hasHydrated } = useCartStore();

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Address
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');

  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');       // ID
  const [state, setState] = useState('');     // ID
  const [cityName, setCityName] = useState('');   // DISPLAY
  const [stateName, setStateName] = useState(''); // DISPLAY

  const [lastFetchedPin, setLastFetchedPin] = useState('');

  const [landmark, setLandmark] = useState('');

  /* ---------------- AUTH ---------------- */
  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoggedIn || !userId) {
      router.replace('/');
      return;
    }

    fetchUserDetails();
  }, [hasHydrated, isLoggedIn, userId]);

  /* ---------------- FETCH USER ---------------- */
  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/user/by-mobile?identifier=${userId}`);
      const data = await res.json();

      if (data.exists) {
        const u = data.user;

        setFullname(u.fullname || '');
        setEmail(u.email || '');
        setMobile(u.mobile || '');
        setLine1(u.address_line1 || '');
        setLine2(u.address_line2 || '');
        setLine3(u.address_line3 || '');

        setCity(u.city_id || '');
        setState(u.state_id || '');
        setCityName(u.city || '');
        setStateName(u.state || '');

        setPincode(u.pincode || '');
        setLandmark(u.landmark || '');
        setLastFetchedPin(u.pincode || '');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PINCODE AUTO FETCH ---------------- */
  const fetchLocationFromPincode = async (pin) => {
    try {
      const res = await fetch(`/api/master/pincode?pincode=${pin}`);
      const data = await res.json();

      if (data.success) {
        setCity(data.data.city_id);             // ✅ ID
        setState(data.data.state_id);           // ✅ ID
        setCityName(data.data.city_name);       // ✅ FIXED
        setStateName(data.data.state_name);     // ✅ FIXED
      }
    } catch (err) {
      console.error("Pincode fetch error:", err);
    }
  };

  /* ---------------- VALIDATION ---------------- */
  const validateAddress = () => {
    if (!fullname || !line1 || !pincode || !city || !state) {
      setError('Please fill all required fields');
      setTimeout(() => setError(''), 3000);
      return false;
    }
    return true;
  };

  /* ---------------- SAVE ---------------- */
  const handleSave = async () => {
    if (!validateAddress()) return;

    setSaveLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullname,
          email,
          mobile,
          line1,
          line2,
          line3,
          city,
          state,
          pincode,
          landmark,
          userId
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to update profile');
        return;
      }

      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);

    } catch {
      setError('Something went wrong');
    } finally {
      setSaveLoading(false);
    }
  };

  /* ---------------- LOADING ---------------- */
  if (!hasHydrated || loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary"></div>
        <p className="text-muted mt-2 small">Loading profile...</p>
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="profile-wrapper">
        <div className="container py-3">
          <div className="profile-card">
            <div className="profile-header">
              <i className="fas fa-user me-2"></i>
              My Profile
            </div>

            <div className="profile-body">
              <div className="row g-2">

                <div className="col-12">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" value={fullname} onChange={(e) => setFullname(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Mobile</label>
                  <input className="form-input disabled" value={mobile} disabled />
                </div>

                <div className="col-12">
                  <label className="form-label">Address Line 1 *</label>
                  <input className="form-input" value={line1} onChange={(e) => setLine1(e.target.value)} />
                </div>

                <div className="col-12">
                  <label className="form-label">Address Line 2</label>
                  <input className="form-input" value={line2} onChange={(e) => setLine2(e.target.value)} />
                </div>

                <div className="col-12">
                  <label className="form-label">Address Line 3</label>
                  <input className="form-input" value={line3} onChange={(e) => setLine3(e.target.value)} />
                </div>

                {/* PINCODE */}
                <div className="col-md-6">
                  <label className="form-label">Pincode *</label>
                  <input
                    className="form-input"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setPincode(val);

                      if (val.length === 6) {
                        fetchLocationFromPincode(val); // ✅ trigger only at 6 digits
                      }
                    }}
                  />
                </div>

                {/* AUTO FILLED CITY */}
                <div className="col-md-6">
                  <label className="form-label">City</label>
                  <input className="form-input" value={cityName} readOnly />
                </div>

                {/* AUTO FILLED STATE */}
                <div className="col-md-6">
                  <label className="form-label">State</label>
                  <input className="form-input" value={stateName} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Landmark</label>
                  <input className="form-input" value={landmark} onChange={(e) => setLandmark(e.target.value)} />
                </div>

              </div>

              {error && <div className="alert-msg error-msg">{error}</div>}
              {success && <div className="alert-msg success-msg">{success}</div>}

              <button className="btn-save" onClick={handleSave} disabled={saveLoading}>
                {saveLoading ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .profile-wrapper { background: #f8f9fa; min-height: 100vh; }
        .profile-card { background: white; max-width: 700px; margin: 0 auto; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
        .profile-header { padding: .8rem 1rem; font-weight: 700; border-bottom: 1px solid #e0e0e0; background: #f8f9fa; }
        .profile-body { padding: 1rem; }
        .form-label { font-weight: 600; font-size: .85rem; }
        .form-input { width: 100%; padding: .6rem; border: 1px solid #ddd; border-radius: 5px; }
        .btn-save { margin-top: 1rem; width: 100%; background: linear-gradient(135deg,#178ad6,#27bbc9); color: white; border: none; padding: .7rem; border-radius: 6px; }
        .alert-msg { margin-top: .75rem; padding: .6rem; border-radius: 5px; font-size: .85rem; }
        .error-msg { background: rgba(220,53,69,.1); color: #dc3545; }
        .success-msg { background: rgba(40,167,69,.1); color: #28a745; }
      `}</style>
    </>
  );
}