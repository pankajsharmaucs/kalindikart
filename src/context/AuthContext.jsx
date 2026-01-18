// app/context/AuthContext.jsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);        // { id, mobile }
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setAuth } = useCartStore();

  /* -------- RESTORE LOGIN ON REFRESH -------- */
  useEffect(() => {
    const storedMobile = localStorage.getItem('userMobile');
    const storedId = localStorage.getItem('userId');

    if (storedMobile && storedId) {
      setUser({ id: storedId, mobile: storedMobile });
      setIsLoggedIn(true);
      setAuth(true, storedId);
    }

    setLoading(false);
  }, [setAuth]);

  /* -------- LOGIN -------- */
  const login = ({ mobile, userId }) => {
    localStorage.setItem('userMobile', mobile);
    localStorage.setItem('userId', userId);

    setUser({ id: userId, mobile });
    setIsLoggedIn(true);

    // ✅ ONLY auth update here
    setAuth(true, userId);
  };

  /* -------- LOGOUT -------- */
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
