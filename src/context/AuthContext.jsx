// app/context/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // { id, name, email, ... }
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setAuth, syncLocalToDB, fetchCart } = useCartStore();

  // Check auth on mount (e.g., from cookies, JWT, or your auth method)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Replace this with your actual auth check (e.g., /api/auth/me)
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          setIsLoggedIn(true);

          // Sync cart with logged-in user
          setAuth(true, userData.id);
          await syncLocalToDB();
          await fetchCart();
        }
      } catch (err) {
        console.log('Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      // Replace with your actual login API endpoint
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Login failed');

      const userData = await res.json(); // { id, name, email, ... }

      setUser(userData);
      setIsLoggedIn(true);

      // IMPORTANT: Sync cart after login
      setAuth(true, userData.id);
      await syncLocalToDB();   // Moves guest cart → DB
      await fetchCart();       // Refresh cart from DB

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout error:', err);
    }

    setUser(null);
    setIsLoggedIn(false);

    // Reset cart auth state (falls back to localStorage guest cart)
    setAuth(false, null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);