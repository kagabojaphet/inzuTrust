import React, { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";

const Board = () => {

  const [selectedMember, setSelectedMember] = useState(null);

  const boardMembers = [
    {
      name: "INEMA Henry ",
      title: "Co-Founder & CEO",
      focus: "Finance & Product Strategy",
      bio: "Founder of InzuTrust focused on transforming Rwanda’s rental ecosystem through digital trust infrastructure with 2 years of experience in fintech and as a quality engineer.",
      desc: "Henry leads the vision, partnerships, and strategic growth of InzuTrust. His mission is to modernize Rwanda’s housing ecosystem through transparency, digital trust, and secure rental infrastructure.",
      img: "/images/dx.jpeg",
    },

    {
      name: "IRADUKUNDA Japhet",
      title: "Co-Founder& Chief Technology Officer",
      focus: "Technology & Platform Engineering",
      bio: "Full-stack developer responsible for platform architecture and infrastructure scalability.",
      desc: "Japhet oversees backend systems, dashboard infrastructure, platform security, and engineering scalability to ensure a reliable and secure user experience.",
      img: "/images/japhet.jpeg",
    },

    {
      name: "Hadidja",
      title: "Chief Operations Officer",
      focus: "Operations & User Experience",
      bio: "Operations lead focused on onboarding systems, ecosystem coordination, and user experience.",
      desc: "Hadidja coordinates platform operations, user workflows, onboarding systems, and ensures smooth interaction between tenants, landlords, and agents.",
      img: "/images/hadidja.jpeg",
    },
  ];

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#f8fafc] pt-32 px-6 md:px-12 lg:px-20">

        {/* HEADER */}
        <div className="max-w-7xl mx-auto mb-20 text-center">

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-6xl font-black tracking-tight text-slate-900"
          >
            NEXT-GEN Tech Ltd
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-slate-500 text-lg mt-6 max-w-3xl mx-auto leading-relaxed"
          >
            Meet the people building trusted digital rental infrastructure
            for Rwanda through innovation, transparency, and secure technology.
          </motion.p>

        </div>

        {/* BOARD MEMBERS */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-10 pb-24">

          {boardMembers.map((member, index) => (

            <motion.div
              key={index}
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition-all duration-300"
            >

              {/* IMAGE */}
              <div className="relative overflow-hidden">

                <img
                  src={member.img}
                  alt={member.name}
                  className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              </div>

              {/* CONTENT */}
              <div className="p-8">

                <h2 className="text-3xl font-black tracking-tight text-slate-900">
                  {member.name}
                </h2>

                <p className="text-blue-600 font-bold uppercase tracking-wide text-sm mt-3">
                  {member.title}
                </p>

                <p className="text-slate-500 mt-5 leading-relaxed">
                  {member.bio}
                </p>

                <button
                  onClick={() => setSelectedMember(member)}
                  className="mt-8 inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-all"
                >
                  View Profile →
                </button>

              </div>

            </motion.div>

          ))}

        </div>

        {/* MODAL */}
        {selectedMember && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">

            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] max-w-2xl w-full overflow-hidden shadow-2xl"
            >

              {/* IMAGE */}
              <div className="relative">

                <img
                  src={selectedMember.img}
                  alt={selectedMember.name}
                  className="w-full h-[350px] object-cover"
                />

                <button
                  onClick={() => setSelectedMember(null)}
                  className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/90 text-slate-800 font-bold hover:bg-white"
                >
                  ✕
                </button>

              </div>

              {/* CONTENT */}
              <div className="p-10">

                <h2 className="text-4xl font-black tracking-tight text-slate-900">
                  {selectedMember.name}
                </h2>

                <p className="text-blue-600 font-bold uppercase tracking-wide text-sm mt-3">
                  {selectedMember.title}
                </p>

                <div className="mt-8">

                  <h3 className="font-bold text-lg text-slate-900">
                    Focus Area
                  </h3>

                  <p className="text-slate-500 mt-2">
                    {selectedMember.focus}
                  </p>

                </div>

                <div className="mt-8">

                  <h3 className="font-bold text-lg text-slate-900">
                    Biography
                  </h3>

                  <p className="text-slate-500 mt-2 leading-relaxed">
                    {selectedMember.desc}
                  </p>

                </div>

              </div>

            </motion.div>

          </div>

        )}

      </div>

      <Footer />
    </>
  );
};

export default Board;