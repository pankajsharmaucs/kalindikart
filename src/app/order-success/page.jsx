// app/order-success/page.js
import { Suspense } from 'react';
import OrderSuccessClient from './OrderSuccessClient'; // your client component

export default function OrderSuccessPage() {
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
          <p className="mt-3">Loading order details...</p>
        </div>
      }
    >
      <OrderSuccessClient />
    </Suspense>
  );
}