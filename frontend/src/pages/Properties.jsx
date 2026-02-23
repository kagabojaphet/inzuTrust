import React, { useState } from 'react';
import { HiOutlineLocationMarker, HiOutlineAdjustments, HiOutlineSearch, HiCheck, HiX, HiShieldCheck, HiPlus, HiDuplicate } from "react-icons/hi";

const Properties = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);
  const [comparisonList, setComparisonList] = useState([]);

  const propertyList = [
    {
      id: 1,
      title: "Luxury Villa - Vision City",
      price: 2500000,
      level: "High",
      trustScore: 98,
      province: "Kigali",
      sector: "Gacuriro",
      cell: "Rukiri",
      img: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 2,
      title: "Modern Apartment",
      price: 450000,
      level: "Medium",
      trustScore: 85,
      province: "Kigali",
      sector: "Kicukiro",
      cell: "Niboye",
      img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop"
    },
    {
      id: 3,
      title: "Cozy Studio Hub",
      price: 150000,
      level: "Low",
      trustScore: 92,
      province: "Kigali",
      sector: "Nyarugenge",
      cell: "Kiyovu",
      img: "https://images.unsplash.com/photo-1536376074432-af715b91c683?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const toggleComparison = (property) => {
    if (comparisonList.find(p => p.id === property.id)) {
      setComparisonList(comparisonList.filter(p => p.id !== property.id));
    } else if (comparisonList.length < 3) {
      setComparisonList([...comparisonList, property]);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-32">
      {/* 1. Header */}
      <section className="pt-32 pb-16 px-6 md:px-12 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#0F172A] mb-10 tracking-tight leading-tight">
            Discover Your <br/><span className="text-brand-blue-bright">Perfect Trust-Match.</span>
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-2 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-100">
            <div className="flex-grow relative w-full">
              <HiOutlineSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 text-2xl" />
              <input 
                type="text" 
                placeholder="Search by Sector, Cell or Property..." 
                className="w-full pl-16 pr-6 py-5 bg-transparent outline-none font-medium text-lg text-slate-800 placeholder:text-slate-400"
              />
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`w-full md:w-auto px-10 py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
                showFilters ? 'bg-slate-100 text-slate-900' : 'bg-brand-blue-bright text-white hover:shadow-lg hover:shadow-brand-blue-bright/30'
              }`}
            >
              {showFilters ? <HiX className="text-2xl" /> : <HiOutlineAdjustments className="text-2xl" />}
              {showFilters ? 'Close' : 'Filters'}
            </button>
          </div>
        </div>
      </section>

      {/* 2. Filter Bar */}
      <section className="py-5 px-6 md:px-12 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
            {['All', 'Low', 'Medium', 'High'].map((level) => (
              <button
                key={level}
                onClick={() => setActiveFilter(level)}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 whitespace-nowrap ${
                  activeFilter === level ? 'bg-brand-green-mid text-black shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                {level} Level
              </button>
            ))}
          </div>
          <span className="hidden md:block text-sm font-bold text-slate-400">
            Comparing <span className="text-brand-blue-bright">{comparisonList.length}/3</span> Properties
          </span>
        </div>
      </section>

      {/* 3. Property Grid */}
      <section className="py-16 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {propertyList.map((item) => {
            const isComparing = comparisonList.find(p => p.id === item.id);
            return (
              <div key={item.id} className="group bg-white rounded-[32px] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 flex flex-col relative">
                
                {/* Image & Overlays */}
                <div className="relative aspect-[4/3] overflow-hidden m-3 rounded-[24px]">
                  <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  {/* Compare Toggle Button */}
                  <button 
                    onClick={() => toggleComparison(item)}
                    className={`absolute top-4 right-4 p-3 rounded-full backdrop-blur-md transition-all border ${
                      isComparing 
                      ? 'bg-brand-blue-bright text-white border-white/20 scale-110 shadow-lg' 
                      : 'bg-white/80 text-slate-600 border-white/50 hover:bg-white'
                    }`}
                  >
                    {isComparing ? <HiCheck className="text-xl" /> : <HiPlus className="text-xl" />}
                  </button>

                  <div className="absolute top-4 left-4">
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md border border-white/20 shadow-sm ${
                      item.level === 'High' ? 'bg-brand-blue-bright/90 text-white' : 'bg-brand-green-mid/90 text-black'
                    }`}>
                      {item.level} Level
                    </span>
                  </div>
                  
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-2xl border border-slate-100 shadow-xl">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-brand-green-mid animate-pulse" />
                        <span className="text-[11px] font-black text-slate-900">{item.trustScore}% Trust</span>
                      </div>
                  </div>
                </div>
                
                <div className="p-6 pt-2 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-blue-bright transition-colors">{item.title}</h3>
                    <HiShieldCheck className="text-brand-blue-bright text-2xl shrink-0" />
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 font-medium mb-6">
                    <HiOutlineLocationMarker className="text-brand-blue-bright" />
                    <span className="text-sm">{item.cell}, {item.sector}</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none mb-1">Monthly</p>
                      <p className="text-xl font-extrabold text-slate-900">RWF {item.price.toLocaleString()}</p>
                    </div>
                    <button className="bg-[#0F172A] p-4 text-white rounded-2xl hover:bg-brand-blue-bright transition-all">
                      <HiCheck className="text-brand-green-mid text-xl" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Comparison Drawer */}
      {comparisonList.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-4xl">
          <div className="bg-[#0F172A] rounded-[32px] p-6 shadow-2xl shadow-black/40 border border-white/10 animate-in slide-in-from-bottom-10 duration-500">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-grow flex gap-4 overflow-x-auto no-scrollbar py-1">
                {comparisonList.map(prop => (
                  <div key={prop.id} className="flex items-center gap-3 bg-white/10 p-2 pr-4 rounded-2xl border border-white/5 min-w-[240px]">
                    <img src={prop.img} className="w-12 h-12 rounded-xl object-cover border border-white/20" alt="" />
                    <div className="overflow-hidden">
                      <p className="text-white font-bold text-sm truncate">{prop.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-brand-green-mid text-[10px] font-black uppercase">{prop.trustScore}% Trust</span>
                        <span className="text-slate-400 text-[10px] truncate">RWF {prop.price.toLocaleString()}</span>
                      </div>
                    </div>
                    <button onClick={() => toggleComparison(prop)} className="text-white/40 hover:text-white ml-auto">
                      <HiX />
                    </button>
                  </div>
                ))}
                {comparisonList.length < 3 && (
                  <div className="flex items-center justify-center gap-2 px-6 border-2 border-dashed border-white/10 rounded-2xl text-white/20 italic text-sm min-w-[200px]">
                    Add one more...
                  </div>
                )}
              </div>
              
              <div className="flex gap-3 shrink-0">
                <button 
                  disabled={comparisonList.length < 2}
                  className="bg-brand-blue-bright disabled:bg-slate-700 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105"
                >
                  <HiDuplicate className="text-xl" /> Compare Match
                </button>
                <button onClick={() => setComparisonList([])} className="p-4 rounded-2xl bg-white/5 text-white/60 hover:text-white border border-white/5">
                  Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};

export default Properties;