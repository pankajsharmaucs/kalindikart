// app/context/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // { id, mobile, ... }
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setAuth } = useCartStore();

  useEffect(() => {
    const storedMobile = localStorage.getItem('userMobile');
    const storedId = localStorage.getItem('userId');

    if (storedMobile) {
      const userData = { id: storedId, mobile: storedMobile };
      setUser(userData);
      setIsLoggedIn(true);

      setAuth(true, storedId);

    }

    setLoading(false);
  }, []);

  // Login function
  const login = ({ mobile, userId }) => {
    localStorage.setItem('userMobile', mobile);
    localStorage.setItem('userId', userId);

    const userData = { id: userId, mobile };
    setUser(userData);
    setIsLoggedIn(true);

    setAuth(true, userId);
    syncLocalToDB();
    fetchCart();
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userMobile');
    localStorage.removeItem('userId');

    setUser(null);
    setIsLoggedIn(false);

    setAuth(false, null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
