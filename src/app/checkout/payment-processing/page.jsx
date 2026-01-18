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
      const mobile = localStorage.getItem('userMobile');

      if (!mobile) {
        Swal.fire('Error', 'User not logged in', 'error');
        router.push('/login?redirect=/checkout');
        return;
      }

      // Start progress animation
      progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 1 : prev));
      }, 30);

      try {
        // Call API to place order
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mobile: mobile,
            payment_method: 'online',
            shipping_address: 'N/A', // replace with actual if available
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          throw new Error(data.error || 'Order creation failed');
        }

        // Finish progress
        clearInterval(progressInterval);
        setProgress(100);

        Swal.fire({
          title: '🎉 Payment Successful!',
          html: `<p>Your order <strong>${data.order_number}</strong> has been placed successfully.</p>`,
          icon: 'success',
          showCancelButton: true,
          confirmButtonText: 'My Orders',
          cancelButtonText: 'Continue Shopping',
          allowOutsideClick: false,
          allowEscapeKey: false,
        }).then((result) => {
          if (result.isConfirmed) {
            router.push('/user/dashboard/my-orders');
          } else {
            router.push('/');
          }
        });
      } catch (error) {
        clearInterval(progressInterval);
        console.error('Payment processing error:', error);

        Swal.fire(
          'Payment Failed',
          error.message || 'Something went wrong',
          'error'
        );

        router.push('/cart');
      }
    };

    processPayment();

    return () => clearInterval(progressInterval);
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div
        className="card p-5 shadow-sm text-center"
        style={{ minWidth: '320px', maxWidth: '420px' }}
      >
        <h4 className="mb-4 text-dark-gold">Processing Payment</h4>

        <div
          className="progress"
          style={{
            height: '25px',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <div
            className="progress-bar bg-primary-gold"
            role="progressbar"
            style={{
              width: `${progress}%`,
              transition: 'width 0.2s ease',
            }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {progress}%
          </div>
        </div>

        <p className="mt-3 text-muted">
          Please wait while we process your payment…
        </p>
      </div>
    </div>
  );
}
