'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function PaymentProcessing() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const processPayment = async () => {
      const cartItems = JSON.parse(localStorage.getItem('guest-cart')) || [];
      const mobile = localStorage.getItem('userMobile');
      const user_id = localStorage.getItem('userId');

      if (cartItems.length === 0) {
        Swal.fire('Cart is empty', '', 'error');
        router.push('/cart');
        return;
      }

      const total_amount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      let orderId;

      try {
        // Use full URL for fetch
        const res = await fetch(`${window.location.origin}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user_id || null,
            mobile: mobile || 'guest',
            items: cartItems,
            total_amount,
            payment_method: 'online',
            shipping_address: 'N/A'
          }),
        });

        const data = await res.json();

        if (!res.ok || data.error) {
          console.error('Order API error:', data.error);
          throw new Error(data.error || 'Failed to save order');
        }

        orderId = data.order_id;

        // Clear guest cart after successful order
        localStorage.removeItem('guest-cart');

      } catch (error) {
        console.error(error);
        Swal.fire('Payment Failed', error.message || 'Something went wrong', 'error');
        router.push('/cart');
        return;
      }

      // Animate progress after successful API call
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);

            Swal.fire({
              title: '🎉 Payment Successful!',
              html: `<p>Your order has been placed successfully.</p>`,
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

            return 100;
          }
          return prev + 1;
        });
      }, 20);
    };

    processPayment();
  }, [router]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="card p-5 shadow-sm text-center" style={{ minWidth: '300px', maxWidth: '400px' }}>
        <h4 className="mb-4 text-dark-gold">Processing Payment</h4>
        <div className="progress" style={{ height: '25px', borderRadius: '12px', overflow: 'hidden' }}>
          <div
            className="progress-bar bg-primary-gold"
            role="progressbar"
            style={{ width: `${progress}%`, transition: 'width 0.2s ease' }}
            aria-valuenow={progress}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            {progress}%
          </div>
        </div>
        <p className="mt-3">Please wait while we process your payment...</p>
      </div>
    </div>
  );
}
