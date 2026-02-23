import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Profile() {
  const { user, updateUser } = useAuth()

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName:  user?.lastName  || '',
    phone:     user?.phone     || '',
    nationalId: user?.nationalId || '',
  })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setLoading(true)
    setError('')
    try {
      const res = await axios.put(`${API_URL}/users/profile`, form)
      updateUser(res.data.user || res.data)
      setSuccess(true)
      setEditing(false)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (editable) =>
    `w-full px-4 py-3 rounded-xl border text-sm transition-all ${
      editable
        ? 'border-ink-200 bg-white text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent'
        : 'border-transparent bg-ink-50 text-ink-700 cursor-default'
    }`

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 fade-up">
          <h1 className="text-3xl font-bold text-ink-900">My Profile</h1>
          <p className="text-ink-500 mt-1">Manage your personal information</p>
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-3xl border border-ink-100 shadow-sm overflow-hidden fade-up-1">

          {/* Banner */}
          <div className="h-28 bg-gradient-to-r from-brand-600 to-brand-700" />

          {/* Avatar + name */}
          <div className="px-8 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-6">
              <div className="w-24 h-24 bg-brand-500 rounded-2xl border-4 border-white flex items-center justify-center shadow-lg">
                <span className="text-white text-3xl font-bold" style={{fontFamily:'Sora,sans-serif'}}>
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex gap-3">
                {editing ? (
                  <>
                    <button onClick={() => { setEditing(false); setError('') }}
                      className="text-sm px-4 py-2 rounded-xl border border-ink-200 text-ink-600 hover:bg-ink-50 transition-colors font-medium">
                      Cancel
                    </button>
                    <button onClick={handleSave} disabled={loading}
                      className="text-sm px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors flex items-center gap-2 disabled:bg-brand-300">
                      {loading && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)}
                    className="text-sm px-5 py-2 rounded-xl border-2 border-brand-600 text-brand-600 hover:bg-brand-50 font-semibold transition-colors">
                    Edit Profile
                  </button>
                )}
              </div>
            </div>

            <div className="mb-2">
              <h2 className="text-2xl font-bold text-ink-900">{user?.firstName} {user?.lastName}</h2>
              <p className="text-ink-500">{user?.email}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 text-sm font-semibold px-3 py-1 rounded-full capitalize">
                {user?.role}
              </span>
              {user?.isVerified
                ? <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-sm font-semibold px-3 py-1 rounded-full">✓ Verified</span>
                : <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-sm font-semibold px-3 py-1 rounded-full">⏳ Not Verified</span>
              }
            </div>
          </div>

          <div className="border-t border-ink-100 mx-8" />

          {/* Messages */}
          <div className="px-8 py-4">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 mb-4 text-sm flex items-center gap-2">
                ✅ Profile updated successfully!
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Form fields */}
          <div className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">First Name</label>
              <input type="text" name="firstName" value={form.firstName} onChange={handleChange}
                readOnly={!editing} className={inputClass(editing)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Last Name</label>
              <input type="text" name="lastName" value={form.lastName} onChange={handleChange}
                readOnly={!editing} className={inputClass(editing)} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Email Address</label>
              <input type="email" value={user?.email || ''} readOnly className={inputClass(false)} />
              <p className="text-xs text-ink-400 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">Phone Number</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange}
                readOnly={!editing} className={inputClass(editing)} />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-ink-700 mb-2">National ID</label>
              <input type="text" name="nationalId" value={form.nationalId} onChange={handleChange}
                readOnly={!editing} className={inputClass(editing)} />
            </div>
          </div>
        </div>

        {/* Trust score card */}
        <div className="mt-6 bg-white rounded-2xl border border-ink-100 shadow-sm p-6 fade-up-2">
          <h3 className="font-bold text-ink-900 mb-4">⭐ Trust Score</h3>
          <div className="flex items-center gap-6">
            <div className="text-5xl font-bold text-brand-600" style={{fontFamily:'Sora,sans-serif'}}>87</div>
            <div className="flex-1">
              <div className="flex justify-between text-xs text-ink-500 mb-2">
                <span>0</span><span>100</span>
              </div>
              <div className="w-full bg-ink-100 rounded-full h-3">
                <div className="bg-gradient-to-r from-brand-400 to-brand-600 h-3 rounded-full" style={{width:'87%'}} />
              </div>
              <p className="text-sm text-ink-500 mt-2">Your score is <span className="font-semibold text-brand-600">Excellent</span>. Keep paying on time!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}