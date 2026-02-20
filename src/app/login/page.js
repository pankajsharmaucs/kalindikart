import { Suspense } from 'react';
import LoginClient from './LoginClient';  // adjust path if you placed it elsewhere

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '100vh', 
          background: '#f8f9fa' 
        }}>
          <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Preparing secure login...</p>
        </div>
      }
    >
      <LoginClient />
    </Suspense>
  );
}