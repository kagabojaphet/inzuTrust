import React, { useState } from 'react';
import Typewriter from 'typewriter-effect';
import { HiArrowRight, HiSearch, HiCheckCircle, HiShieldCheck } from "react-icons/hi";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const Hero = ({ images }) => {
  const [isWordComplete, setIsWordComplete] = useState(false);

  return (
    <section className="relative w-full pt-12 pb-20 overflow-hidden bg-white">
      <div className="w-full px-6 md:px-12 grid md:grid-cols-2 items-center gap-10">
        <div className="z-10 text-left flex flex-col items-start">
      
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-slate-900 text-left">
            Digitally Manage <br /> Rentals with <br />
            <span className={`inline-block min-h-[1.2em] transition-colors duration-300 ${isWordComplete ? 'text-brand-green-mid' : 'text-brand-blue-bright'}`}>
              <Typewriter
                onInit={(typewriter) => {
                  const words = ['Confidence', 'Security', 'Ease', 'Trust'];
                  words.forEach((word) => {
                    typewriter
                      .typeString(word)
                      .callFunction(() => setIsWordComplete(true))
                      .pauseFor(2000)
                      .callFunction(() => setIsWordComplete(false))
                      .deleteAll()
                      .start();
                  });
                }}
                options={{
                  autoStart: true,
                  loop: true,
                  deleteSpeed: 50,
                  cursor: '|'
                }}
              />
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-black mb-10 max-w-xl text-left">
            The all-in-one platform for secure payments, digital leases, and tenant trust scores. 
            Building a transparent rental ecosystem for Rwanda.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-start mb-8">
            <button className="bg-brand-blue-bright text-white font-bold px-8 py-4 rounded-lg shadow-lg flex items-center gap-3">
              Get Started <HiArrowRight />
            </button>
            <button className="bg-white border border-slate-200 text-slate-800 font-bold px-8 py-4 rounded-lg flex items-center gap-3">
              <HiSearch className="text-brand-blue-bright" /> Browse Rentals
            </button>
          </div>

          {/* Social Proof */}
          <div className="flex items-center gap-3 justify-start">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 overflow-hidden ring-1 ring-slate-100">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User avatar" />
                </div>
              ))}
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm">
                +2k
              </div>
            </div>
            <p className="text-slate-500 font-bold text-sm tracking-tight">
              Join 2,000+ happy tenants & landlords
            </p>
          </div>
        </div>

        {/* Image Side with Left-Aligned Badge Content */}
        <div className="relative flex justify-center md:justify-end">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-brand-blue-bright opacity-25 rounded-full blur-[120px] z-0" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-brand-green-mid opacity-20 rounded-full blur-[120px] z-0" />

          <div className="relative z-10 w-full max-w-2xl transform md:scale-110 overflow-hidden rounded-2xl shadow-2xl border-4 border-white">
            
            {/* Trust Score Badge - Internal Content Left Aligned */}
            <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 min-w-[160px]">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <HiShieldCheck className="text-brand-blue-bright text-2xl" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-[10px] font-bold text-slate-400 tracking-tighter leading-none mb-1">Trust Score</p>
                <p className="text-sm font-black text-slate-900 leading-none">Excellent (87%)</p>
              </div>
            </div>

            <Swiper modules={[Autoplay, EffectFade]} effect='fade' autoplay={{ delay: 3000 }} loop className="w-full h-[300px] md:h-[450px]">
              {images.map((img, i) => (
                <SwiperSlide key={i}>
                  <img src={img} className="w-full h-full object-cover" alt="Property" />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Status Badge - Internal Content Left Aligned */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 min-w-[180px]">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <HiCheckCircle className="text-brand-green-mid text-2xl" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-[10px] font-bold text-slate-400 tracking-tighter leading-none mb-1">Status</p>
                <p className="text-sm font-black text-slate-900 leading-none">Payment Verified</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;