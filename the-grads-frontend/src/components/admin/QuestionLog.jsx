import React, { useState, useEffect, useContext } from 'react';
import { Search, Code, Terminal, X, EyeOff, Activity, Target, Zap } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function QuestionLog() {
  const { token } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [topicFilter, setTopicFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  
  // Modal State
  const [selectedQuestion, setSelectedQuestion] = useState(null);

  // 🔥 NEW: Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/admin/questions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(res.data);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [token]);

  // Reset to page 1 if the admin types in the search bar or changes a filter
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, topicFilter, difficultyFilter]);

  // The Filter Engine
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTopic = topicFilter === 'All' || q.topic === topicFilter;
    const matchesDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    return matchesSearch && matchesTopic && matchesDifficulty;
  });

  // 🔥 NEW: Pagination Math
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentQuestions = filteredQuestions.slice(indexOfFirstItem, indexOfLastItem);

  const diffColors = {
    "EASY": "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
    "MEDIUM": "text-amber-400 bg-amber-400/10 border-amber-400/20",
    "HARD": "text-red-400 bg-red-400/10 border-red-400/20"
  };

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* HEADER & FILTERS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Question Log</h2>
          <p className="text-sm text-slate-400 mt-1">Review Arena Challenges and monitor global success rates.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-all"
            />
          </div>
          <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none cursor-pointer">
            <option value="All">All Topics</option>
            <option value="Algorithms">Algorithms</option>
            <option value="Hashing">Hashing</option>
            <option value="Strings">Strings</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Sliding Window">Sliding Window</option>
            <option value="Two Pointers">Two Pointers</option>
            <option value= "Dynamic Programming">Dynamic Programming</option>
          </select>
          <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none cursor-pointer">
            <option value="All">All Difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>
      </div>

      {/* QUESTION TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-widest font-semibold">
                <th className="p-4 pl-6 w-16">S.No</th>
                <th className="p-4">Challenge Title</th>
                <th className="p-4">Topic</th>
                <th className="p-4">Difficulty</th>
                <th className="p-4 text-right pr-6">EXP Reward</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500 animate-pulse">Scanning database...</td></tr>
              ) : currentQuestions.length === 0 ? (
                <tr><td colSpan="5" className="p-8 text-center text-slate-500">No challenges found matching your criteria.</td></tr>
              ) : (
                currentQuestions.map((q, index) => (
                  <tr 
                    key={q._id} 
                    onClick={() => setSelectedQuestion(q)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    {/* 🔥 Make sure S.No increments correctly across pages! */}
                    <td className="p-4 pl-6 text-slate-500 font-mono text-sm">{indexOfFirstItem + index + 1}</td>
                    <td className="p-4 font-bold text-white group-hover:text-blue-400 transition-colors">{q.title}</td>
                    <td className="p-4 text-slate-400 text-sm">{q.topic}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold border ${diffColors[q.difficulty]}`}>
                        {q.difficulty}
                      </span>
                    </td>
                    <td className="p-4 text-right pr-6 font-mono text-blue-400 font-bold">{q.expReward}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 🔥 NEW: PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950 shrink-0">
            <span className="text-sm text-slate-400">
              Showing <span className="font-bold text-white">{indexOfFirstItem + 1}</span> to <span className="font-bold text-white">{Math.min(indexOfLastItem, filteredQuestions.length)}</span> of <span className="font-bold text-white">{filteredQuestions.length}</span> challenges
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-bold text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <div className="flex items-center px-4 text-sm font-bold text-slate-400 bg-slate-900/50 border border-slate-800 rounded-lg">
                Page {currentPage} of {totalPages}
              </div>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-bold text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= QUESTION DOSSIER MODAL ================= */}
      {selectedQuestion && (
        <div className="fixed inset-0 z- flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <Code className="w-6 h-6 text-blue-400" />
                <h3 className="text-xl font-bold text-white tracking-wide">{selectedQuestion.title}</h3>
                <span className={`ml-4 px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${diffColors[selectedQuestion.difficulty]}`}>
                  {selectedQuestion.difficulty}
                </span>
              </div>
              <button onClick={() => setSelectedQuestion(null)} className="text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 p-2 rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
              
              {/* 🔥 LIVE ANALYTICS STRIP 🔥 */}
              <div className="flex flex-wrap gap-4 bg-slate-950/50 p-5 rounded-xl border border-slate-800">
                <div className="flex-1 min-w-[120px]">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1"><Activity className="w-3 h-3"/> Total Attempts</p>
                  <p className="text-2xl text-white font-mono">{selectedQuestion.totalAttempts || 0}</p>
                </div>
                <div className="flex-1 min-w-[120px] border-l border-slate-800 pl-4">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1"><Target className="w-3 h-3"/> Success Rate</p>
                  <p className="text-2xl text-emerald-400 font-mono">
                    {selectedQuestion.totalAttempts > 0 
                      ? ((selectedQuestion.successfulAttempts / selectedQuestion.totalAttempts) * 100).toFixed(1) 
                      : "0.0"}%
                  </p>
                </div>
                <div className="flex-1 min-w-[120px] border-l border-slate-800 pl-4">
                  <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1"><Zap className="w-3 h-3"/> Difficulty Weight</p>
                  <p className="text-2xl text-blue-400 font-mono">{selectedQuestion.expReward} <span className="text-sm text-slate-500">XP</span></p>
                </div>
              </div>

              {/* Mission Brief */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2">Mission Brief</h4>
                <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{selectedQuestion.description}</p>
              </div>

              {/* Master Test Cases */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-800 pb-2 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" /> Master Test Cases
                </h4>
                <div className="grid grid-cols-1 gap-3">
                  {selectedQuestion.testCases?.map((tc, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border font-mono text-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${tc.isHidden ? 'bg-orange-950/20 border-orange-500/20' : 'bg-slate-950 border-slate-800'}`}>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 text-xs mt-0.5">INPUT:</span> 
                          <span className="text-white break-all">{tc.input}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500 text-xs mt-0.5">EXPECTED:</span> 
                          <span className="text-emerald-400 font-bold break-all">{tc.output}</span>
                        </div>
                      </div>
                      {tc.isHidden && (
                        <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg uppercase tracking-wider shrink-0 border border-orange-500/20">
                          <EyeOff className="w-3.5 h-3.5" /> Hidden Case
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}