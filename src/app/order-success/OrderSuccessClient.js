'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams?.get("order");

  return (
    <div className="container d-flex my-5 justify-content-center">
      <div className="card shadow border-0 text-center p-5 success-card">

        <div className="success-icon mb-4">
          <img
            src="/main/success.gif"
            width="240"
            alt="Order success"
          />
        </div>

        <h2 className="fw-bold mb-2 text-success">
          Order Booked
        </h2>

        <p className="text-muted mb-4">
          Your order <strong>{orderNumber}</strong> has been successfully placed.
        </p>

        <div className="d-flex flex-column flex-md-row justify-content-center gap-3">
          <Link
            href="/user/dashboard/my-orders"
            className="btn btn-primary px-4"
            style={{ background: '#01A9E6', border: 'none' }}
          >
            View Orders
          </Link>

          <Link
            href="/"
            className="btn btn-outline-secondary px-4"
          >
            Continue Shopping
          </Link>
        </div>

      </div>
    </div>
  );
}