import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('inzu_token'))
  const [loading, setLoading] = useState(true)

  // Set axios default header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      localStorage.setItem('inzu_token', token)
      fetchProfile()
    } else {
      delete axios.defaults.headers.common['Authorization']
      localStorage.removeItem('inzu_token')
      setLoading(false)
    }
  }, [token])

  async function fetchProfile() {
    try {
      const res = await axios.get(`${API_URL}/users/profile`)
      setUser(res.data.user || res.data)
    } catch {
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const res = await axios.post(`${API_URL}/users/login`, { email, password })
    const data = res.data
    setToken(data.token)
    setUser(data.user || data)
    return data
  }

  async function register(formData) {
    const res = await axios.post(`${API_URL}/users/register`, formData)
    const data = res.data
    setToken(data.token)
    setUser(data.user || data)
    return data
  }

  function logout() {
    setToken(null)
    setUser(null)
  }

  function updateUser(updates) {
    setUser(prev => ({ ...prev, ...updates }))
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}