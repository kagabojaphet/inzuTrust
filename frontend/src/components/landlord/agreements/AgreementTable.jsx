// src/components/landlord/agreements/AgreementTable.jsx
import React from "react";
import Skeleton from "react-loading-skeleton";
import AgreementRow from "./AgreementRow";

function RowSkeleton() {
  return (
    <div className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b border-gray-50">
      <div className="col-span-3 flex items-center gap-2">
        <Skeleton circle width={28} height={28}/>
        <Skeleton width={110} height={13} borderRadius={6}/>
      </div>
      <div className="col-span-3"><Skeleton width={130} height={13} borderRadius={6}/></div>
      <div className="col-span-2">
        <Skeleton width={70} height={11} borderRadius={6}/>
        <Skeleton width={70} height={11} borderRadius={6} className="mt-1"/>
      </div>
      <div className="col-span-1"><Skeleton width={60} height={13} borderRadius={6}/></div>
      <div className="col-span-2"><Skeleton width={80} height={22} borderRadius={20}/></div>
      <div className="col-span-1 flex justify-end gap-1.5">
        <Skeleton circle width={28} height={28}/>
        <Skeleton circle width={28} height={28}/>
      </div>
    </div>
  );
}

export default function AgreementTable({ agreements, loading, onRenew, onCreateFirst }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Column headers */}
      <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-[9px] font-black uppercase tracking-wider text-gray-400">
        <div className="col-span-3">TENANT</div>
        <div className="col-span-3">PROPERTY</div>
        <div className="col-span-2">PERIOD</div>
        <div className="col-span-1">RENT</div>
        <div className="col-span-2">STATUS</div>
        <div className="col-span-1 text-right">ACTIONS</div>
      </div>

      <div className="divide-y divide-gray-50">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <RowSkeleton key={i}/>)
        ) : agreements.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📄</p>
            <p className="text-gray-600 font-semibold">No agreements yet.</p>
            <button
              onClick={onCreateFirst}
              className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 transition"
            >
              Create First Lease
            </button>
          </div>
        ) : (
          agreements.map(a => (
            <AgreementRow key={a.id} agreement={a} onRenew={onRenew}/>
          ))
        )}
      </div>
    </div>
  );
}