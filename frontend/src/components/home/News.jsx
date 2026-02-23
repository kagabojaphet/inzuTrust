import React, { useState, useEffect } from 'react';
import { HiOutlineArrowNarrowRight, HiChevronLeft, HiChevronRight } from "react-icons/hi";

const News = () => {
  const [currentPage, setCurrentPage] = useState(0);

  const articles = [
    {
      id: 1,
      category: "Market Trends",
      date: "Feb 18, 2026",
      title: "The Rise of Digital Property Management",
      desc: "Exploring how tech and digital verification are reshaping the rental landscape in Kigali.",
      image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=1073&auto=format&fit=crop",
      gradient: "from-cyan-500/90 to-blue-800/90"
    },
    {
      id: 2,
      category: "Tenant Tips",
      date: "Feb 10, 2026",
      title: "Improve Your Tenant Trust Score",
      desc: "A guide on how consistent digital payments help you unlock premium housing options.",
      image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?q=80&w=687&auto=format&fit=crop",
      gradient: "from-blue-600/90 to-indigo-950/90"
    },
    {
      id: 3,
      category: "Updates",
      date: "Jan 25, 2026",
      title: "New Banking Partnership for Payments",
      desc: "Our latest integration makes rent collection seamless for professional landlords.",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=1170&auto=format&fit=crop",
      gradient: "from-blue-800/95 to-blue-900/95"
    },
    {
      id: 4,
      category: "Legal",
      date: "Jan 12, 2026",
      title: "Understanding New Rental Laws",
      desc: "Key takeaways from the ministerial order regarding selected housing services.",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1170&auto=format&fit=crop",
      gradient: "from-slate-700/90 to-slate-950/90"
    },
    {
      id: 5,
      category: "Community",
      date: "Jan 05, 2026",
      title: "Safe Living Initiatives in Kigali",
      desc: "How neighborhood watch integrations are improving tenant security scores.",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1170&auto=format&fit=crop",
      gradient: "from-emerald-600/90 to-blue-900/90"
    },
    {
      id: 6,
      category: "Finance",
      date: "Dec 28, 2025",
      title: "Micro-loans for Security Deposits",
      desc: "New financial products designed to help verified tenants move in faster.",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1170&auto=format&fit=crop",
      gradient: "from-blue-500/90 to-indigo-800/90"
    }
  ];

  const totalPages = Math.ceil(articles.length / 3);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000); 
    return () => clearInterval(timer);
  }, [totalPages]);

  return (
    <section className="w-full py-24 bg-white font-sans overflow-hidden">
      {/* Header - Changed from flex-justify-between to flex-col/start for left alignment */}
      <div className="w-full px-6 md:px-12 mb-16 flex flex-col items-start gap-8">
        <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight text-left">
          Latest News & Insights
        </h2>
        
        {/* Navigation buttons aligned left */}
        <div className="flex gap-4">
          <button 
            onClick={() => setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages)}
            className="w-12 h-12 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-md shadow-slate-200/50"
          >
            <HiChevronLeft className="text-2xl" />
          </button>
          <button 
            onClick={() => setCurrentPage((prev) => (prev + 1) % totalPages)}
            className="w-12 h-12 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-md shadow-slate-200/50"
          >
            <HiChevronRight className="text-2xl" />
          </button>
        </div>
      </div>

      <div className="w-full px-6 md:px-12">
        <div 
          className="flex transition-transform duration-1000 ease-in-out"
          style={{ transform: `translateX(-${currentPage * 100}%)` }}
        >
          <div className="flex min-w-full gap-8">
            {articles.map((post) => (
              <article 
                key={post.id} 
                className="group relative h-[520px] w-1/3 min-w-[calc(33.333%-22px)] rounded-lg border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden cursor-pointer flex flex-col"
              >
                <img 
                  src={post.image} 
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  alt=""
                />

                <div className={`absolute inset-0 bg-gradient-to-b ${post.gradient} opacity-90 group-hover:opacity-85 transition-opacity`}></div>
                
                <div className="relative h-full w-full flex flex-col p-10 text-white z-10 text-left">
                  <span className="text-xs font-black uppercase tracking-[0.2em] mb-6 opacity-80">
                    {post.category} • {post.date}
                  </span>
                  
                  <h3 className="text-3xl font-black mb-6 leading-tight tracking-tight">
                    {post.title}
                  </h3>
                  
                  <p className="text-lg font-medium leading-relaxed opacity-90 mb-8">
                    {post.desc}
                  </p>

                  <div className="mt-auto -mx-10 -mb-10 overflow-hidden">
                    <div className="transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                      <button className="w-full bg-slate-900/90 backdrop-blur-md text-white py-6 px-10 flex items-center justify-between font-black text-sm uppercase tracking-widest border-t border-white/10">
                        Learn More 
                        <HiOutlineArrowNarrowRight className="text-2xl" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Page Indicators - Aligned Left */}
      <div className="w-full px-6 md:px-12 flex justify-start gap-2 mt-12">
        {[...Array(totalPages)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 transition-all duration-500 rounded-full ${currentPage === i ? 'w-8 bg-slate-900' : 'w-2 bg-slate-200'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default News;