// src/components/admin/shared/ADStatusBadge.jsx
// Universal status badge used across admin pages
const CONFIGS = {
  // Agreement statuses
  draft:             { bg:"bg-gray-100 text-gray-500 border-gray-200",          dot:"bg-gray-400"    },
  pending_signature: { bg:"bg-yellow-50 text-yellow-700 border-yellow-200",      dot:"bg-yellow-400"  },
  signed:            { bg:"bg-green-50 text-green-700 border-green-200",         dot:"bg-green-500"   },
  active:            { bg:"bg-green-50 text-green-700 border-green-200",         dot:"bg-green-500"   },
  expired:           { bg:"bg-red-50 text-red-600 border-red-200",              dot:"bg-red-400"     },
  terminated:        { bg:"bg-red-100 text-red-700 border-red-300",             dot:"bg-red-600"     },
  // Application statuses
  pending:           { bg:"bg-yellow-50 text-yellow-700 border-yellow-200",      dot:"bg-yellow-400"  },
  accepted:          { bg:"bg-green-50 text-green-700 border-green-200",         dot:"bg-green-500"   },
  rejected:          { bg:"bg-red-50 text-red-600 border-red-200",              dot:"bg-red-400"     },
  // Termination
  termination_requested: { bg:"bg-orange-50 text-orange-700 border-orange-200", dot:"bg-orange-500"  },
  // User / property
  verified:          { bg:"bg-emerald-50 text-emerald-700 border-emerald-200",   dot:"bg-emerald-500" },
  pending_kyc:       { bg:"bg-yellow-50 text-yellow-700 border-yellow-200",      dot:"bg-yellow-400"  },
  suspended:         { bg:"bg-red-50 text-red-600 border-red-200",              dot:"bg-red-400"     },
};

const LABELS = {
  draft:"Draft", pending_signature:"Pending Sig.", signed:"Signed", active:"Active",
  expired:"Expired", terminated:"Terminated", pending:"Pending", accepted:"Accepted",
  rejected:"Rejected", termination_requested:"Term. Requested", verified:"Verified",
  pending_kyc:"Pending KYC", suspended:"Suspended",
};

export default function ADStatusBadge({ status, label }) {
  const cfg = CONFIGS[status] || CONFIGS.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>
      {label || LABELS[status] || status}
    </span>
  );
}