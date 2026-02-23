import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterLandlord() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', nationalId: '', password: '', confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
      await register({ ...form, role: 'landlord', confirmPassword: undefined })
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-ink-200 bg-ink-50 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-xl shadow-ink-900/5 border border-ink-100 p-8 sm:p-10 fade-up">

          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl" style={{fontFamily:'Sora,sans-serif'}}>I</span>
              </div>
              <span className="font-bold text-2xl text-ink-900" style={{fontFamily:'Sora,sans-serif'}}>
                Inzu<span className="text-brand-600">Trust</span>
              </span>
            </Link>
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              🏢 Landlord Registration
            </div>
            <h1 className="text-2xl font-bold text-ink-900 mb-1">List your property</h1>
            <p className="text-ink-500 text-sm">Connect with verified tenants across Rwanda</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">First Name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                  placeholder="Amina" required className={inputClass} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-2">Last Name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                  placeholder="Uwase" required className={inputClass} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Email Address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange}
                placeholder="amina@example.com" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Phone Number *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                placeholder="+250 788 000 000" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                National ID <span className="text-ink-400 font-normal">(recommended for verification)</span>
              </label>
              <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange}
                placeholder="1 2000 8 0000000 0 00" className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Password *</label>
              <input type="password" name="password" value={form.password} onChange={handleChange}
                placeholder="Minimum 6 characters" required className={inputClass} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Confirm Password *</label>
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                placeholder="Re-enter your password" required className={inputClass} />
            </div>

            {/* Benefits reminder */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              <p className="font-semibold mb-2">As a landlord you can:</p>
              <ul className="space-y-1 text-amber-700">
                <li>✓ List unlimited properties</li>
                <li>✓ Receive rent via mobile money</li>
                <li>✓ Sign digital contracts</li>
                <li>✓ Manage maintenance requests</li>
              </ul>
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create Landlord Account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 font-semibold hover:text-brand-700">Sign In</Link>
          </p>
          <p className="text-center text-sm text-ink-500 mt-2">
            Looking for a home?{' '}
            <Link to="/register/tenant" className="text-brand-600 font-semibold hover:text-brand-700">Register as Tenant</Link>
          </p>
        </div>
      </div>
    </div>
  )
}