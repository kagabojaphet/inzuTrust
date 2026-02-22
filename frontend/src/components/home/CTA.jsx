import React from 'react';
import { HiArrowRight } from "react-icons/hi";

const CTA = () => {
  return (
    /* Full-width section with no outer padding to reach edges */
    <section className="w-full relative overflow-hidden h-[600px] flex items-center justify-center">
      
      {/* Background Image Layer (Cityscape) */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />

      {/* Blue Theme Overlay */}
      <div className="absolute inset-0 bg-blue-600/90 mix-blend-multiply z-10"></div>

      {/* Content Container */}
      <div className="relative z-20 text-center text-white px-6 md:px-12 max-w-5xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">
          Ready to upgrade your rental experience?
        </h2>
        
        <p className="text-xl md:text-2xl font-semibold opacity-80 mb-12 max-w-3xl mx-auto leading-relaxed">
          Join thousands of tenants and landlords in Rwanda who are enjoying a safer, 
          faster, and more transparent rental process.
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-10">
          {/* Main Action Button with rounded-lg */}
          <button className="bg-white text-blue-600 font-black px-12 py-5 rounded-lg text-lg shadow-2xl hover:bg-slate-50 transition-all transform hover:-translate-y-1">
            Get Started for Free
          </button>
          
          {/* Secondary Link */}
          <button className="flex items-center gap-3 text-white font-black text-lg hover:gap-5 transition-all group">
            Contact Sales 
            <HiArrowRight className="text-2xl transition-transform" /> 
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;