import React from 'react';
import { X, Trophy, Star, Crown } from 'lucide-react';

const LeaderboardModal = ({ isOpen, onClose, data, type }) => {
  if (!isOpen) return null;

  const title = type === 'hallOfFame' ? "Hall of Fame" : "Monthly Arena";
  const subtitle = type === 'hallOfFame' ? "ALL-TIME LEGENDS" : "TOP 10 THIS MONTH";
  const iconColor = type === 'hallOfFame' ? "text-yellow-400" : "text-grads-cyan";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in zoom-in duration-200">
      <div className="relative w-full max-w-md bg-[#0a0f16]/90 border border-white/10 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.7)] overflow-hidden">
        
        {/* Header Section */}
        <div className="p-5 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl bg-white/5 ${iconColor}`}>
              {type === 'hallOfFame' ? <Crown className="w-6 h-6" /> : <Trophy className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white leading-none">{title}</h2>
              <p className="text-[10px] font-mono text-slate-500 mt-1 tracking-[0.2em]">{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Dynamic List */}
        <div className="p-3 max-h-[400px] overflow-y-auto custom-scrollbar">
          {data && data.length > 0 ? (
            data.map((player, index) => (
              <div 
                key={player._id || index}
                className={`flex items-center justify-between p-3 mb-2 rounded-2xl border transition-all ${
                  index === 0 
                  ? "bg-grads-cyan/10 border-grads-cyan/30 shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
                  : "bg-white/5 border-transparent hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 text-center font-mono font-bold text-xs ${index < 3 ? iconColor : "text-slate-600"}`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white tracking-tight">{player.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-medium">LEVEL {Math.floor(player.experiencePoints / 1000) + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-mono font-bold text-sm ${iconColor}`}>{player.experiencePoints.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">EXP</p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-10 text-center text-slate-500 font-mono text-xs uppercase tracking-widest">
              Calculating Ranks...
            </div>
          )}
        </div>

        {/* Bottom Status */}
        <div className="p-4 bg-white/5 border-t border-white/5 flex justify-center">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 border border-white/5">
             <Star className="w-3 h-3 text-grads-cyan fill-grads-cyan" />
             <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Live Updates</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardModal;