import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterTenant() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', nationalId: '', password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { firstName, lastName, email, phone, password, confirmPassword } = form
    if (!firstName || !lastName || !email || !phone || !password) return setError('Please fill in all required fields.')
    if (password.length < 6) return setError('Password must be at least 6 characters.')
    if (password !== confirmPassword) return setError('Passwords do not match.')

    setLoading(true)
    try {
      await register({ ...form, role: 'tenant', confirmPassword: undefined })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl shadow-ink-900/5 border border-ink-100 p-8 sm:p-10 fade-up">

          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl" style={{fontFamily:'Sora,sans-serif'}}>I</span>
              </div>
              <span className="font-bold text-2xl text-ink-900" style={{fontFamily:'Sora,sans-serif'}}>
                Inzu<span className="text-brand-600">Trust</span>
              </span>
            </Link>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              🏡 Tenant Registration
            </div>
            <h1 className="text-2xl font-bold text-ink-900 mb-1">Create your account</h1>
            <p className="text-ink-500 text-sm">Find your perfect home in Rwanda</p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">First Name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  placeholder="Jean" required
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Last Name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  placeholder="Bosco" required
                  className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="jean@example.com" required
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Phone Number *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+250 788 000 000" required
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">National ID <span className="text-ink-400 font-normal">(optional)</span></label>
              <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange}
                placeholder="1 2000 8 0000000 0 00"
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Password *</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Minimum 6 characters" required
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPass ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                  </svg>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Confirm Password *</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter your password" required
                className="w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all" />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create Tenant Account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign In</Link>
          </p>
          <p className="text-center text-sm text-ink-500 mt-2">
            Are you a landlord?{' '}
            <Link to="/register/landlord" className="text-brand-600 font-semibold hover:text-brand-700">Register as Landlord</Link>
          </p>
        </div>
      </div>
    </div>
  )
}