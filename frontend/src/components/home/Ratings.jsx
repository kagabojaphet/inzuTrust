import React from 'react';
import { HiStar } from "react-icons/hi";
import { useLanguage } from '../../context/LanguageContext';

// Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/pagination';

const Ratings = () => {
  const { t } = useLanguage();

  const ratingData = [
    {
      title: t("ratings.topRatedHouses"),
      count: "1,200+",
      tag: t("ratings.verifiedQuality")
    },
    {
      title: t("ratings.verifiedTenants"),
      count: "8,500+",
      tag: t("ratings.highTrustScore")
    },
    {
      title: t("ratings.trustedLandlords"),
      count: "450+",
      tag: t("ratings.reliableService")
    },
    {
      title: "Active Agents",
      count: "120+",
      tag: "Verified Professionals"
    }
  ];

  const peopleReviews = [
    {
      name: "Patrick N.",
      role: "Tenant",
      img: "https://i.pravatar.cc/100?img=12",
      text: "Found a house in 2 days. Smooth process and fully transparent."
    },
    {
      name: "Linda M.",
      role: "Landlord",
      img: "https://i.pravatar.cc/100?img=32",
      text: "Managing properties is easier now. Reliable tenants every time."
    },
    {
      name: "Kevin R.",
      role: "Agent",
      img: "https://i.pravatar.cc/100?img=45",
      text: "Closing deals faster with clean and efficient communication tools."
    },
    {
      name: "Sarah K.",
      role: "Tenant",
      img: "https://i.pravatar.cc/100?img=56",
      text: "No fake listings. Everything I visited was accurate and real."
    },
    {
      name: "David B.",
      role: "Landlord",
      img: "https://i.pravatar.cc/100?img=22",
      text: "Steady rental demand and verified tenants improved my income."
    }
  ];

  return (
    <section className="w-full py-20 bg-white font-sans">

      {/* 📊 STATS CARDS (MORE PROFESSIONAL TYPOGRAPHY) */}
      <div className="w-full px-6 md:px-12 grid grid-cols-1 md:grid-cols-4 gap-8">

        {ratingData.map((item, index) => (
          <div
            key={index}
            className="h-[260px] bg-white p-8 rounded-lg border border-slate-200 shadow-xl shadow-slate-200/30 hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 flex flex-col"
          >
            <div className="flex gap-1 mb-6">
              {[...Array(5)].map((_, i) => (
                <HiStar key={i} className="text-yellow-400 text-xl" />
              ))}
            </div>

            <h3 className="text-3xl font-semibold text-slate-900 mb-2 tracking-tight">
              {item.count}
            </h3>

            <p className="text-base font-medium text-slate-700 mb-4 leading-relaxed">
              {item.title}
            </p>

            <div className="mt-auto">
              <span className="inline-block bg-slate-50 text-brand-blue-bright text-xs font-medium px-4 py-1.5 rounded-lg border border-slate-100 uppercase tracking-wide">
                {item.tag}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 👇 REVIEW CAROUSEL (UNCHANGED) */}
      <div className="w-full px-6 md:px-12 mt-16">

        <Swiper
          modules={[Autoplay, Pagination]}
          autoplay={{ delay: 3500 }}
          loop
          pagination={{ clickable: true }}
          spaceBetween={20}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }}
        >

          {peopleReviews.map((person, index) => (
            <SwiperSlide key={index}>

              <div className="h-[200px] bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:shadow-lg transition-all flex flex-col justify-between">

                <div className="flex items-center gap-4">

                  <img
                    src={person.img}
                    alt={person.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-white shadow"
                  />

                  <div>
                    <p className="text-slate-900 font-medium text-sm">
                      {person.name}
                    </p>
                    <p className="text-slate-500 text-xs">
                      {person.role}
                    </p>
                  </div>

                  <div className="ml-auto flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <HiStar key={i} className="text-yellow-400 text-sm" />
                    ))}
                  </div>

                </div>

                <p className="text-slate-600 text-sm leading-relaxed mt-4">
                  “{person.text}”
                </p>

              </div>

            </SwiperSlide>
          ))}

        </Swiper>

      </div>

    </section>
  );
};

export default Ratings;