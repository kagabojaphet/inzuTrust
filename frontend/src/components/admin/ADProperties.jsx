// src/components/admin/ADProperties.jsx — Property Verification Queue
import React, { useEffect, useState, useCallback } from "react";
import {
  HiCheckCircle, HiX, HiSearch, HiRefresh, HiLocationMarker,
  HiPhotograph, HiDocumentText, HiExclamation, HiShieldCheck,
  HiDownload, HiCog,
} from "react-icons/hi";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { API_BASE } from "../../config";

const hdrs    = tk => ({ Authorization: `Bearer ${tk}` });
const fmtRWF  = n  => n ? `RWF ${Number(n).toLocaleString()}` : "—";
const timeAgo = d  => {
  if (!d) return "—";
  const s = Math.floor((Date.now() - new Date(d)) / 1000);
  if (s < 3600)  return `${Math.floor(s/60)}m ago`;
  if (s < 86400) return `${Math.floor(s/3600)}h ago`;
  return `${Math.floor(s/86400)}d ago`;
};

const STATUS_TABS = [
  { key:"pending_review", label:"Pending Review" },
  { key:"under_review",   label:"In Progress"    },
  { key:"approved",       label:"Approved"       },
  { key:"rejected",       label:"Rejected"       },
];

function DocBadge({ label, ok }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
      ok ? "bg-green-50 text-green-700 border border-green-200"
         : "bg-amber-50 text-amber-700 border border-amber-200"
    }`}>
      {ok ? <HiCheckCircle className="text-green-500 text-xs"/> : <HiExclamation className="text-amber-500 text-xs"/>}
      {label}
    </span>
  );
}

function ReviewPanel({ property: p, token, onUpdated }) {
  const [checks,  setChecks]  = useState({ upi:false, landTitle:false, taxClearance:false, idVerified:false });
  const [loading, setLoading] = useState(false);
  const [note,    setNote]    = useState("");

  const accuracy = Math.round((Object.values(checks).filter(Boolean).length / 4) * 100);

  const handleAction = async action => {
    setLoading(true);
    try {
      const res  = await fetch(`${API_BASE}/admin/properties/${p.id}/verify`, {
        method:  "PUT",
        headers: { ...hdrs(token), "Content-Type":"application/json" },
        body:    JSON.stringify({ action, note }),
      });
      const data = await res.json();
      if (data.success) onUpdated(data.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      {/* Accuracy card */}
      <div className="bg-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10"/>
        <div className="absolute -right-2 -bottom-6 w-16 h-16 rounded-full bg-white/10"/>
        <div className="relative z-10 flex items-start justify-between mb-2">
          <p className="text-xs font-black uppercase tracking-widest text-blue-200">Trust Score Threshold</p>
          <HiCog className="text-blue-300"/>
        </div>
        <p className="text-3xl font-black relative z-10">{accuracy}%</p>
        <p className="text-xs text-blue-200 mt-1 relative z-10">
          System accuracy for Rwanda Registry synchronization
        </p>
      </div>

      {/* Verification protocol */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5">
        <h4 className="font-black text-gray-900 text-sm flex items-center gap-2 mb-4">
          <HiShieldCheck className="text-blue-600"/> Verification Protocol
        </h4>
        <div className="space-y-3">
          {[
            { key:"upi",          label:"UPI Validation",          desc:"Matches Rwanda Land Management System records." },
            { key:"landTitle",    label:"Land Title Authenticity", desc:"Check for QR code validity and physical stamps." },
            { key:"taxClearance", label:"Tax Clearance (RRA)",     desc:"Verify no outstanding property tax liabilities." },
            { key:"idVerified",   label:"Identity Verification",   desc:"Owner ID matches Irembo database profile." },
          ].map(c => (
            <label key={c.key} className="flex items-start gap-3 cursor-pointer group">
              <div
                onClick={() => setChecks(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                  checks[c.key] ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-400"
                }`}>
                {checks[c.key] && <HiCheckCircle className="text-white text-xs"/>}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{c.label}</p>
                <p className="text-[11px] text-gray-400 leading-relaxed">{c.desc}</p>
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1.5">
            Verification Note
          </label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={2}
            placeholder="e.g. Missing tax clearance certificate..."
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"/>
        </div>

        <div className="space-y-2 mt-4">
          <button onClick={() => handleAction("approve")} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl text-sm font-black hover:bg-green-700 transition disabled:opacity-60">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : <HiCheckCircle/>}
            Approve Listing
          </button>
          <button onClick={() => handleAction("reject")} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 transition disabled:opacity-60">
            <HiX/> Reject & Notify
          </button>
          <button onClick={() => handleAction("review")} disabled={loading}
            className="w-full py-2.5 text-gray-500 text-xs font-bold hover:underline">
            Request More Info
          </button>
        </div>
      </div>
    </div>
  );
}

