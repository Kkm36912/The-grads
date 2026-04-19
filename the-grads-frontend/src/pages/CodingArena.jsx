import React, { useState, useEffect, useMemo, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Play, CheckCircle2, Circle, Flame, Zap, BarChart2, ChevronDown, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import Compiler from './Compiler';

export default function CodingArena() {
  const { token, user } = useContext(AuthContext);
  
  // ================= STATE =================
  const [challenges, setChallenges] = useState([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [globalRank, setGlobalRank] = useState("---"); // NEW STATE FOR RANK
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTopic, setActiveTopic] = useState("All");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const [activeStatus, setActiveStatus] = useState("All");
  
  const [isTopicOpen, setIsTopicOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // ================= FULLSCREEN HACK =================
  useEffect(() => {
    const sidebar = document.querySelector('aside');
    const header = document.querySelector('header');
    
    if (activeChallenge) {
      if (sidebar) sidebar.style.display = 'none';
      if (header) header.style.display = 'none';
    } else {
      if (sidebar) sidebar.style.display = 'flex';
      if (header) header.style.display = 'flex';
    }
    return () => {
      if (sidebar) sidebar.style.display = 'flex';
      if (header) header.style.display = 'flex';
    };
  }, [activeChallenge]);

  // ================= FETCH LIVE DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Challenges
        const challengesRes = await axios.get('https://the-grads.onrender.com/api/challenges', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // Fetch Global Rank (Using our updated leaderboard endpoint)
        const rankRes = await axios.get('https://the-grads.onrender.com/api/leaderboard', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (rankRes.data && rankRes.data.globalRank) {
          setGlobalRank(rankRes.data.globalRank);
        }

        const formattedData = challengesRes.data.map(ch => {
          const acceptanceRate = ch.totalAttempts > 0 
            ? ((ch.successfulAttempts / ch.totalAttempts) * 100).toFixed(1) + "%" 
            : "0.0%";
          return {
            ...ch,
            id: ch._id,
            shortId: `CHL-${ch._id.substring(18).toUpperCase()}`,
            status: ch.userStatus || "Unsolved", 
            acceptance: acceptanceRate
          };
        });
        
        setChallenges(formattedData);

        // 🔥 THE AUTO-OPEN INTERCEPT 🔥
        const pendingMissionId = sessionStorage.getItem('dailyMissionId');
        if (pendingMissionId) {
          const targetChallenge = formattedData.find(c => c.id === pendingMissionId || c._id === pendingMissionId);
          if (targetChallenge) {
            setActiveChallenge(targetChallenge);
          }
          sessionStorage.removeItem('dailyMissionId');
        }

      } catch (err) {
        console.error("Network error fetching arena data:", err);
      } finally {
        setIsLoadingDB(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  const topics = ["All", ...new Set(challenges.map(c => c.topic))];
  const difficulties = ["All", "EASY", "MEDIUM", "HARD"]; 
  const statuses = ["All", "PASSED", "PARTIAL", "Unsolved"];

  // ================= FILTER LOGIC =================
  const filteredChallenges = useMemo(() => {
    return challenges.filter(challenge => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        challenge.title.toLowerCase().includes(searchLower) ||
        challenge.shortId.toLowerCase().includes(searchLower) ||
        challenge.topic.toLowerCase().includes(searchLower);
      
      const matchesTopic = activeTopic === "All" || challenge.topic === activeTopic;
      const matchesDifficulty = activeDifficulty === "All" || challenge.difficulty === activeDifficulty;
      const matchesStatus = activeStatus === "All" || challenge.status === activeStatus;

      return matchesSearch && matchesTopic && matchesDifficulty && matchesStatus;
    });
  }, [searchQuery, activeTopic, activeDifficulty, activeStatus, challenges]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTopic, activeDifficulty, activeStatus]);

  const totalPages = Math.ceil(filteredChallenges.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentChallenges = filteredChallenges.slice(startIndex, startIndex + itemsPerPage);

  const difficultyColors = {
    "EASY": "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    "MEDIUM": "text-amber-400 bg-amber-500/10 border-amber-500/20",
    "HARD": "text-red-400 bg-red-500/10 border-red-500/20"
  };
  const difficultyGlow = {
    "EASY": "group-hover:bg-emerald-500",
    "MEDIUM": "group-hover:bg-amber-500",
    "HARD": "group-hover:bg-red-500"
  };

  // ================= VIEW 1: THE COMPILER =================
  if (activeChallenge) {
    return (
      <Compiler 
        challenge={activeChallenge} 
        onBack={() => setActiveChallenge(null)} 
        onPass={(id, resultStatus) => {
          setChallenges(prev => prev.map(ch => 
            ch.id === id ? { ...ch, status: resultStatus || "PASSED" } : ch
          ));
        }}
      />
    );
  }

  // ================= VIEW 2: THE ARENA GRID =================
  return (
    <div className="flex flex-col gap-8 pb-20 max-w-7xl mx-auto w-full fade-in">
      
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-bold text-white tracking-wide">Coding Grounds</h2>
          <p className="text-sm text-slate-400 mt-2">Select a challenge to enter the execution workspace.</p>
        </div>
        
        <div className="hidden md:flex gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Completion</span>
            <span className="text-lg font-bold text-emerald-400">
              {challenges.filter(c => c.status === "PASSED").length} / {challenges.length}
            </span>
          </div>
          <div className="w-px h-10 bg-white/10 mx-2"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Global Rank</span>
              <span className="text-lg font-bold text-grads-cyan">
                {/* 🔥 REAL GLOBAL RANK DISPLAYED HERE 🔥 */}
                #{globalRank.toLocaleString()}
              </span>
            </div>
        </div>
      </div>

      <div className="relative z-40 flex flex-col md:flex-row items-center gap-4 p-2 rounded-2xl bg-[#0a1219]/60 backdrop-blur-md border border-white/5 shadow-lg">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" placeholder="Search problem title, ID, or topic..."
            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none py-3 pl-12 pr-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-0"
          />
        </div>
        <div className="hidden md:block w-px h-8 bg-white/10"></div>
        <div className="flex w-full md:w-auto items-center gap-2">
          
          {/* TOPICS & DIFFICULTY */}
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => { setIsTopicOpen(!isTopicOpen); setIsStatusOpen(false); }}
              className={`w-full flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTopic !== "All" || activeDifficulty !== "All" ? 'bg-grads-cyan/10 text-grads-cyan' : 'hover:bg-white/5 text-slate-300'}`}
            >
              <Filter className={`w-4 h-4 ${(activeTopic !== "All" || activeDifficulty !== "All") ? 'text-grads-cyan' : 'text-slate-400'}`} /> 
              <span className="truncate max-w-[120px]">
                {activeTopic !== "All" ? activeTopic : (activeDifficulty !== "All" ? activeDifficulty : "Filters")}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isTopicOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isTopicOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-[#040a0f] border border-grads-cyan/30 rounded-xl p-3 z-50 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-h-96 overflow-y-auto custom-scrollbar flex flex-col gap-5"
                >
                  <div>
                     <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-grads-cyan/40"></span> Topics
                     </h4>
                     <div className="flex flex-col gap-1">
                        {topics.map(topic => (
                          <button key={topic} onClick={(e) => { e.stopPropagation(); setActiveTopic(topic); setIsTopicOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeTopic === topic ? 'bg-grads-cyan/10 text-grads-cyan font-bold' : 'text-slate-300 hover:bg-white/5'}`}
                          >{topic}</button>
                        ))}
                     </div>
                  </div>
                  <div>
                     <h4 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2 px-2 flex items-center gap-2">
                       <span className="w-1.5 h-1.5 rounded-full bg-grads-magenta/40"></span> Difficulty
                     </h4>
                     <div className="flex flex-col gap-1">
                        {difficulties.map(diff => (
                          <button key={diff} onClick={(e) => { e.stopPropagation(); setActiveDifficulty(diff); setIsTopicOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeDifficulty === diff ? 'bg-grads-magenta/10 text-grads-magenta font-bold' : 'text-slate-300 hover:bg-white/5'}`}
                          >{diff}</button>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STATUS */}
          <div className="relative flex-1 md:flex-none">
            <button 
              onClick={() => { setIsStatusOpen(!isStatusOpen); setIsTopicOpen(false); }}
              className={`w-full flex justify-center items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeStatus !== "All" ? 'bg-emerald-500/10 text-emerald-400' : 'hover:bg-white/5 text-slate-300'}`}
            >
              <CheckCircle2 className={`w-4 h-4 ${activeStatus !== "All" ? 'text-emerald-400' : 'text-slate-400'}`} /> 
              {activeStatus === "All" ? "Status" : activeStatus}
              <ChevronDown className={`w-4 h-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {isStatusOpen && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-40 bg-[#040a0f] border border-emerald-500/30 rounded-xl p-2 z-50 shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
                >
                  {statuses.map(stat => (
                    <button key={stat} onClick={(e) => { e.stopPropagation(); setActiveStatus(stat); setIsStatusOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${activeStatus === stat ? 'bg-emerald-500/10 text-emerald-400 font-bold' : 'text-slate-300 hover:bg-white/5'}`}
                    >{stat}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="relative z-10 flex flex-col gap-3 min-h-[500px]">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 text-[11px] font-mono text-slate-500 uppercase tracking-widest border-b border-white/5 mb-2">
          <div className="col-span-1">Status</div>
          <div className="col-span-5">Directive / Title</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Acceptance</div>
          <div className="col-span-2 text-right">Bounty</div>
        </div>

        {isLoadingDB ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-grads-cyan animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white">Accessing Vault...</h3>
          </div>
        ) : currentChallenges.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Search className="w-10 h-10 text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Challenges Found</h3>
            <p className="text-slate-400 text-sm">Adjust your filters or search query to locate targets.</p>
            <button onClick={() => { setSearchQuery(""); setActiveTopic("All"); setActiveDifficulty("All"); setActiveStatus("All"); }}
              className="mt-6 text-sm text-grads-cyan hover:underline underline-offset-4"
            >Clear all filters</button>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {currentChallenges.map((challenge) => (
              <motion.div
                layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
                key={challenge.id}
                onClick={() => setActiveChallenge(challenge)}
                className="group relative grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-5 rounded-xl bg-[#0a1219]/40 border border-white/5 hover:bg-[#0a1219]/80 transition-all duration-300 cursor-pointer overflow-hidden"
              >
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 ${difficultyGlow[challenge.difficulty]}`}></div>
                <div className="hidden md:flex col-span-1 justify-center">
                  {challenge.status === "PASSED" || challenge.status === "Solved" ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                  ) : challenge.status === "PARTIAL" ? (
                    <Circle className="w-5 h-5 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                  )}
                </div>
                <div className="col-span-1 md:col-span-5 flex flex-col">
                  <span className="text-base font-bold text-slate-200 group-hover:text-white transition-colors truncate">{challenge.title}</span>
                  <span className="text-[11px] font-mono text-slate-500 mt-1 flex items-center gap-2">
                    <span className="text-slate-600">{challenge.shortId}</span> • {challenge.topic}
                  </span>
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono border ${difficultyColors[challenge.difficulty]}`}>{challenge.difficulty}</span>
                </div>
                <div className="hidden md:flex col-span-2 items-center text-sm font-mono text-slate-400">{challenge.acceptance}</div>
                <div className="col-span-1 md:col-span-2 flex items-center justify-between md:justify-end gap-6">
                  <div className="flex items-center gap-1.5 text-grads-magenta md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <Zap className="w-4 h-4" />
                    <span className="text-xs font-mono font-bold">{challenge.expReward} EXP</span>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-white/5 md:group-hover:bg-grads-cyan/10 border border-transparent md:group-hover:border-grads-cyan/30 flex items-center justify-center transition-all duration-300">
                    <Play className="w-4 h-4 text-slate-400 group-hover:text-grads-cyan group-hover:translate-x-0.5 transition-all" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {!isLoadingDB && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-white/10 pt-6 mt-4 gap-4">
          <span className="text-sm text-slate-500 font-mono">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredChallenges.length)} of {filteredChallenges.length}
          </span>
          <div className="flex items-center gap-4 bg-[#0a1219]/60 p-2 rounded-xl border border-white/5">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-bold text-white font-mono px-4">Page {currentPage} / {totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg bg-white/5 text-white hover:bg-white/10 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}