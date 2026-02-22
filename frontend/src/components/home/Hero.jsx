import React, { useState } from 'react';
import Typewriter from 'typewriter-effect';
import { HiArrowRight, HiSearch } from "react-icons/hi";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';

const Hero = ({ images }) => {
  // State to handle the color transition after typing finishes
  const [isWordComplete, setIsWordComplete] = useState(false);

  return (
    <section className="relative w-full pt-12 pb-20 overflow-hidden bg-white">
      <div className="w-full px-6 md:px-12 grid md:grid-cols-2 items-center gap-10">
        <div className="z-10 text-left">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 text-slate-900">
            Digitally Manage <br /> Rentals with <br />
            {/* Logic: Starts as primary blue, switches to green when isWordComplete is true */}
            <span className={`inline-block min-h-[1.2em] transition-colors duration-300 ${isWordComplete ? 'text-brand-green-mid' : 'text-brand-blue-bright'}`}>
              <Typewriter
                onInit={(typewriter) => {
                  const words = ['Confidence', 'Security', 'Ease', 'Trust'];
                  words.forEach((word) => {
                    typewriter
                      .typeString(word)
                      .callFunction(() => setIsWordComplete(true)) // Change to green when finished typing
                      .pauseFor(2000)
                      .callFunction(() => setIsWordComplete(false)) // Revert to blue for next word
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
          <p className="text-lg md:text-xl text-black mb-10 max-w-xl">
            The all-in-one platform for secure payments, digital leases, and tenant trust scores.
          </p>
          <div className="flex flex-wrap gap-4 justify-start">
            <button className="bg-brand-blue-bright text-white font-bold px-8 py-4 rounded-lg shadow-lg flex items-center gap-3">
              Get Started <HiArrowRight />
            </button>
            <button className="bg-white border border-slate-200 text-slate-800 font-bold px-8 py-4 rounded-lg flex items-center gap-3">
              <HiSearch className="text-brand-blue-bright" /> Browse Rentals
            </button>
          </div>
        </div>
        <div className="relative flex justify-center md:justify-end">
          <div className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl shadow-2xl border-4 border-white transform md:scale-110">
            <Swiper modules={[Autoplay, EffectFade]} effect='fade' autoplay={{ delay: 3000 }} loop className="w-full h-[300px] md:h-[450px]">
              {images.map((img, i) => (
                <SwiperSlide key={i}><img src={img} className="w-full h-full object-cover" alt="Property" /></SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;