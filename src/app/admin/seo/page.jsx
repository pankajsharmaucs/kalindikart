// src/app/admin/seo/page.jsx
'use client'

export default function SeoSettingsPage() {
  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">Search Engine Optimization</h2>
          <p className="text-muted">Configure how your website appears in search results and social shares.</p>
        </div>
        <button className="btn btn-primary px-4 shadow-sm">Save SEO Settings</button>
      </div>

      <div className="row g-4">
        {/* Main SEO Config */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 mb-4">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0 text-dark">Global Meta Tags</h5>
            </div>
            <div className="card-body p-4">
              <div className="mb-4">
                <label className="form-label fw-semibold">Site Title Template</label>
                <input type="text" className="form-control form-control-lg" defaultValue="%product_name% | My Store Name" />
                <div className="form-text">Use variables like %product_name% or %category%.</div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold">Default Meta Description</label>
                <textarea className="form-control" rows="4" placeholder="Enter a description for search engines..."></textarea>
                <div className="d-flex justify-content-between mt-1">
                  <span className="small text-muted">Recommended: 150-160 characters.</span>
                  <span className="small text-primary">0 / 160</span>
                </div>
              </div>

              <div className="mb-0">
                <label className="form-label fw-semibold">Focus Keywords</label>
                <input type="text" className="form-control" placeholder="e.g. ecommerce, electronics, shopping" />
              </div>
            </div>
          </div>

          <div className="card shadow-sm border-0">
            <div className="card-header bg-white py-3">
              <h5 className="mb-0">Social Graph (Open Graph)</h5>
            </div>
            <div className="card-body p-4">
              <div className="row g-3">
                <div className="col-md-12">
                  <label className="form-label fw-semibold">Default Share Image</label>
                  <input type="file" className="form-control" />
                  <div className="form-text">This image appears when your site is shared on WhatsApp/Facebook (1200x630px).</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Help / Preview */}
        <div className="col-lg-4">
          <div className="card shadow-sm border-0 bg-light">
            <div className="card-body p-4">
              <h6 className="fw-bold text-uppercase mb-3 small">Google Preview</h6>
              <div className="bg-white p-3 rounded border shadow-sm">
                <div className="text-primary mb-1" style={{ fontSize: '1.2rem', cursor: 'pointer' }}>
                  My Store | Best Online Shopping Platform
                </div>
                <div className="text-success small mb-1">https://mystore.com</div>
                <div className="text-muted small">
                  Provide a clear meta description here to see how your website will appear in Google search results...
                </div>
              </div>
              <hr className="my-4" />
              <h6 className="fw-bold text-uppercase mb-2 small">SEO Score Tips</h6>
              <ul className="list-unstyled small text-muted">
                <li className="mb-2">✅ SSL Certificate Active</li>
                <li className="mb-2">❌ Meta Description too short</li>
                <li className="mb-2">✅ Sitemap.xml Generated</li>
                <li className="mb-0">✅ Robots.txt Configured</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}