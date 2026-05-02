import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

/**
 * AuthContext — global authentication state.
 * Exposes: user, token, login(), logout(), loading
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [loading, setLoading] = useState(true); // true while restoring session

  // ── Restore session from localStorage on mount ─────────────────────────
  useEffect(() => {
    const savedToken = localStorage.getItem("ttm_token");
    const savedUser  = localStorage.getItem("ttm_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  /**
   * login — called after successful API auth.
   * Persists token + user to localStorage.
   */
  const login = (tokenValue, userData) => {
    localStorage.setItem("ttm_token", tokenValue);
    localStorage.setItem("ttm_user", JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);
  };

  /**
   * logout — clears all auth state and storage.
   */
  const logout = () => {
    localStorage.removeItem("ttm_token");
    localStorage.removeItem("ttm_user");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAdmin: user?.role === "admin" }}>
      {children}
    </AuthContext.Provider>
  );
};

// Convenience hook
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};

export default AuthContext;
