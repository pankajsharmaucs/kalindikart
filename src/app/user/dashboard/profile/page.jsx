'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../../../stores/cartStore';

export default function ProfilePage() {
  const router = useRouter();

  /* ---------------- ZUSTAND ---------------- */
  const { isLoggedIn, userId, hasHydrated } = useCartStore();

  /* ---------------- STATE ---------------- */
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Address fields
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [line3, setLine3] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');

  /* ---------------- AUTH GUARD (HOME REDIRECT) ---------------- */
  useEffect(() => {
    if (!hasHydrated) return;

    if (!isLoggedIn || !userId) {
      router.replace('/');
      return;
    }

    fetchUserDetails();
  }, [hasHydrated, isLoggedIn, userId]);

  /* ---------------- FETCH USER (DB) ---------------- */
  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`/api/user/by-mobile?mobile=${userId}`);
      const data = await res.json();

      if (data.exists) {
        const u = data.user;
        setFullname(u.fullname || '');
        setEmail(u.email || '');
        setMobile(u.mobile || '');
        setLine1(u.address_line1 || '');
        setLine2(u.address_line2 || '');
        setLine3(u.address_line3 || '');
        setPincode(u.pincode || '');
        setLandmark(u.landmark || '');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- VALIDATION ---------------- */
  const validateAddress = () => {
    if (!fullname || !mobile || !line1 || !pincode) {
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
          pincode,
          landmark,
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
                  <label className="form-label">
                    Full Name <span className="req">*</span>
                  </label>
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
                  <label className="form-label">
                    Address Line 1 <span className="req">*</span>
                  </label>
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

                <div className="col-md-6">
                  <label className="form-label">
                    Pincode <span className="req">*</span>
                  </label>
                  <input
                    className="form-input"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                  />
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

      {/* CSS unchanged */}
      <style jsx global>{`
        .profile-wrapper { background: #f8f9fa; min-height: 100vh; }
        .profile-card { background: white; max-width: 700px; margin: 0 auto; border-radius: 6px; box-shadow: 0 1px 4px rgba(0,0,0,.08); }
        .profile-header { padding: .8rem 1rem; font-weight: 700; border-bottom: 1px solid #e0e0e0; background: #f8f9fa; }
        .profile-body { padding: 1rem; }
        .form-label { font-weight: 600; font-size: .85rem; margin-bottom: .35rem; display: block; }
        .form-input { width: 100%; padding: .6rem .75rem; border: 1px solid #e0e0e0; border-radius: 5px; }
        .form-input.disabled { background: #f1f1f1; }
        .btn-save { margin-top: 1rem; width: 100%; background: linear-gradient(135deg,#178ad6,#27bbc9); color: white; border: none; padding: .7rem; font-weight: 700; border-radius: 6px; }
        .alert-msg { margin-top: .75rem; padding: .6rem; border-radius: 5px; font-size: .85rem; }
        .error-msg { background: rgba(220,53,69,.1); color: #dc3545; }
        .success-msg { background: rgba(40,167,69,.1); color: #28a745; }
        .req { color: #dc3545; }
      `}</style>
    </>
  );
}
