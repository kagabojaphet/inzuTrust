// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Role → dashboard route map (used by Login page for redirect)
export const ROLE_DASHBOARD = {
  tenant:   '/tenant/dashboard',
  landlord: '/landlord/dashboard',
  admin:    '/admin/dashboard',
  agent:    '/agent/dashboard',
};

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('inzu_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('inzu_token', token);
      fetchProfile();
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('inzu_token');
      setUser(null);
      setLoading(false);
    }
  }, [token]);

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_URL}/users/profile`);
      setUser(res.data.data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }

  // Used by Login page — calls API, returns user (caller handles redirect)
  async function login(email, password) {
    const res          = await axios.post(`${API_URL}/users/login`, { email, password });
    const { token: tk, user: usr } = res.data.data;

    axios.defaults.headers.common['Authorization'] = `Bearer ${tk}`;
    localStorage.setItem('inzu_token', tk);
    localStorage.setItem('user', JSON.stringify(usr || {}));
    setToken(tk);
    setUser(usr);

    return usr; // caller does: navigate(ROLE_DASHBOARD[usr.role])
  }

  // Used by VerifyOTP + TenantRegister after OTP confirmed
  function setAuth(token, userData) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('inzu_token', token);
    localStorage.setItem('user', JSON.stringify(userData || {}));
    setToken(token);
    if (userData) setUser(userData);
  }

  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('inzu_token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}