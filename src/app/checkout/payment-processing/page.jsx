'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function PaymentProcessing() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let progressInterval;

    const processPayment = async () => {
      // 1. Get identifiers from localStorage (or AuthContext if available)
      const userMobile = localStorage.getItem('userMobile');
      const userEmail = localStorage.getItem('userEmail');
      const lastAddress = localStorage.getItem('last_shipping_address');

      // 2. Strict Check: Ensure we have a way to identify the user
      if (!userMobile && !userEmail) {
        Swal.fire({
          title: 'Session Expired',
          text: 'Please login to complete your purchase.',
          icon: 'warning',
          confirmButtonColor: '#01A9E6'
        });
        router.push('/login?redirect=/checkout');
        return;
      }

      // 3. Start progress animation
      progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 95 ? prev + 1 : prev));
      }, 40);

      try {
        // 4. Send request to /api/orders
        // The backend will take these, SELECT the ID from the users table, 
        // and save it as user_id in the orders table.
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userMobile || null,
            userId: userEmail || null,
            payment_method: 'online',
            shipping_address: lastAddress || 'N/A',
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Order creation failed');
        }

        // 5. Success Handling
        clearInterval(progressInterval);
        setProgress(100);

        // Optional: Clear checkout-specific local storage but keep user sessions
        localStorage.removeItem('last_shipping_address');

        Swal.fire({
          title: '🎉 Payment Successful!',
          html: `
        <div style="text-align: center;">
          <p>Your order <strong>${data.order_number}</strong> has been placed.</p>
          <small class="text-muted">A confirmation has been sent to your registered info.</small>
        </div>
      `,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'View Orders',
          cancelButtonText: 'Continue Shopping',
          confirmButtonColor: '#01A9E6', // --primary-gold
          cancelButtonColor: '#00739D',  // --dark-gold
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/user/dashboard/my-orders');
          } else {
            router.push('/');
          }
        });

      } catch (error) {
        clearInterval(progressInterval);
        console.error("Payment Process Error:", error);

        Swal.fire({
          title: 'Payment Failed',
          text: error.message,
          icon: 'error',
          confirmButtonColor: '#01A9E6'
        });
        router.push('/cart');
      }
    };

    processPayment();
    return () => clearInterval(progressInterval);
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f0f8ff' }}>
      <div className="card p-5 shadow border-0 text-center" style={{ width: '400px', borderRadius: '15px' }}>
        <h4 className="mb-4 fw-bold" style={{ color: '#00739D' }}>Verifying Transaction</h4>

        <div className="progress mb-3" style={{ height: '12px', borderRadius: '10px', backgroundColor: '#e9ecef' }}>
          <div
            className="progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            style={{ width: `${progress}%`, backgroundColor: '#01A9E6', transition: 'width 0.3s' }}
          ></div>
        </div>

        <div className="d-flex justify-content-between small text-muted px-1">
          <span>Processing...</span>
          <span>{progress}%</span>
        </div>
      </div>
    </div>
  );
}