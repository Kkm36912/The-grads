import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, BrainCircuit, Timer, Zap, ArrowRight, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

export default function HomeSection({user}) {
  // ================= STATE & DATA =================
  const [currentSlide, setCurrentSlide] = useState(0);

  const updates = [
    {
      tag: "SYSTEM UPDATE",
      title: "Platform V2.0 Beta is Live",
      desc: "Experience the new gamified growth engine and advanced compiler analytics.",
      date: "April 6, 2026",
      color: "cyan"
    },
    {
      tag: "COMMUNITY",
      title: "Global Logic Championship",
      desc: "Registrations are now open. Compete globally for top leaderboard spots.",
      date: "April 10, 2026",
      color: "magenta"
    },
    {
      tag: "NEW CONTENT",
      title: "Advanced System Design Module",
      desc: "Master distributed systems, load balancing, and database scaling.",
      date: "April 15, 2026",
      color: "cyan"
    }
  ];

  // Auto-play logic for the slider
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev === updates.length - 1 ? 0 : prev + 1));
    }, 5000); 
    return () => clearInterval(timer);
  }, [updates.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev === updates.length - 1 ? 0 : prev + 1));
  const prevSlide = () => setCurrentSlide((prev) => (prev === 0 ? updates.length - 1 : prev - 1));

  // Dynamic Button Styling based on the active slide's color
  const activeColor = updates[currentSlide].color;
  const navButtonTheme = activeColor === 'magenta'
    ? 'text-grads-magenta bg-grads-magenta/10 hover:bg-grads-magenta/20 hover:shadow-[0_0_20px_rgba(224,82,255,0.4)] border border-grads-magenta/30'
    : 'text-grads-cyan bg-grads-cyan/10 hover:bg-grads-cyan/20 hover:shadow-[0_0_20px_rgba(20,184,196,0.4)] border border-grads-cyan/30';

  return (
    <div className="flex flex-col gap-12 pb-20">

      {/* ================= 0. DYNAMIC WELCOME HEADER ================= */}
      <motion.section 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mt-5">
          Welcome, <span className="text-grads-cyan">{user?.fullName || 'Kaustubh Mishra'}</span>
        </h1>
      </motion.section>
      
      {/* ================= 1. THE SLEEK UPDATES SLIDER ================= */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-wide">News & Updates</h2>
            <p className="text-sm text-slate-400 mt-1">Latest intel from The Grads network.</p>
          </div>
        </div>

        {/* Full-Width Slider Container - Added slight height flex for mobile text wrapping */}
        <div className="relative w-full h-[260px] md:h-[240px] rounded-2xl bg-[#0a1219]/60 backdrop-blur-md border border-white/5 overflow-hidden shadow-lg group">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              // RESPONSIVE PADDING: Tight on mobile (px-6), wide on desktop (px-16)
              className="absolute inset-0 px-6 py-6 md:px-16 md:py-8 flex flex-col justify-center"
            >
              {/* Subtle Background Glow */}
              <div className={`absolute top-0 right-0 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-20 ${activeColor === 'magenta' ? 'bg-grads-magenta' : 'bg-grads-cyan'}`}></div>

              <div className="relative z-10 max-w-3xl">
                {/* RESPONSIVE TAG FONT */}
                <span className={`text-[9px] md:text-[11px] font-mono font-bold tracking-widest uppercase px-2 py-0.5 md:px-2.5 md:py-1 rounded mb-3 md:mb-4 inline-block ${activeColor === 'magenta' ? 'text-grads-magenta bg-grads-magenta/10' : 'text-grads-cyan bg-grads-cyan/10'}`}>
                  {updates[currentSlide].tag} • {updates[currentSlide].date}
                </span>
                
                {/* RESPONSIVE TITLE FONT: 2xl on mobile, 4xl on desktop */}
                <h3 className="text-2xl md:text-4xl font-display font-bold text-white mb-2 md:mb-3 leading-tight">{updates[currentSlide].title}</h3>
                
                {/* RESPONSIVE DESC FONT: xs on mobile, base on desktop with line-clamp protection */}
                <p className="text-xs md:text-base text-slate-300 leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-none">{updates[currentSlide].desc}</p>
                
                {/* RESPONSIVE BUTTON FONT */}
                <button className={`mt-4 md:mt-6 flex items-center gap-2 text-xs md:text-sm font-bold transition-colors ${activeColor === 'magenta' ? 'text-grads-magenta hover:text-white' : 'text-grads-cyan hover:text-white'}`}>
                  Read Dispatch <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Slider Controls (Edges, Glowing, Hover-Only) - Hidden on mobile so they don't block text */}
          <div className="absolute top-1/2 -translate-y-1/2 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 hidden md:block">
            <button onClick={prevSlide} className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${navButtonTheme}`}>
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 hidden md:block">
            <button onClick={nextSlide} className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center transition-all duration-300 ${navButtonTheme}`}>
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Minimalist Navigation Dots */}
          <div className="absolute bottom-4 md:bottom-5 left-1/2 -translate-x-1/2 flex gap-2 md:gap-2.5 z-20">
            {updates.map((_, idx) => (
              <button 
                key={idx} 
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all duration-300 rounded-full ${currentSlide === idx ? 'w-6 md:w-8 h-1 md:h-1.5 bg-white' : 'w-1.5 md:w-1.5 h-1 md:h-1.5 bg-white/30 hover:bg-white/50'}`}
              />
            ))}
          </div>

        </div>
      </section>

      {/* ================= 2. SLEEK DAILY OPERATIONS ================= */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-display font-bold text-white tracking-wide">Daily Operations</h2>
          <p className="text-sm text-slate-400 mt-1">Your mandated tasks to protect your streak.</p>
        </div>

        <div className="flex flex-col gap-5">
          
          {/* CYAN TASK: Coding Challenge */}
          <motion.div 
            whileHover={{ x: 4 }}
            // RESPONSIVE PADDING for the cards
            className="w-full relative px-6 py-5 md:px-8 md:py-6 rounded-xl bg-[#0a1219]/40 border border-white/5 hover:border-grads-cyan/30 transition-all duration-300 group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-grads-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-4 md:gap-6">
              {/* RESPONSIVE ICON CONTAINER */}
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-grads-teal/10 border border-grads-cyan/20 flex items-center justify-center text-grads-cyan group-hover:scale-110 transition-transform">
                <Terminal className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h4 className="text-[10px] md:text-[11px] font-mono text-grads-cyan uppercase tracking-widest">Algorithm • Daily</h4>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 bg-red-500/10 text-red-400 text-[10px] md:text-[11px] font-mono rounded">
                    <Flame className="w-3 h-3 md:w-3.5 md:h-3.5" /> Hard
                  </span>
                </div>
                {/* RESPONSIVE FONT */}
                <h3 className="text-lg md:text-xl font-bold text-slate-200 group-hover:text-white transition-colors">Graph Traversal: Alien Dictionary</h3>
              </div>
            </div>

            <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-5">
              <div className="flex items-center gap-6 md:gap-8">
                <div className="flex flex-col items-center">
                  <Timer className="w-4 h-4 md:w-5 md:h-5 text-slate-500 mb-1" />
                  <span className="text-[10px] md:text-xs font-mono text-slate-400">45 Mins</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-grads-cyan mb-1" />
                  <span className="text-[10px] md:text-xs font-mono text-grads-cyan">150 EXP</span>
                </div>
              </div>
              
              <button className="px-6 py-2.5 md:px-8 md:py-3 rounded-lg bg-[#040a0f] border border-grads-cyan/30 text-grads-cyan font-bold hover:bg-grads-cyan hover:text-[#03070b] hover:shadow-[0_0_20px_rgba(20,184,196,0.3)] transition-all duration-300 text-sm md:text-base">
                Execute
              </button>
            </div>
          </motion.div>

          {/* MAGENTA TASK: Aptitude Challenge */}
          <motion.div 
            whileHover={{ x: 4 }}
            className="w-full relative px-6 py-5 md:px-8 md:py-6 rounded-xl bg-[#0a1219]/40 border border-white/5 hover:border-grads-magenta/30 transition-all duration-300 group flex flex-col md:flex-row items-start md:items-center justify-between gap-4 overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-grads-magenta opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-xl bg-grads-magenta/10 border border-grads-magenta/20 flex items-center justify-center text-grads-magenta group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-5 h-5 md:w-6 md:h-6" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h4 className="text-[10px] md:text-[11px] font-mono text-grads-magenta uppercase tracking-widest">Quantitative • Daily</h4>
                  <span className="flex items-center gap-1.5 px-2 py-0.5 md:px-2.5 bg-amber-500/10 text-amber-400 text-[10px] md:text-[11px] font-mono rounded">
                    <Flame className="w-3 h-3 md:w-3.5 md:h-3.5" /> Medium
                  </span>
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-200 group-hover:text-white transition-colors">Probability: The Bayesian Trap</h3>
              </div>
            </div>

            <div className="flex items-center gap-6 md:gap-10 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-white/5 pt-4 md:pt-5">
              <div className="flex items-center gap-6 md:gap-8">
                <div className="flex flex-col items-center">
                  <Timer className="w-4 h-4 md:w-5 md:h-5 text-slate-500 mb-1" />
                  <span className="text-[10px] md:text-xs font-mono text-slate-400">20 Mins</span>
                </div>
                <div className="flex flex-col items-center">
                  <Zap className="w-4 h-4 md:w-5 md:h-5 text-grads-magenta mb-1" />
                  <span className="text-[10px] md:text-xs font-mono text-grads-magenta">50 EXP</span>
                </div>
              </div>
              
              <button className="px-6 py-2.5 md:px-8 md:py-3 rounded-lg bg-[#040a0f] border border-grads-magenta/30 text-grads-magenta font-bold hover:bg-grads-magenta hover:text-[#03070b] hover:shadow-[0_0_20px_rgba(224,82,255,0.3)] transition-all duration-300 text-sm md:text-base">
                Analyze
              </button>
            </div>
          </motion.div>

        </div>
      </section>

    </div>
  );
}