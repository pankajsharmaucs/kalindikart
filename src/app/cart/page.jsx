// app/cart/page.jsx
'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

export default function CartPage() {
  const { isLoggedIn, loading } = useAuth();
  const router = useRouter();
  const cartItems = useCartStore((state) => state.cartItems);

  useEffect(() => {
    if (!loading && !isLoggedIn) {
      router.push('/login?redirect=/cart');
    }
  }, [isLoggedIn, loading, router]);

  if (loading) return <p>Loading...</p>;
  if (!isLoggedIn) return null;

  // Render cart items...
}