import { useState } from 'react'
import { Link } from 'react-router-dom'

const DEMO_PROPERTIES = [
  { id:1, title:'Modern Apartment', location:'Kigali, Gisozi', price:120000, bedrooms:2, bathrooms:1, type:'Apartment', verified:true, image:'🏢' },
  { id:2, title:'Studio in Kimihurura', location:'Kigali, Kimihurura', price:80000, bedrooms:1, bathrooms:1, type:'Studio', verified:true, image:'🏠' },
  { id:3, title:'Spacious Family House', location:'Kigali, Nyamirambo', price:200000, bedrooms:4, bathrooms:2, type:'House', verified:false, image:'🏡' },
  { id:4, title:'CBD Office Space', location:'Kigali, CBD', price:350000, bedrooms:0, bathrooms:1, type:'Office', verified:true, image:'🏛️' },
  { id:5, title:'Cozy 1BR Apartment', location:'Kigali, Remera', price:70000, bedrooms:1, bathrooms:1, type:'Apartment', verified:true, image:'🏢' },
  { id:6, title:'Luxury Villa', location:'Kigali, Nyarutarama', price:500000, bedrooms:5, bathrooms:3, type:'House', verified:true, image:'🏰' },
]

const TYPES = ['All', 'Apartment', 'Studio', 'House', 'Office']

export default function Properties() {
  const [search, setSearch]       = useState('')
  const [typeFilter, setType]     = useState('All')
  const [maxPrice, setMaxPrice]   = useState(600000)

  const filtered = DEMO_PROPERTIES.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
                        p.location.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter === 'All' || p.type === typeFilter
    const matchPrice  = p.price <= maxPrice
    return matchSearch && matchType && matchPrice
  })

  return (
    <div className="min-h-screen bg-ink-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-ink-900 to-ink-800 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-3">Find Your Home</h1>
          <p className="text-ink-300 text-lg mb-8">Browse verified properties across Rwanda</p>

          {/* Search bar */}
          <div className="max-w-xl mx-auto relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white text-ink-900 text-sm shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6 sticky top-20">
              <h3 className="font-bold text-ink-900 mb-5">Filters</h3>

              {/* Type */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-ink-700 mb-3">Property Type</label>
                <div className="flex flex-wrap gap-2">
                  {TYPES.map(t => (
                    <button key={t} onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        typeFilter === t
                          ? 'bg-brand-600 text-white'
                          : 'bg-ink-100 text-ink-600 hover:bg-ink-200'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-ink-700 mb-3">
                  Max Price: <span className="text-brand-600">{(maxPrice/1000).toFixed(0)}K RWF</span>
                </label>
                <input type="range" min={50000} max={600000} step={10000}
                  value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-brand-600" />
                <div className="flex justify-between text-xs text-ink-400 mt-1">
                  <span>50K</span><span>600K</span>
                </div>
              </div>

              <button onClick={() => { setSearch(''); setType('All'); setMaxPrice(600000) }}
                className="w-full text-sm text-ink-500 hover:text-red-500 transition-colors font-medium">
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Property grid */}
          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-ink-500">
                <span className="font-semibold text-ink-800">{filtered.length}</span> properties found
              </p>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-ink-100">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-ink-900 mb-2">No properties found</h3>
                <p className="text-ink-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(p => (
                  <div key={p.id}
                    className="bg-white rounded-2xl border border-ink-100 shadow-sm hover:shadow-md hover:border-brand-200 transition-all duration-200 overflow-hidden group">
                    
                    {/* Image placeholder */}
                    <div className="h-44 bg-gradient-to-br from-ink-100 to-ink-200 flex items-center justify-center text-6xl relative">
                      {p.image}
                      {p.verified && (
                        <div className="absolute top-3 right-3 bg-brand-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                          ✓ Verified
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-ink-900 group-hover:text-brand-600 transition-colors">{p.title}</h3>
                        <span className="text-xs bg-ink-100 text-ink-600 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">{p.type}</span>
                      </div>

                      <p className="text-sm text-ink-500 mb-3 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {p.location}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-ink-500 mb-4">
                        {p.bedrooms > 0 && <span>🛏 {p.bedrooms} bed</span>}
                        <span>🚿 {p.bathrooms} bath</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl font-bold text-brand-600" style={{fontFamily:'Sora,sans-serif'}}>
                            {p.price.toLocaleString()}
                          </span>
                          <span className="text-xs text-ink-400 ml-1">RWF/mo</span>
                        </div>
                        <Link to={`/properties/${p.id}`}
                          className="bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}