import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, Code2, BrainCircuit, MessageSquare, Mic, 
  Trophy, Settings, Flame, Sparkles, Medal, Search, LogOut, CheckCircle2,
  Menu, X, Lock, Monitor, Zap, BarChart2, Crown
} from 'lucide-react';
import axios from 'axios';
import HomeSection from './HomeSection';
import CodingArena from './CodingArena';
import GamificationPanel from '../components/GamificationPanel';
// 🔥 Import them lazily instead:
const ChatBox = lazy(() => import('./ChatBox'));
const VoiceRoom = lazy(() => import('./VoiceRoom'));
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import LeaderboardModal from '../components/LeaderboardModal';


export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('home');
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [lbModal, setLbModal] = useState({ open: false, type: 'monthlyArena', data: [] });
  const [hallOfFameData, setHallOfFameData] = useState([]);
  // Get live data from Kaustubh's context
  const { user } = useContext(AuthContext);

  // ================= RESPONSIVE LISTENER =================
  useEffect(() => {
    const checkMobile = () => {
      const mobileState = window.innerWidth < 768;
      setIsMobile(mobileState);
      if (!mobileState) setIsSidebarOpen(false); 
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  // ================= GLOBAL LEADERBOARDS =================
  // 2. Add this useEffect to fetch the data automatically
useEffect(() => {
  if (activeTab === 'leaderboard') {
    const fetchHoF = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get('http://localhost:5000/api/leaderboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHallOfFameData(res.data.hallOfFame);
      } catch (err) {
        console.error("Failed to fetch Hall of Fame:", err);
      }
    };
    fetchHoF();
  }
}, [activeTab]);
  // ================= SIDEBAR NAVIGATION DATA =================
  const navSections = [
    {
      title: "Main",
      items: [
        { id: 'home', label: 'Home / Launchpad', icon: Home, color: 'cyan' },
      ]
    },
    {
      title: "The Arena",
      items: [
        { id: 'coding', label: 'Coding Challenges', icon: Code2, color: 'magenta' },
        { id: 'aptitude', label: 'Aptitude & Logic', icon: BrainCircuit, color: 'magenta' },
      ]
    },
    {
      title: "Community",
      items: [
        { id: 'chat', label: 'Query Forums', icon: MessageSquare, color: 'cyan' },
        { id: 'audio', label: 'Audio Rooms', icon: Mic, color: 'cyan' },
        { id: 'leaderboard', label: 'Global Leaderboards', icon: Trophy, color: 'cyan' },
      ]
    }
  ];

  const openLeaderboard = async (type) => {
  try {
    // 1. Grab the token (adjust 'token' if you named it differently in localStorage)
    const token = localStorage.getItem("token"); 
    
    // 2. Send the token in the headers
    const response = await axios.get('http://localhost:5000/api/leaderboard', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setLbModal({
      open: true,
      type: type,
      data: response.data[type] 
    });
  } catch (error) {
    console.error("Failed to load leaderboard:", error);
  }
};

  const handleTabSwitch = (id) => {
    setActiveTab(id);
    if (isMobile) setIsSidebarOpen(false);
  };

  // 🔥 Helper to check if we are in a fullscreen app view
  const isAppView = activeTab === 'chat' || activeTab === 'audio';

  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // Clears the token/session
    navigate('/'); // Redirects to the landing page (or use window.location.href = '/' if you prefer)
  };
  return (
    <div className="min-h-screen bg-[#03070b] text-slate-300 font-sans flex overflow-hidden selection:bg-grads-cyan/30 cursor-default">
      
      {/* BACKGROUND DOT MATRIX & GLOW */}
      <div 
        className="fixed inset-0 z-0 opacity-40 pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(circle at 0 0, rgba(14,165,233,0.15) 1px, transparent 1px), radial-gradient(circle at 16px 16px, rgba(168,85,247,0.15) 1px, transparent 1px)', backgroundSize: '32px 32px' }}
      />

      <AnimatePresence>
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* ================= LEFT SIDEBAR ================= */}
      <aside className={`fixed md:relative inset-y-0 left-0 w-72 h-screen border-r border-grads-teal/20 bg-[#040a0f]/95 md:bg-[#040a0f]/80 backdrop-blur-3xl flex flex-col z-50 shadow-[10px_0_30px_rgba(0,0,0,0.5)] transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* LOGO AREA */}
        <div className="h-24 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
           <img src="/logo-main.png" alt="The Grads" className="h-14 w-auto object-contain drop-shadow-md" />
           <button className="md:hidden text-slate-400 hover:text-white transition-colors" onClick={() => setIsSidebarOpen(false)}>
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* NAVIGATION */}
        <div className="flex-1 overflow-y-auto py-6 px-4 custom-scrollbar">
          {navSections.map((section, idx) => (
            <div key={idx} className="mb-8">
              <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3 px-4 flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${section.title === 'The Arena' ? 'bg-grads-magenta/40' : 'bg-grads-cyan/40'}`}></span>
                {section.title}
              </h4>
              <div className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  const iconHoverColor = item.color === 'magenta' ? 'group-hover:text-grads-magenta' : 'group-hover:text-grads-cyan';
                  const iconActiveColor = item.color === 'magenta' ? 'text-grads-magenta' : 'text-grads-cyan';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleTabSwitch(item.id)}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${
                        isActive 
                          ? 'text-white font-semibold' 
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      {isActive && (
                        <motion.div 
                          layoutId="activeTab" 
                          className={`absolute inset-0 bg-gradient-to-r ${item.color === 'magenta' ? 'from-grads-magenta/20' : 'from-grads-teal/20'} to-transparent border-l-2 ${item.color === 'magenta' ? 'border-grads-magenta' : 'border-grads-cyan'}`} 
                        />
                      )}
                      <Icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? iconActiveColor : iconHoverColor}`} />
                      <span className="relative z-10 text-sm tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* BOTTOM SETTINGS */}
        <div className="p-4 border-t border-white/5 bg-[#0a1219]/30 shrink-0">
          
          {/* Settings Button */}
          <button 
            onClick={() => {
              setActiveTab('settings');
              if (isMobile) setIsSidebarOpen(false); // Optional: closes sidebar on mobile after clicking
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${activeTab === 'settings' ? 'bg-grads-cyan/10 text-grads-cyan' : 'text-slate-400 hover:text-grads-cyan hover:bg-white/5'}`}
          >
            <Settings className="w-5 h-5 group-hover:text-grads-cyan transition-colors" />
            <span className="text-sm font-bold">Settings & Status</span>
          </button>
          
          {/* Disconnect Button */}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors mt-1 group"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
            <span className="text-sm font-bold">Disconnect</span>
          </button>

        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden w-full">
        
        {/* TOP HUD HEADER */}
        <header className="absolute top-0 right-0 w-full h-20 flex justify-end items-center px-4 md:px-8 z-30 pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            
            {/* DYNAMIC HUD - ONLY ON HOME */}
            {activeTab === 'home' && (
              <div className="hidden md:flex items-center gap-4 bg-[#040a0f]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-2 shadow-2xl">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span className="font-bold text-orange-50 font-mono">{user?.streak || 0}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-grads-magenta/10 border border-grads-magenta/20">
                  <Zap className="w-4 h-4 text-grads-magenta" />
                  <span className="font-bold text-fuchsia-50 font-mono">
                    {user?.experiencePoints || 0} <span className="text-[10px] text-fuchsia-300/50">EXP</span>
                  </span>
                </div>
                <div 
                  onClick={() => openLeaderboard('monthlyArena')} 
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-grads-teal/10 border border-grads-teal/20 hover:bg-grads-teal/20 transition-all cursor-pointer group active:scale-95" 
                  title="View Monthly Leaderboard"
                >
                  <BarChart2 className="w-4 h-4 text-grads-cyan group-hover:rotate-12 transition-transform" />
                  <span className="font-bold text-cyan-50 font-mono">
                    #{user?.experiencePoints > 0 ? Math.max(1, 342 - (user.experiencePoints * 2)).toLocaleString() : '342'}
                  </span>
                </div>
              </div>
            )}

            <button className="md:hidden p-2.5 rounded-xl bg-[#040a0f]/80 border border-white/10 text-white" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* 🔥 DYNAMIC SCROLLABLE SECTION 🔥 */}
        {/* If chat/audio is active, we kill the padding and lock overflow so the app fits perfectly! */}
        <div className={`flex-1 relative z-20 w-full ${isAppView ? 'overflow-hidden pt-0 md:pt-0' : 'overflow-y-auto p-4 md:p-8 pt-24 custom-scrollbar'}`}>
          <div className={`mx-auto w-full ${isAppView ? 'h-full max-w-none' : 'max-w-6xl'}`}>
            
           {/* ROUTING LOGIC */}
            {activeTab === 'home' && <HomeSection user={user} switchTab={setActiveTab} />}
            {activeTab === 'coding' && !isMobile && <CodingArena />}
            {/* LEADERBOARD SECTION */}
            {activeTab === 'leaderboard' && (
              <div className="max-w-4xl mx-auto animate-in fade-in duration-300 w-full">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-yellow-400/10 rounded-2xl border border-yellow-400/20">
                    <Crown className="w-8 h-8 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">The Hall of Fame</h2>
                    <p className="text-slate-400 font-mono text-sm mt-1 tracking-widest uppercase">All-Time Legends</p>
                  </div>
                </div>

                <div className="bg-[#0a0f16]/80 border border-white/10 rounded-3xl p-4 shadow-2xl">
                  {hallOfFameData && hallOfFameData.length > 0 ? (
                    hallOfFameData.map((player, index) => (
                      <div 
                        key={player._id || index} 
                        className={`flex items-center justify-between p-4 mb-2 rounded-2xl border ${
                          index === 0 ? "bg-yellow-400/10 border-yellow-400/30" : 
                          index < 3 ? "bg-white/5 border-white/10" : "border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-6">
                          <span className={`text-xl font-mono font-bold w-8 text-center ${
                            index === 0 ? "text-yellow-400" : 
                            index === 1 ? "text-slate-300" : 
                            index === 2 ? "text-orange-400" : "text-slate-600"
                          }`}>
                            #{index + 1}
                          </span>
                          <span className="text-lg font-semibold text-white">{player.fullName}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xl font-mono font-bold text-yellow-400">
                            {(player.experiencePoints || 0).toLocaleString()}
                          </span>
                          <span className="text-xs text-slate-500 ml-2 font-bold tracking-widest uppercase">EXP</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-10 text-center text-slate-500 font-mono tracking-widest uppercase">
                      Loading Legends...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* CHAT AND AUDIO SECTION */}
            <Suspense fallback={
              <div className="flex h-[50vh] items-center justify-center">
                <div className="text-grads-cyan animate-pulse font-mono tracking-widest text-sm">
                  INITIALIZING SECURE UPLINK...
                </div>
              </div>
            }>
              {activeTab === 'chat' && <ChatBox switchTab={setActiveTab} />}
              {activeTab === 'audio' && <VoiceRoom switchTab={setActiveTab} />}
            </Suspense>
            
            {activeTab === 'settings' && <GamificationPanel />}
            {/* MOBILE LOCK FOR CODING */}
            {activeTab === 'coding' && isMobile && (
               <div className="flex flex-col items-center justify-center h-[70vh] text-center">
                 <Lock className="w-12 h-12 text-grads-magenta mb-4" />
                 <h2 className="text-2xl font-bold text-white">Desktop Required</h2>
                 <p className="text-slate-400 mt-2">The Arena requires a large display to execute code.</p>
               </div>
            )}

            {/* FALLBACK FOR UNDEFINED TABS (WITH LEADERBOARD EXCEPTION FIXED) */}
            {activeTab !== 'home' && activeTab !== 'coding' && activeTab !== 'chat' && activeTab !== 'audio' && activeTab !== 'leaderboard' && activeTab !== 'settings' &&(
              <div className="py-20 text-center">
                <h2 className="text-2xl font-bold text-white capitalize">{activeTab} Section</h2>
                <p className="text-slate-500 mt-2">System offline. Sector under construction.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}} />
      <LeaderboardModal 
      isOpen={lbModal.open} 
      type={lbModal.type} 
      data={lbModal.data} 
      onClose={() => setLbModal({ ...lbModal, open: false })}
    />
      
    </div>
    
  );
}