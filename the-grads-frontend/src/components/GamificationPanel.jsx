import React, { useState, useContext, useMemo } from 'react';
import { PauseCircle, Zap, ShieldAlert, Calendar, Info } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

export default function GamificationPanel() {
  const { user, token, fetchProfile } = useContext(AuthContext);
  
  const [loadingPause, setLoadingPause] = useState(false);
  const [weeks, setWeeks] = useState(1);
  const [message, setMessage] = useState({ text: '', type: '' });

  if (!user) return null;

  const isPaused = user.pauseEndDate && new Date(user.pauseEndDate) > new Date();

  // LIVE DATE PREVIEW MATH (Mirrors your backend logic)
  const { previewStart, previewEnd } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let daysUntilMonday = (1 + 7 - today.getDay()) % 7;
    if (daysUntilMonday === 0) daysUntilMonday = 7; 

    const start = new Date(today);
    start.setDate(today.getDate() + daysUntilMonday);

    const end = new Date(start);
    end.setDate(start.getDate() + (weeks * 7) - 1);

    return { previewStart: start, previewEnd: end };
  }, [weeks]);

  const handleActivatePause = async () => {
    try {
      setLoadingPause(true);
      const res = await axios.post('http://localhost:5000/api/pause/activate', { weeksToPause: weeks }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage({ text: res.data.message || 'Learning Pause Activated!', type: 'success' });
      if (fetchProfile) fetchProfile();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Failed to activate pause', type: 'error' });
    } finally {
      setLoadingPause(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 4000);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-3xl mx-auto space-y-6 pt-4">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Zap className="w-8 h-8 text-grads-magenta" /> Account Settings
        </h2>
        <p className="text-sm text-slate-400 mt-2">Manage your platform configurations and learning status.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl text-sm font-bold shadow-lg ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {message.text}
        </div>
      )}

      {/* ================= LEARNING PAUSE PANEL ================= */}
      <div className="bg-[#0a1219]/80 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-orange-500/30 transition-all">
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
        
        <div className="flex items-start justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${isPaused ? 'bg-orange-500/20 text-orange-400 animate-pulse' : 'bg-orange-500/10 text-orange-500'}`}>
              <PauseCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Learning Pause</h3>
              <p className="text-sm text-slate-400 mt-1">Halt your cycles for exams or vacations without losing progress.</p>
            </div>
          </div>
        </div>

        <div className="bg-black/40 border border-white/5 rounded-xl p-4 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
               <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Available Tokens</p>
               <p className="text-xl font-mono text-white mt-1">{user.learningPauses || 0}<span className="text-sm text-slate-500">/3</span></p>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded">
              <Info className="w-3 h-3"/> +1 Token Monthly
            </div>
          </div>

          {isPaused ? (
             <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-start gap-3">
               <ShieldAlert className="w-5 h-5 text-orange-400 shrink-0" />
               <div>
                 <p className="text-sm font-bold text-orange-400">Account Paused</p>
                 <p className="text-xs text-orange-300/80 mt-1">
                   Resumes automatically on <span className="font-mono font-bold text-white">{new Date(user.pauseEndDate).toLocaleDateString()}</span>.
                 </p>
               </div>
             </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <select 
                  value={weeks} 
                  onChange={(e) => setWeeks(Number(e.target.value))}
                  className="flex-1 bg-[#0a1219] border border-white/10 text-white text-sm rounded-xl px-4 py-3 outline-none focus:border-orange-500 transition-colors"
                >
                  <option value={1}>Pause for 1 Week</option>
                  <option value={2}>Pause for 2 Weeks</option>
                  <option value={3}>Pause for 3 Weeks</option>
                </select>
                <button 
                  onClick={handleActivatePause}
                  disabled={loadingPause || user.learningPauses < 1}
                  className="px-6 py-3 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm font-bold rounded-xl transition-colors border border-orange-500/30 disabled:opacity-50"
                >
                  Activate
                </button>
              </div>
              
              {/* THE LIVE DATE PREVIEW */}
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <p className="text-xs text-slate-300">
                  Pause will run from <span className="text-white font-mono font-bold">{previewStart.toLocaleDateString()}</span> to <span className="text-white font-mono font-bold">{previewEnd.toLocaleDateString()}</span>.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}