import React from 'react';
import { HiArrowRight } from "react-icons/hi";

const CTA = () => {
  return (
    /* Full-width section with height adjusted to match the scale in the reference */
    <section className="w-full relative overflow-hidden h-[500px] flex items-center justify-center">
      
      {/* Background Image Layer */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')`,
          backgroundPosition: 'center',
          backgroundSize: 'cover'
        }}
      />

      {/* Primary Color Overlay - Using brand-blue-bright */}
      <div className="absolute inset-0 bg-brand-blue-bright/90 z-10"></div>

      {/* Content Container - Centered as requested */}
      <div className="relative z-20 text-center text-white px-6 md:px-12 w-full max-w-5xl mx-auto">
        
        {/* Decreased Font Size (text-3xl to 5xl) */}
        <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight tracking-tight">
          Ready to upgrade your rental experience?
        </h2>
        
        {/* Decreased Font Size (text-lg to xl) */}
        <p className="text-lg md:text-xl font-medium opacity-90 mb-10 max-w-3xl mx-auto leading-relaxed">
          Join thousands of tenants and landlords in Rwanda who are enjoying a safer, 
          faster, and more transparent rental process.
        </p>
        
        <div className="flex flex-wrap justify-center items-center gap-8">
          {/* Action Button with rounded-lg to match FAQ CTA */}
          <button className="bg-white text-brand-blue-bright font-bold px-10 py-4 rounded-lg text-md shadow-xl hover:bg-slate-50 transition-all active:scale-95">
            Get Started for Free
          </button>
          
          {/* Secondary Link matching the reference */}
          <button className="flex items-center gap-2 text-white font-bold text-md hover:gap-4 transition-all group">
            Contact Sales 
            <HiArrowRight className="text-xl transition-transform" /> 
          </button>
        </div>
      </div>
    </section>
  );
};

export default CTA;