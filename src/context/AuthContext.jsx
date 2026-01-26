'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // { id: mobile }
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setAuth } = useCartStore();

  /* ---------- RESTORE LOGIN ON REFRESH ---------- */
  useEffect(() => {
    const mobile = localStorage.getItem('userMobile');

    if (mobile) {
      setUser({ id: mobile });
      setIsLoggedIn(true);

      // 🔥 restore Zustand auth
      setAuth(true, mobile);
    }

    setLoading(false);
  }, [setAuth]);

  /* ---------- LOGIN ---------- */
  const login = ({ mobile }) => {
    // 🔥 store only ONE thing
    localStorage.setItem('userMobile', mobile);

    setUser({ id: mobile });
    setIsLoggedIn(true);

    // 🔥 sync Zustand
    setAuth(true, mobile);
  };

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    localStorage.removeItem('userMobile');

    setUser(null);
    setIsLoggedIn(false);

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