function PropertyCard({ property: p, selected, onSelect }) {
  const borderMap = {
    pending_review: "border-l-4 border-amber-400",
    under_review:   "border-l-4 border-blue-400",
    approved:       "border-l-4 border-green-400",
    rejected:       "border-l-4 border-red-400",
  };
  const img      = p.mainImage || (Array.isArray(p.images) ? p.images[0] : null);
  const landlord = p.landlord;

  return (
    <div onClick={() => onSelect(p)}
      className={`bg-white rounded-2xl border overflow-hidden cursor-pointer transition hover:shadow-md ${
        selected?.id === p.id ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-200"
      } ${borderMap[p.verificationStatus] || ""}`}>
      <div className="flex gap-4 p-4">
        <div className="w-24 h-20 rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {img
            ? <img src={img} alt={p.title} className="w-full h-full object-cover"/>
            : <div className="w-full h-full flex items-center justify-center"><HiPhotograph className="text-gray-300 text-2xl"/></div>
          }
        </div>
        <div className="flex-1 min-w-0">
          {p.upi && (
            <p className="text-[10px] text-gray-400 font-mono mb-0.5">
              UPI: {p.upi} · <span className="text-gray-400">{timeAgo(p.createdAt)}</span>
            </p>
          )}
          <h3 className="font-black text-gray-900 text-sm truncate">{p.title}</h3>
          <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            <HiLocationMarker className="shrink-0"/> {p.district}{p.sector ? `, ${p.sector}` : ""}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <DocBadge label="Land Title" ok={p.hasLandTitle}/>
            <DocBadge label="Tax Proof"  ok={p.hasTaxProof}/>
            <DocBadge label="Owner ID"   ok={p.hasOwnerId}/>
          </div>
        </div>
        <div className="shrink-0 flex flex-col items-end justify-between">
          {landlord && (
            <div className="text-right">
              <p className="text-[10px] text-gray-400">Submitted by</p>
              <p className="text-xs font-bold text-gray-700">{landlord.firstName} {landlord.lastName}</p>
            </div>
          )}
          <button onClick={e => { e.stopPropagation(); onSelect(p); }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition ${
              selected?.id === p.id
                ? "bg-blue-600 text-white"
                : "border border-blue-300 text-blue-600 hover:bg-blue-50"
            }`}>
            Review Case
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ADProperties({ token }) {
  const [properties, setProperties] = useState([]);
  const [counts,     setCounts]     = useState({ pending_review:0, under_review:0, approved:0, rejected:0 });
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState("pending_review");
  const [search,     setSearch]     = useState("");
  const [selected,   setSelected]   = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const statuses = ["pending_review","under_review","approved","rejected"];
      const results  = await Promise.all(
        statuses.map(s =>
          fetch(`${API_BASE}/admin/properties/verify?status=${s}&limit=100`, { headers:hdrs(token) })
            .then(r => r.json()).catch(() => ({ data:[], total:0 }))
        )
      );
      const [pend, rev, app, rej] = results;
      setCounts({ pending_review:pend.total||0, under_review:rev.total||0, approved:app.total||0, rejected:rej.total||0 });
      const tabData = { pending_review:pend.data||[], under_review:rev.data||[], approved:app.data||[], rejected:rej.data||[] };
      setProperties(tabData[tab] || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [token, tab]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = properties.filter(p =>
    !search ||
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.district?.toLowerCase().includes(search.toLowerCase()) ||
    `${p.landlord?.firstName} ${p.landlord?.lastName}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SkeletonTheme baseColor="#f1f5f9" highlightColor="#e2e8f0">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Property Verification Queue</h1>
            <p className="text-sm text-gray-500 mt-1">Validate Rwanda land titles and tax compliance certificates.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchAll}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition">
              <HiRefresh/> Sync Registry
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black hover:bg-blue-700 transition">
              <HiDownload/> Export Report
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200">
              {STATUS_TABS.map(t => (
                <button key={t.key} onClick={() => { setTab(t.key); setSelected(null); }}
                  className={`pb-3 px-4 text-sm font-bold transition border-b-2 ${
                    tab===t.key ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}>
                  {t.label}
                  {counts[t.key]>0 && (
                    <span className={`ml-1.5 text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                      tab===t.key?"bg-blue-100 text-blue-600":"bg-gray-100 text-gray-500"
                    }`}>{counts[t.key]}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-72">
              <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"/>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search properties..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"/>
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {loading ? Array.from({length:3}).map((_,i)=>(
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 flex gap-4">
                  <Skeleton width={96} height={80} borderRadius={12}/>
                  <div className="flex-1 space-y-2">
                    <Skeleton width={80} height={10} borderRadius={4}/>
                    <Skeleton width={200} height={14} borderRadius={6}/>
                    <Skeleton width={140} height={11} borderRadius={4}/>
                    <div className="flex gap-2"><Skeleton width={70} height={20} borderRadius={20}/><Skeleton width={70} height={20} borderRadius={20}/></div>
                  </div>
                </div>
              )) : filtered.length===0 ? (
                <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
                  <HiDocumentText className="text-5xl text-gray-200 mx-auto mb-3"/>
                  <p className="text-gray-500 font-semibold text-sm">No properties in this queue</p>
                </div>
              ) : filtered.map(p => (
                <PropertyCard key={p.id} property={p} selected={selected} onSelect={setSelected}/>
              ))}
            </div>
          </div>

          {/* Right — review panel */}
          <div className="w-72 shrink-0">
            {selected ? (
              <ReviewPanel property={selected} token={token} onUpdated={() => { setSelected(null); fetchAll(); }}/>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center sticky top-4">
                <HiShieldCheck className="text-4xl text-gray-200 mx-auto mb-3"/>
                <p className="text-sm font-semibold text-gray-400">Select a property to review</p>
                <p className="text-xs text-gray-300 mt-1">Click "Review Case" on any property card</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}