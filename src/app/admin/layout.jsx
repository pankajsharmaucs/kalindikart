// src/app/admin/layout.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import AdminSidebar from '../../components/AdminSidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="container-fluid vh-100 overflow-hidden">
      <div className="row h-100">
        
        {/* Sidebar (Client Component) */}
        <AdminSidebar />

        {/* Main Content Area (Server/Client mix) */}
        <div className="col-md-9 col-lg-10 p-0 h-100 d-flex flex-column bg-light">
          
          <header className="navbar sticky-top bg-white shadow-sm px-4 py-3 border-bottom">
            <span className="text-muted">Admin Dashboard</span>
            <div className="dropdown">
               <button className="btn btn-sm btn-light border rounded-circle" type="button">👤</button>
            </div>
          </header>

          {/* Scrollable Main Area */}
          <main className="flex-grow-1 overflow-auto p-4" style={{ backgroundColor: '#f8f9fa' }}>
            {children}
          </main>

        </div>
      </div>
    </div>
  );
}