import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'

function StatCard({ icon, label, value, color = 'brand' }) {
  const colors = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    blue:  'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red:   'bg-red-50 text-red-600 border-red-100',
  }
  return (
    <div className={`rounded-2xl border p-6 ${colors[color]}`}>
      <div className="text-3xl mb-3">{icon}</div>
      <div className="text-2xl font-bold mb-1" style={{fontFamily:'Sora,sans-serif'}}>{value}</div>
      <div className="text-sm font-medium opacity-75">{label}</div>
    </div>
  )
}

function TenantDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🏠" label="Active Lease" value="1" color="brand" />
        <StatCard icon="💳" label="Payments Made" value="12" color="blue" />
        <StatCard icon="🔧" label="Open Requests" value="0" color="amber" />
        <StatCard icon="⭐" label="Trust Score" value="87" color="brand" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current lease */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
          <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
            📄 Current Lease
          </h3>
          <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
            <p className="font-semibold text-ink-800">KG 112 St, Kigali</p>
            <p className="text-sm text-ink-500 mt-1">Expires: Dec 31, 2025</p>
            <div className="mt-3 flex gap-2">
              <span className="bg-brand-100 text-brand-700 text-xs font-semibold px-3 py-1 rounded-full">Active</span>
              <span className="bg-ink-100 text-ink-600 text-xs px-3 py-1 rounded-full">120,000 RWF/mo</span>
            </div>
          </div>
          <Link to="/contracts" className="block text-center text-sm text-brand-600 font-semibold mt-4 hover:text-brand-700">
            View Full Contract →
          </Link>
        </div>

        {/* Recent payments */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
          <h3 className="font-bold text-ink-900 mb-4">💳 Recent Payments</h3>
          <div className="space-y-3">
            {[
              { month: 'February 2025', amount: '120,000', status: 'Paid' },
              { month: 'January 2025',  amount: '120,000', status: 'Paid' },
              { month: 'December 2024', amount: '120,000', status: 'Paid' },
            ].map(p => (
              <div key={p.month} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink-800">{p.month}</p>
                  <p className="text-xs text-ink-400">{p.amount} RWF</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">{p.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
        <h3 className="font-bold text-ink-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Pay Rent', icon: '💳', to: '/payments' },
            { label: 'Report Issue', icon: '🔧', to: '/maintenance' },
            { label: 'View Contract', icon: '📄', to: '/contracts' },
            { label: 'Browse Properties', icon: '🏠', to: '/properties' },
          ].map(a => (
            <Link key={a.label} to={a.to}
              className="flex flex-col items-center gap-2 p-4 bg-ink-50 hover:bg-brand-50 hover:border-brand-200 border border-ink-100 rounded-xl transition-all text-center">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-xs font-semibold text-ink-700">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function LandlordDashboard() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon="🏢" label="My Properties" value="4" color="brand" />
        <StatCard icon="👥" label="Active Tenants" value="6" color="blue" />
        <StatCard icon="💰" label="Monthly Income" value="480K" color="brand" />
        <StatCard icon="🔧" label="Open Requests" value="2" color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Properties */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-ink-900">🏢 My Properties</h3>
            <Link to="/properties/add" className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-brand-700 transition-colors">
              + Add New
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: 'KG 112 St Apartment', location: 'Kigali', status: 'Occupied', rent: '120,000' },
              { name: 'Kimihurura Studio', location: 'Kigali', status: 'Occupied', rent: '80,000' },
              { name: 'Nyamirambo House', location: 'Kigali', status: 'Vacant', rent: '150,000' },
            ].map(p => (
              <div key={p.name} className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-ink-800">{p.name}</p>
                  <p className="text-xs text-ink-400">{p.location} · {p.rent} RWF/mo</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  p.status === 'Occupied' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
          <Link to="/properties" className="block text-center text-sm text-brand-600 font-semibold mt-4 hover:text-brand-700">
            View All Properties →
          </Link>
        </div>

        {/* Income summary */}
        <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
          <h3 className="font-bold text-ink-900 mb-4">💰 Income This Month</h3>
          <div className="text-4xl font-bold text-brand-600 mb-2" style={{fontFamily:'Sora,sans-serif'}}>480,000 <span className="text-xl font-normal text-ink-400">RWF</span></div>
          <p className="text-sm text-ink-500 mb-6">From 6 active tenants</p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Collected</span>
              <span className="font-semibold text-green-600">360,000 RWF</span>
            </div>
            <div className="w-full bg-ink-100 rounded-full h-2">
              <div className="bg-brand-500 h-2 rounded-full" style={{width:'75%'}} />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Pending</span>
              <span className="font-semibold text-amber-600">120,000 RWF</span>
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance */}
      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6">
        <h3 className="font-bold text-ink-900 mb-4">🔧 Maintenance Requests</h3>
        <div className="space-y-3">
          {[
            { issue: 'Leaking pipe in bathroom', property: 'KG 112 St', priority: 'High', date: 'Feb 15' },
            { issue: 'Broken window lock', property: 'Kimihurura Studio', priority: 'Medium', date: 'Feb 12' },
          ].map(r => (
            <div key={r.issue} className="flex items-center justify-between p-4 bg-ink-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-ink-800">{r.issue}</p>
                <p className="text-xs text-ink-400">{r.property} · {r.date}</p>
              </div>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                r.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                {r.priority}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="mb-8 fade-up">
          <h1 className="text-3xl font-bold text-ink-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            {user?.firstName}! 👋
          </h1>
          <p className="text-ink-500 mt-1 flex items-center gap-2">
            <span className="capitalize inline-flex items-center gap-1.5 bg-brand-100 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {user?.role}
            </span>
            {new Date().toLocaleDateString('en-RW', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
          </p>
        </div>

        {/* Role-based content */}
        {user?.role === 'landlord' ? <LandlordDashboard /> : <TenantDashboard />}
      </div>
    </div>
  )
}