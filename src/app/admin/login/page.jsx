'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@kalindikart.com');
  const [password, setPassword] = useState(12345);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (res.ok) {
        // Save token to Cookie (Expires in 7 days)
        // This is necessary for your Sidebar and Middleware to function!
        document.cookie = `admin_token=${data.token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
        
        router.push('/admin/dashboard');
      } else {
        setError(data.error || 'Invalid credentials');
      }
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-viewport">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-6 col-lg-4">
            
            {/* Logo/Brand Header */}
            <div className="text-center mb-4">
               <h1 className="fw-bold tracking-tight" style={{ color: 'var(--dark-gold)' }}>
                  SUPER<span className="text-dark"> ADMIN</span>
               </h1>
               <p className="text-muted small text-uppercase fw-semibold">Administrative Portal</p>
            </div>

            <div className="card border-0 shadow-lg login-card">
              <div className="card-body p-4 p-md-5">
                <h4 className="fw-bold mb-4 text-center">Welcome Back</h4>
                
                {error && (
                  <div className="alert alert-danger border-0 small text-center py-2 animate-shake">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label small fw-bold text-secondary">EMAIL ADDRESS</label>
                    <input 
                      type="email" 
                      className="form-control form-control-lg custom-input" 
                      placeholder="admin@kalindikart.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>

                  <div className="mb-4">
                    <label className="form-label small fw-bold text-secondary">PASSWORD</label>
                    <input 
                      type="password" 
                      className="form-control form-control-lg custom-input" 
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-lg w-100 fw-bold shadow-sm transition-all" 
                    style={{ backgroundColor: 'var(--primary-gold)', color: '#fff' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      'Login Now'
                    )}
                  </button>
                </form>
              </div>
            </div>
            
            <p className="text-center mt-4 text-muted small">
              &copy; 2026 KalindiKart. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-viewport {
          padding:20px 0px;
          display: flex;
          align-items: center;
          background-color: #f8f9fa; /* Clean light gray background */
        }
        .login-card {
          border-radius: 20px;
          background: #ffffff;
        }
        .custom-input {
          border-radius: 10px;
          border: 1px solid #e0e0e0;
          font-size: 0.95rem;
          background-color: #fafafa;
        }
        .custom-input:focus {
          border-color: var(--primary-gold);
          box-shadow: 0 0 0 0.25rem rgba(1, 169, 230, 0.1);
          background-color: #fff;
        }
        .tracking-tight {
          letter-spacing: -1px;
        }
        .transition-all {
          transition: transform 0.2s ease, filter 0.2s ease;
        }
        .transition-all:hover {
          transform: translateY(-2px);
          filter: brightness(1.1);
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}</style>
    </main>
  );
}