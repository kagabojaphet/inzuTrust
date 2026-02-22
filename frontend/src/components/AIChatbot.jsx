import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineChatAlt2, HiX, HiPaperAirplane } from "react-icons/hi";

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // New state for delayed entry
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hello! I am the InzuTrust Assistant. Ask me about our Mission, Vision, or Services." }
  ]);
  
  const scrollRef = useRef(null);

  // Phase 1: Delayed Entry - Icon appears after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000); // 3-second delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const KNOWLEDGE_BASE = {
    mission: "Our mission is to make renting secure, transparent, and easy for everyone in East Africa.",
    vision: "Our vision is to be the leading digital trust platform, empowering landlords and tenants with verified data.",
    services: "We provide real-time messaging, virtual tours, smart scheduling, and premium support.",
    fallback: "I am only trained to answer questions about InzuTrust's Mission, Vision, and Services. Please ask me about those topics!"
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);

    const query = input.toLowerCase();
    let botReply = KNOWLEDGE_BASE.fallback;

    if (query.includes("mission") || query.includes("goal")) botReply = KNOWLEDGE_BASE.mission;
    if (query.includes("vision") || query.includes("future")) botReply = KNOWLEDGE_BASE.vision;
    if (query.includes("service") || query.includes("offer")) botReply = KNOWLEDGE_BASE.services;

    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'bot', text: botReply }]);
    }, 500);
    setInput("");
  };

  // If the timer hasn't finished, show nothing
  if (!isVisible) return null;

  return (
    /* Fix: Lowered Z-index of the outer container so it doesn't block the Navbar */
    <div className="fixed bottom-8 right-8 z-[50] font-sans text-left">
      
      {isOpen && (
        /* Chat window adjusted to ensure it stays below fixed navigation bars if necessary */
        <div className="absolute bottom-20 right-0 w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 z-[60]">
          
          {/* Header using Brand Blue */}
          <div className="bg-blue-600 p-6 text-white flex justify-between items-center shadow-md">
            <h4 className="font-black text-lg tracking-tight">InzuTrust AI</h4>
            <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
              <HiX className="text-xl" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 p-4 bg-slate-50 overflow-y-auto space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'bot' ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-semibold leading-relaxed shadow-sm ${
                  msg.role === 'bot' ? 'bg-white text-slate-700 rounded-tl-none border border-slate-100' : 'bg-blue-600 text-white rounded-tr-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-slate-100 flex gap-2">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about our Vision..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20"
            />
            <button onClick={handleSend} className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
              <HiPaperAirplane />
            </button>
          </div>
        </div>
      )}

      {/* Blue Trigger Button with Icons */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all text-white active:scale-95 animate-in zoom-in-0 duration-500"
      >
        {isOpen ? (
          <HiX className="text-3xl" />
        ) : (
          <HiOutlineChatAlt2 className="text-3xl" />
        )}
      </button>
    </div>
  );
};

export default AIChatbot;