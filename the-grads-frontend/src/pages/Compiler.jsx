import React, { useState, useEffect, useContext } from 'react';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, CheckCircle2, XCircle, Loader2, Code2, TerminalSquare, AlertCircle, Trophy, Flame, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import Editor from '@monaco-editor/react';

export default function Compiler({ challenge, onBack, onPass }) {
  const { token, fetchProfile } = useContext(AuthContext);

  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [popupData, setPopupData] = useState({ exp: 0, streak: false, status: "" });

  useEffect(() => {
    if (challenge?.starterCode && challenge.starterCode[language]) {
      setCode(challenge.starterCode[language]);
    } else {
      setCode('// Write your logic here...');
    }
    setResults(null);
    setShowSuccess(false);
  }, [language, challenge]);

  const handleRunCode = async () => {
    if (!code.trim()) return;
    setIsRunning(true);
    setResults(null);

    try {
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          challengeId: challenge.id || challenge._id,
          code: code,
          language: language
        })
        
      });

      const data = await response.json();
      setResults(data);

      if (response.ok && (data.status === "PASSED" || data.status === "PARTIAL")) {
        fetchProfile(); 
        
        // 🔥 THE CONFETTI EXPLOSION (Only on full pass)
        if (data.status === "PASSED") {
          confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#14b8c4', '#f50be3', '#10b981'], // The Grads brand colors!
            disableForReducedMotion: true
          });
        }

        // Pass the dynamic backend receipt to the popup
        setPopupData({ exp: data.earnedExp || 0, streak: data.earnedStreak || false, status: data.status });
        setShowSuccess(true); 
        
        if (onPass) onPass(challenge.id || challenge._id, data.status); 
      }
    } catch (error) {
      console.error("Execution Error:", error);
      setResults({ status: "ERROR", message: "Failed to connect to execution server." });
    } finally {
      setIsRunning(false);
    }
  };

  const diffColors = {
    "EASY": "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
    "MEDIUM": "text-amber-400 border-amber-400/30 bg-amber-400/10",
    "HARD": "text-red-400 border-red-400/30 bg-red-400/10"
  };

  return (
    // 🔥 No more portal! Just a standard fixed overlay with a high z-index.
    <div className="fixed inset-0 z- bg-[#03070b] flex flex-col overflow-hidden animate-in fade-in duration-200 font-sans">
      
      {/* 🔥 CUSTOM CYAN SCROLLBAR INJECTION */}
      <style dangerouslySetInnerHTML={{__html: `
        .cyan-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .cyan-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .cyan-scrollbar::-webkit-scrollbar-thumb { background: rgba(20, 184, 196, 0.2); border-radius: 10px; }
        .cyan-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(20, 184, 196, 0.6); }
      `}} />

      {/* ================= SUCCESS MODAL ================= */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z- bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-[#0a1219] border border-grads-cyan/30 rounded-2xl p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(20,184,196,0.2)] relative overflow-hidden"
            >
              {/* Dynamic Background Glow */}
              <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 blur-[50px] rounded-full pointer-events-none ${popupData.status === 'PASSED' ? 'bg-grads-cyan/20' : 'bg-amber-500/20'}`}></div>

              {/* Dynamic Icon */}
              <div className={`w-20 h-20 rounded-full flex items-center justify-center border mb-6 relative ${popupData.status === 'PASSED' ? 'bg-grads-cyan/10 border-grads-cyan/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                {popupData.status === 'PASSED' ? (
                  <Trophy className="w-10 h-10 text-grads-cyan relative z-10" />
                ) : (
                  <AlertCircle className="w-10 h-10 text-amber-500 relative z-10" />
                )}
              </div>
              
              <h2 className="text-3xl font-display font-bold text-white mb-2">
                {popupData.status === 'PASSED' ? 'Challenge Cleared!' : 'Partial Success'}
              </h2>
              <p className="text-slate-400 mb-8 text-sm">
                {popupData.status === 'PASSED' 
                  ? 'System logic verified. Outstanding execution.' 
                  : 'Some test cases failed. Review your logic.'}
              </p>

              {/* 🔥 DYNAMIC GAMIFICATION ROW (Only shows if they earned something!) */}
              {(popupData.streak || popupData.exp > 0) && (
                <div className="flex gap-4 w-full mb-8 justify-center">
                  {popupData.streak && (
                    <div className="flex-1 bg-[#040a0f] border border-white/5 rounded-xl p-4 flex flex-col items-center shadow-inner">
                      <Flame className="w-5 h-5 text-orange-400 mb-2" />
                      <span className="text-2xl font-mono font-bold text-white">+1</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">Streak</span>
                    </div>
                  )}
                  {popupData.exp > 0 && (
                    <div className="flex-1 bg-[#040a0f] border border-white/5 rounded-xl p-4 flex flex-col items-center shadow-inner">
                      <Zap className="w-5 h-5 text-grads-magenta mb-2" />
                      <span className="text-2xl font-mono font-bold text-white">+{popupData.exp}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">EXP</span>
                    </div>
                  )}
                </div>
              )}

              <button 
                onClick={() => { setShowSuccess(false); onBack(); }}
                className={`w-full py-3.5 rounded-xl text-[#03070b] font-bold text-sm flex items-center justify-center gap-2 transition-all ${popupData.status === 'PASSED' ? 'bg-grads-cyan hover:shadow-[0_0_20px_rgba(20,184,196,0.4)]' : 'bg-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]'}`}
              >
                Return to Arena <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= COMPILER TOP NAVBAR ================= */}
      <div className="h-16 flex items-center justify-between bg-[#040a0f] border-b border-white/5 px-4 md:px-6 shrink-0 shadow-md z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors flex items-center justify-center relative z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-white/10 hidden md:block"></div>
          <div className="flex items-center gap-3">
            <Code2 className="w-5 h-5 text-grads-cyan" />
            <h2 className="text-base md:text-lg font-bold text-white tracking-wide truncate max-w-[200px] md:max-w-md">{challenge.title}</h2>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono border hidden sm:block ${diffColors[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-mono text-slate-400 hidden sm:block">
            Bounty: <span className="text-grads-magenta font-bold">{challenge.expReward} EXP</span>
          </span>
          <button 
            onClick={handleRunCode}
            disabled={isRunning}
            className="relative z-20 flex items-center gap-2 px-6 py-2 rounded-lg bg-grads-cyan/10 border border-grads-cyan/30 text-grads-cyan font-bold hover:bg-grads-cyan hover:text-[#03070b] transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Executing...' : 'Run Code'}
          </button>
        </div>
      </div>

      {/* ================= WORKSPACE (SPLIT PANELS) ================= */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-[#03070b] relative z-10">
        
        {/* LEFT PANEL: Directive & Details (40% width) */}
        <div className="w-full lg:w-[40%] flex flex-col border-r border-white/5 bg-[#0a1219]/30 min-h-0">
          <div className="px-5 py-3 border-b border-white/5 bg-[#040a0f]/50 flex items-center gap-2 text-slate-400 font-mono text-[10px] uppercase tracking-widest shrink-0">
            <TerminalSquare className="w-3.5 h-3.5" /> Directive
          </div>
          
          <div className="p-6 overflow-y-auto cyan-scrollbar flex-1 text-slate-300 text-sm leading-relaxed">
            <div className="whitespace-pre-wrap mb-8 font-medium">
              {challenge.description}
            </div>

            {challenge.examples && challenge.examples.length > 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-white text-sm font-bold tracking-wide mb-2">Test Cases</h3>
                {challenge.examples.map((ex, idx) => (
                  <div key={idx} className="bg-[#040a0f] rounded-lg border border-white/5 p-4 font-mono text-[13px] shadow-inner">
                    <div className="mb-2 flex gap-2"><span className="text-slate-500 min-w-[60px]">Input:</span> <span className="text-grads-cyan break-all">{ex.input}</span></div>
                    <div className="mb-2 flex gap-2"><span className="text-slate-500 min-w-[60px]">Output:</span> <span className="text-emerald-400 break-all">{ex.output}</span></div>
                    {ex.explanation && (
                      <div className="mt-3 pt-3 border-t border-white/5 text-slate-400 font-sans text-xs">
                        <span className="font-bold text-slate-300">Explanation:</span> {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Editor & Console (60% width) */}
        <div className="w-full lg:w-[60%] flex flex-col min-h-0 bg-[#1e1e1e]">
          
          {/* EDITOR AREA */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="px-4 py-2 bg-[#1e1e1e] border-b border-[#333] flex items-center justify-between shrink-0 shadow-sm z-10">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Editor</span>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-[#2d2d2d] border border-[#444] text-slate-200 text-xs font-mono rounded px-3 py-1 focus:outline-none focus:border-grads-cyan cursor-pointer hover:bg-[#333] transition-colors relative z-20"
              >
                <option value="python">Python 3</option>
                <option value="javascript">JavaScript (Node)</option>
                <option value="cpp">C++ 17</option>
                <option value="java">Java</option>
              </select>
            </div>
            
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language={language === 'cpp' ? 'cpp' : language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineHeight: 24,
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                  padding: { top: 16, bottom: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  renderLineHighlight: "all"
                }}
              />
            </div>
          </div>

          {/* CONSOLE AREA */}
          <div className="h-56 flex flex-col bg-[#040a0f] border-t border-white/10 shrink-0">
            <div className="px-4 py-2 border-b border-white/5 bg-[#0a1219] flex items-center justify-between shrink-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <TerminalSquare className="w-3.5 h-3.5" /> Output Stream
              </span>
              {results && (
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1.5 ${
                  results.status === 'PASSED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  results.status === 'PARTIAL' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  {results.status === 'PASSED' ? <CheckCircle2 className="w-3 h-3" /> : 
                   results.status === 'PARTIAL' ? <AlertCircle className="w-3 h-3" /> : 
                   <XCircle className="w-3 h-3" />}
                  {results.status}
                </span>
              )}
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto cyan-scrollbar font-mono text-[13px]">
              {!results && !isRunning && (
                <div className="text-slate-600 h-full flex items-center justify-center italic">
                  Awaiting execution...
                </div>
              )}
              
              {isRunning && (
                <div className="text-grads-cyan h-full flex items-center justify-center gap-3 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying remote logic sequences...
                </div>
              )}

              {results && (
                <div className="flex flex-col gap-3">
                  <div className={`whitespace-pre-wrap ${results.status === 'PASSED' ? 'text-emerald-400' : 'text-white'}`}>
                    {results.message}
                  </div>
                  
                  {results.compilerOutput && (
                    <div className="mt-1">
                      <div className="text-slate-500 text-[10px] uppercase mb-1">Standard Output:</div>
                      <div className="bg-[#0a1219] p-3 rounded border border-white/5 text-slate-300 whitespace-pre-wrap">
                        {results.compilerOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
