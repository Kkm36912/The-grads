import React, { useState, useEffect, useContext } from 'react';
import { Search, UserX, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';

export default function StudentLog() {
  const [students, setStudents] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { token } = useContext(AuthContext); 

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const fetchStudents = async (query = '') => {
    if (!token || token === 'undefined' || typeof token !== 'string') {
      return; 
    }

    try {
      setLoading(true);
      const res = await axios.get(`https://the-grads.onrender.com/api/admin/students?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // 🔥 THE FIX: Tell React exactly which part of the data is the array!
      if (res.data && res.data.students) {
        setStudents(res.data.students);
        setTotalQuestions(res.data.totalQuestions);
      } else {
        // Fallback just in case
        setStudents(res.data);
      }
      
    } catch (err) {
      console.error("Failed to fetch students", err);
      alert("API FAILED: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchStudents();
  }, [token]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchStudents(searchQuery);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`https://the-grads.onrender.com/api/admin/students/${selectedStudent._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsDeleteConfirmOpen(false);
      setSelectedStudent(null);
      fetchStudents(searchQuery); 
    } catch (err) {
      console.error("Failed to delete student", err);
      alert("Failed to delete student. Check console.");
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      
      {/* HEADER & SEARCH BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight">Student Database</h2>
          <p className="text-sm text-slate-400 mt-1">Manage platform access and review academic metrics.</p>
        </div>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
          />
        </form>
      </div>

      {/* STUDENT DATA GRID */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 text-sm uppercase tracking-wider font-semibold">
                <th className="p-4 pl-6 w-16">S.No</th>
                <th className="p-4">Student Name</th>
                <th className="p-4">Experience (EXP)</th>
                <th className="p-4">Current Streak</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500 animate-pulse">Retrieving records...</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-slate-500">No students found matching your criteria.</td></tr>
              ) : (
                students.map((student, index) => (
                  <tr 
                    key={student._id} 
                    onClick={() => setSelectedStudent(student)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4 pl-6 text-slate-500 font-mono">{index + 1}</td>
                    <td className="p-4">
                      <p className="text-white font-medium group-hover:text-blue-400 transition-colors">{student.fullName}</p>
                      <p className="text-xs text-slate-500">{student.email}</p>
                    </td>
                    <td className="p-4 text-blue-400 font-mono font-bold">{(student.experiencePoints || 0).toLocaleString()}</td>
                    <td className="p-4 text-orange-400 font-mono font-bold flex items-center gap-1">
                       🔥 {student.streak || 0}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= STUDENT DOSSIER MODAL ================= */}
      {selectedStudent && !isDeleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950">
              <h3 className="text-xl font-bold text-white">Student Dossier</h3>
              <button onClick={() => setSelectedStudent(null)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>

            <div className="p-6">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-2xl font-bold text-blue-400 uppercase">
                  {selectedStudent.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedStudent.fullName}</h2>
                  <p className="text-slate-400 font-mono text-sm">{selectedStudent.email}</p>
                </div>
              </div>

              {/* Stats Grid (LIVE DATA) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center">
                  <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mb-1">Total EXP</p>
                  <p className="text-xl text-blue-400 font-mono font-bold">{(selectedStudent.experiencePoints || 0).toLocaleString()}</p>
                </div>
                <div className="bg-slate-950 border border-emerald-900/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-emerald-500 uppercase font-bold tracking-widest mb-1">Easy</p>
                  {/* 🔥 LIVE EASY COUNT */}
                  <p className="text-xl text-white font-mono font-bold">{selectedStudent.liveStats?.easy || 0}</p>
                </div>
                <div className="bg-slate-950 border border-yellow-900/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-yellow-500 uppercase font-bold tracking-widest mb-1">Medium</p>
                  {/* 🔥 LIVE MEDIUM COUNT */}
                  <p className="text-xl text-white font-mono font-bold">{selectedStudent.liveStats?.medium || 0}</p>
                </div>
                <div className="bg-slate-950 border border-red-900/30 rounded-xl p-4 text-center">
                  <p className="text-xs text-red-500 uppercase font-bold tracking-widest mb-1">Hard</p>
                  {/* 🔥 LIVE HARD COUNT */}
                  <p className="text-xl text-white font-mono font-bold">{selectedStudent.liveStats?.hard || 0}</p>
                </div>
              </div>

              {/* ================= PLATFORM METRICS (LIVE DATA) ================= */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 mb-8">
                <div className="mb-5">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Arena Progress</p>
                      <p className="text-sm text-slate-300">Total Questions Conquered</p>
                    </div>
                    <p className="text-xl text-blue-400 font-mono font-bold">
                      {/* 🔥 LIVE TOTAL SOLVED vs LIVE DB TOTAL */}
                      {selectedStudent.totalSolved || 0} <span className="text-sm text-slate-500">/ {totalQuestions}</span>
                    </p>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${((selectedStudent.totalSolved || 0) / (totalQuestions || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800 pt-4">
                  <div>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-1">Primary Weapon</p>
                     <p className="text-sm text-slate-300">Most used language</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md">
                     {/* 🔥 LIVE CALCULATED LANGUAGE */}
                     <p className="text-sm text-emerald-400 font-mono font-bold">
                        {selectedStudent.primaryLanguage || 'N/A'}
                     </p>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="mt-8 border-t border-red-900/30 pt-6">
                <p className="text-xs text-red-500 font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4" /> Administrative Actions
                </p>
                <button 
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="w-full md:w-auto px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/50 rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                >
                  <UserX className="w-5 h-5" />
                  PERMANENTLY BAN & DELETE STUDENT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= CONFIRMATION MODAL ================= */}
      {isDeleteConfirmOpen && (
        <div className="fixed inset-0 z- flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-slate-950 border border-red-500/30 rounded-2xl w-full max-w-md p-6 text-center animate-in zoom-in-95 duration-200">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Are you absolutely sure?</h3>
            <p className="text-slate-400 mb-6">
              This action will permanently delete <strong className="text-white">{selectedStudent?.fullName}</strong> from the database. All their experience, streaks, and data will be wiped. This cannot be undone.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteConfirmOpen(false)}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors"
              >
                Cancel Action
              </button>
              <button 
                onClick={executeDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white rounded-lg font-bold transition-colors shadow-[0_0_15px_rgba(220,38,38,0.4)]"
              >
                Yes, Delete Student
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}