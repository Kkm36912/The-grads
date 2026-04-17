import React, { useState, useEffect, useContext } from 'react';
import { Users, Code, Activity, Target, Trophy, Flame, Zap } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
// 🔥 Import the Recharts components
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PlatformAnalytics() {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!token) return;
      try {
        const res = await axios.get('http://localhost:5000/api/admin/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [token]);

  if (loading) {
    return <div className="h-full flex items-center justify-center text-blue-400 animate-pulse font-mono tracking-widest">INITIALIZING GLOBAL METRICS...</div>;
  }

  if (!data) return null;

  const globalSuccessRate = data.totalGlobalAttempts > 0 
    ? ((data.totalGlobalSuccess / data.totalGlobalAttempts) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      
      {/* HEADER */}
      <div className="border-b border-slate-800 pb-6">
        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-blue-500" /> Platform Analytics
        </h2>
        <p className="text-sm text-slate-400 mt-2">Live telemetry and performance metrics for The Grads Arena.</p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... (Kept exactly the same as before) ... */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-blue-500/10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Enrolled</p>
              <h3 className="text-3xl font-mono text-white font-bold">{data.studentCount}</h3>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl"><Users className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-purple-500/10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Arena Challenges</p>
              <h3 className="text-3xl font-mono text-white font-bold">{data.challengeCount}</h3>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl"><Code className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-orange-500/10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Executions</p>
              <h3 className="text-3xl font-mono text-white font-bold">{data.totalGlobalAttempts}</h3>
            </div>
            <div className="p-3 bg-orange-500/10 text-orange-400 rounded-xl"><Zap className="w-6 h-6" /></div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 transition-all group-hover:bg-emerald-500/10"></div>
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Global Success</p>
              <h3 className="text-3xl font-mono text-emerald-400 font-bold">{globalSuccessRate}%</h3>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl"><Target className="w-6 h-6" /></div>
          </div>
        </div>
      </div>

      {/* 🔥 THE NEW PERFORMANCE GRAPH 🔥 */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" /> Platform Engagement
          </h3>
          <p className="text-xs text-slate-400 mt-1">Total code executions compared to the previous month.</p>
        </div>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.performanceData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#f8fafc', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}
                itemStyle={{ color: '#e2e8f0', fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
              {/* Current Month: Solid Blue Line */}
              <Line type="monotone" dataKey="currentMonth" name="Current Month" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} activeDot={{ r: 6, stroke: '#60a5fa', strokeWidth: 2 }} />
              {/* Previous Month: Dashed Gray Line */}
              <Line type="monotone" dataKey="previousMonth" name="Previous Month" stroke="#64748b" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#0f172a' }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LEADERBOARD (Bottom Section) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-6 border-b border-slate-800 bg-slate-950/50 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold text-white">Elite Vanguard (Top 5)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-950 text-slate-500 text-[10px] uppercase tracking-widest border-b border-slate-800">
                <th className="p-4 pl-6 font-bold">Rank</th>
                <th className="p-4 font-bold">Student Name</th>
                <th className="p-4 font-bold">Email/ID</th>
                <th className="p-4 font-bold text-center">Active Streak</th>
                <th className="p-4 text-right pr-6 font-bold">Total EXP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {data.topStudents.map((student, idx) => (
                <tr key={student._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 pl-6">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/50' : idx === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/50' : idx === 2 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/50' : 'bg-slate-800 text-slate-400'}`}>
                      #{idx + 1}
                    </div>
                  </td>
                  <td className="p-4 font-bold text-white">{student.fullName}</td>
                  <td className="p-4 text-sm text-slate-400">{student.email}</td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 font-mono text-sm border border-orange-500/20">
                      <Flame className="w-4 h-4" /> {student.streak || 0}
                    </span>
                  </td>
                  <td className="p-4 text-right pr-6 font-mono text-blue-400 font-bold text-lg">
                    {student.experiencePoints || 0}
                  </td>
                </tr>
              ))}
              {data.topStudents.length === 0 && (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No student data available.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}