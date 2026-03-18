'use client';

import { useEffect, useState } from 'react';
import swal from 'sweetalert';

export default function WebsiteSettings() {
  const [form, setForm] = useState({
    site_name: '',
    logo: '',
    favicon: '',
    payment_gateway: '',
    payment_api_key: '',
    whatsapp_url: '',
    contact_email: '',
    contact_phone: '',
    delivery_info: '',
    facebook_url: '',
    instagram_url: '',
    twitter_url: '',
    youtube_url: '',
  });

  const [loading, setLoading] = useState(false);

  /* ===============================
     HANDLE CHANGE
  ============================== */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /* ===============================
     FETCH SETTINGS
  ============================== */
  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();

      if (data.success && data.data) {
        setForm(data.data);
      }
    } catch (err) {
      console.error(err);
      swal('Error', 'Failed to load settings', 'error');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  /* ===============================
     SUBMIT
  ============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      swal('Success', 'Settings updated successfully', 'success');
    } catch (err) {
      console.error(err);
      swal('Error', err.message || 'Update failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-lg-8 col-md-10 col-12">
          <div className="card shadow-sm border-0 p-4">
            <h2 className="fw-bold text-center mb-4">Website Settings</h2>

            <form onSubmit={handleSubmit}>
              <div className="row g-3">

                <div className="col-12">
                  <label className="form-label fw-semibold">Site Top </label>
                  <input type="text" className="form-control" name="site_name" value={form.site_name} onChange={handleChange} />
                </div>

                <div className="col-md-6 d-none">
                  <label className="form-label fw-semibold">Logo URL</label>
                  <input type="text" className="form-control" name="logo" value={form.logo} onChange={handleChange} />
                </div>

                <div className="col-md-6 d-none">
                  <label className="form-label fw-semibold">Favicon URL</label>
                  <input type="text" className="form-control" name="favicon" value={form.favicon} onChange={handleChange} />
                </div>

                <div className="col-md-6 d-none">
                  <label className="form-label fw-semibold">Payment Gateway</label>
                  <input type="text" className="form-control" name="payment_gateway" value={form.payment_gateway} onChange={handleChange} />
                </div>

                <div className="col-md-6 d-none">
                  <label className="form-label fw-semibold">Payment API Key</label>
                  <input type="text" className="form-control" name="payment_api_key" value={form.payment_api_key} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">WhatsApp URL</label>
                  <input type="text" className="form-control" name="whatsapp_url" value={form.whatsapp_url} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Contact Email</label>
                  <input type="email" className="form-control" name="contact_email" value={form.contact_email} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Contact Phone</label>
                  <input type="text" className="form-control" name="contact_phone" value={form.contact_phone} onChange={handleChange} />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Delivery Info</label>
                  <textarea className="form-control" name="delivery_info" rows={3} value={form.delivery_info} onChange={handleChange}></textarea>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Facebook URL</label>
                  <input type="text" className="form-control" name="facebook_url" value={form.facebook_url} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Instagram URL</label>
                  <input type="text" className="form-control" name="instagram_url" value={form.instagram_url} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Twitter URL</label>
                  <input type="text" className="form-control" name="twitter_url" value={form.twitter_url} onChange={handleChange} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">YouTube URL</label>
                  <input type="text" className="form-control" name="youtube_url" value={form.youtube_url} onChange={handleChange} />
                </div>

              </div>

              <div className="mt-4 d-grid">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving...
                    </>
                  ) : 'Update Settings'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </div>
  );
}