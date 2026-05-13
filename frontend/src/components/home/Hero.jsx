import React, { useState } from 'react';
import Typewriter from 'typewriter-effect';
import {
  HiArrowRight,
  HiSearch,
  HiCheckCircle,
  HiShieldCheck
} from "react-icons/hi";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';
import { useLanguage } from '../../context/LanguageContext';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/effect-fade';

const Hero = ({ images }) => {
  const [isWordComplete, setIsWordComplete] = useState(false);
  const { t } = useLanguage();

  return (
    <section className="relative w-full pt-16 pb-20 overflow-hidden bg-[#F8FAFC]">

      <div className="w-full max-w-full px-6 md:px-12 grid md:grid-cols-2 items-center gap-10">

        {/* LEFT CONTENT */}
        <div className="z-10 text-left flex flex-col items-start min-w-0">

          <h1 className="text-3xl md:text-5xl font-semibold leading-snug mb-6 text-slate-900">
            {t("hero.titleLine1")} <br />
            {t("hero.titleLine2")} <br />

            <span
              className={`inline-block min-h-[1.2em] font-medium transition-colors duration-300 ${
                isWordComplete ? 'text-brand-green-mid' : 'text-brand-blue-bright'
              }`}
            >
              <Typewriter
                onInit={(typewriter) => {
                  const words = [
                    t("hero.confidence"),
                    t("hero.security"),
                    t("hero.ease"),
                    t("hero.trust")
                  ];

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

          <p className="text-base md:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex flex-wrap gap-4 justify-start mb-8">

            <Link
              to="/register"
              className="bg-brand-blue-bright text-white font-medium px-7 py-3 rounded-lg shadow-md flex items-center gap-3 hover:opacity-95 transition"
            >
              {t("hero.getStarted")} <HiArrowRight />
            </Link>

            <Link
              to="/properties"
              className="bg-white border border-slate-200 text-slate-700 font-medium px-7 py-3 rounded-lg flex items-center gap-3 hover:bg-slate-50 transition"
            >
              <HiSearch className="text-brand-blue-bright" />
              {t("hero.browseRentals")}
            </Link>

          </div>

          <div className="flex items-center gap-3 justify-start">
            <div className="flex -space-x-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full border-2 border-white bg-slate-200 overflow-hidden ring-1 ring-slate-100"
                >
                  <img
                    src={`https://i.pravatar.cc/100?img=${i + 10}`}
                    alt="User avatar"
                  />
                </div>
              ))}

              <div className="w-9 h-9 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-medium text-slate-600 shadow-sm">
                +2k
              </div>
            </div>

            <p className="text-slate-500 font-medium text-sm">
              {t("hero.joinUsers")}
            </p>
          </div>
        </div>

        {/* RIGHT SIDE (FIXED OVERFLOW) */}
        <div className="relative flex justify-center md:justify-end min-w-0 overflow-hidden">

          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-brand-blue-bright opacity-25 rounded-full blur-[120px] z-0" />
          <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-brand-green-mid opacity-20 rounded-full blur-[120px] z-0" />

          {/* CRITICAL FIX: min-w-0 + max-w-full + overflow-hidden */}
          <div className="relative z-10 w-full max-w-full md:max-w-2xl overflow-hidden rounded-2xl shadow-2xl border-4 border-white min-w-0">

            {/* TOP BADGE */}
            <div className="absolute top-6 right-6 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 min-w-[160px] max-w-full">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <HiShieldCheck className="text-brand-blue-bright text-2xl" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-[10px] font-medium text-slate-400 leading-none mb-1">
                  {t("hero.trustScore")}
                </p>
                <p className="text-sm font-semibold text-slate-900 leading-none">
                  {t("hero.excellent")} (87%)
                </p>
              </div>
            </div>

            <Swiper
              modules={[Autoplay, EffectFade]}
              effect="fade"
              autoplay={{ delay: 3000 }}
              loop
              className="w-full h-[300px] md:h-[450px]"
            >
              {images.map((img, i) => (
                <SwiperSlide key={i} className="w-full min-w-0">
                  <img
                    src={img}
                    className="w-full h-full object-cover block"
                    alt="Property"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* BOTTOM BADGE */}
            <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-100 flex items-center gap-3 min-w-[180px] max-w-full">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                <HiCheckCircle className="text-brand-green-mid text-2xl" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-[10px] font-medium text-slate-400 leading-none mb-1">
                  {t("hero.status")}
                </p>
                <p className="text-sm font-semibold text-slate-900 leading-none">
                  {t("hero.paymentVerified")}
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;