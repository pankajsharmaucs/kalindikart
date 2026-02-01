// src/app/admin/settings/page.jsx
'use client'
import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Website Settings</h2>
          <p className="text-muted small">Manage your site identity, SEO, and global configurations.</p>
        </div>
        <button type="submit" form="settings-form" className="btn btn-primary px-4 shadow-sm">
          Save All Changes
        </button>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom-0 pt-3">
          {/* Nav Tabs */}
          <ul className="nav nav-tabs card-header-tabs">
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'general' ? 'active fw-bold' : 'text-muted'}`} 
                onClick={() => setActiveTab('general')}
              >
                General
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'seo' ? 'active fw-bold' : 'text-muted'}`} 
                onClick={() => setActiveTab('seo')}
              >
                SEO & Meta
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'social' ? 'active fw-bold' : 'text-muted'}`} 
                onClick={() => setActiveTab('social')}
              >
                Social Links
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">
          <form id="settings-form">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Store Name</label>
                  <input type="text" className="form-control" defaultValue="My Premium Store" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Support Email</label>
                  <input type="email" className="form-control" defaultValue="support@mystore.com" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Store Logo</label>
                  <input type="file" className="form-control" />
                  <div className="form-text text-muted">Recommended size: 200x50px (PNG/SVG)</div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Currency Symbol</label>
                  <select className="form-select">
                    <option value="INR">₹ (INR)</option>
                    <option value="USD">$ (USD)</option>
                    <option value="EUR">€ (EUR)</option>
                  </select>
                </div>
              </div>
            )}

            {/* SEO Settings */}
            {activeTab === 'seo' && (
              <div className="row g-4">
                <div className="col-12">
                  <label className="form-label fw-medium">Meta Title (Homepage)</label>
                  <input type="text" className="form-control" placeholder="Best E-commerce Store for Electronics" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-medium">Meta Description</label>
                  <textarea className="form-control" rows="3" placeholder="Describe your store in 160 characters..."></textarea>
                </div>
                <div className="col-md-12">
                  <label className="form-label fw-medium">Google Analytics ID</label>
                  <div className="input-group">
                    <span className="input-group-text bg-light text-muted">UA-</span>
                    <input type="text" className="form-control" placeholder="XXXXXXX-X" />
                  </div>
                </div>
              </div>
            )}

            {/* Social Settings */}
            {activeTab === 'social' && (
              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label fw-medium">Facebook URL</label>
                  <div className="input-group">
                    <span className="input-group-text bg-primary text-white"><i className="bi bi-facebook"></i> fb.com/</span>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Instagram Username</label>
                  <div className="input-group">
                    <span className="input-group-text bg-danger text-white">@</span>
                    <input type="text" className="form-control" />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-medium">Twitter (X) URL</label>
                  <input type="url" className="form-control" placeholder="https://x.com/yourhandle" />
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="mt-5 p-4 border border-danger rounded-3 bg-light bg-opacity-10">
        <h5 className="text-danger fw-bold">Danger Zone</h5>
        <p className="text-muted small">Deleting site data or clearing the cache cannot be undone.</p>
        <button className="btn btn-outline-danger btn-sm">Clear Site Cache</button>
      </div>
    </div>
  )
}