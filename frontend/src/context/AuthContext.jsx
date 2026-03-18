// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
    } catch (err) {
      logout();
    } finally {
      setLoading(false);
    }
  }

  // Used by Login page — takes email + password, calls API
  async function login(email, password) {
    try {
      const res       = await axios.post(`${API_URL}/users/login`, { email, password });
      const authData  = res.data.data;
      const receivedToken = authData.token;
      const receivedUser  = authData.user || authData;

      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;
      localStorage.setItem('inzu_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      return receivedUser;
    } catch (error) {
      throw error;
    }
  }

  // Used by VerifyOTP + TenantRegister — token already obtained, just set it in context
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