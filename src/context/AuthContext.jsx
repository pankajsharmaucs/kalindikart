'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useCartStore } from '../stores/cartStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // User object will now look like { id: "mobile_or_email", type: "phone|email" }
  const [user, setUser] = useState(null); 
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const { setAuth, logout: logoutCart } = useCartStore();

  /* ---------- RESTORE LOGIN ON REFRESH ---------- */
  useEffect(() => {
    const mobile = localStorage.getItem('userMobile');
    const email = localStorage.getItem('userEmail');
    
    // Check which one exists
    const identifier = mobile || email;

    if (identifier) {
      setUser({ 
        id: identifier, 
        mobile: mobile || null, 
        email: email || null 
      });
      setIsLoggedIn(true);

      // 🔥 restore Zustand auth with the generic identifier
      setAuth(true, identifier);
    }

    setLoading(false);
  }, [setAuth]);

  /* ---------- LOGIN ---------- */
  const login = ({ mobile, email }) => {
    const identifier = mobile || email;

    if (mobile) {
      localStorage.setItem('userMobile', mobile);
      localStorage.removeItem('userEmail'); // Cleanup
    } else if (email) {
      localStorage.setItem('userEmail', email);
      localStorage.removeItem('userMobile'); // Cleanup
    }

    setUser({ 
      id: identifier, 
      mobile: mobile || null, 
      email: email || null 
    });
    setIsLoggedIn(true);

    // 🔥 sync Zustand with the active identifier
    setAuth(true, identifier);
  };

  /* ---------- LOGOUT ---------- */
  const logout = () => {
    localStorage.removeItem('userMobile');
    localStorage.removeItem('userEmail');

    setUser(null);
    setIsLoggedIn(false);

    // 🔥 Use the store's logout to clear cart and internal state
    logoutCart(); 
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