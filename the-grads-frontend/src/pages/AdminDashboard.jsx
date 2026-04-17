import React, { useState, useContext } from 'react';
import { Users, FileText, BarChart3, LogOut, PlusCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, questions, students, create-question

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ================= SIDEBAR NAVIGATION =================
  const adminTabs = [
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'questions', label: 'Question Log', icon: FileText },
    { id: 'students', label: 'Student Log', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex selection:bg-blue-500/30">
      
      {/* ================= LEFT SIDEBAR (ENTERPRISE VIBE) ================= */}
      {/* Hides the sidebar completely if the HOD is creating a question */}
      {activeTab !== 'create-question' && (
        <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shadow-xl z-20">
          
          {/* HOD Profile Area */}
          {/* Logo & Profile Area */}
          <div className="flex flex-col border-b border-slate-800 bg-slate-900/50">
            {/* Official Logo */}
            <div className="h-24 flex items-center px-6 border-b border-slate-800 bg-slate-950">
               <img src="/logo-main.png" alt="The Grads" className="h-12 w-auto object-contain" />
            </div>
            
            {/* Minimalist Profile */}
            <div className="p-6">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Administration</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{user?.fullName || "Administrator"}</p>
                  <p className="text-[10px] text-blue-400 uppercase tracking-widest font-semibold">System Admin</p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Management</p>
            
            {adminTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] font-semibold' 
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span className="text-base">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Create Question Action Button (Bottom Left as requested) */}
          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={() => setActiveTab('create-question')}
              className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors shadow-lg"
            >
              <PlusCircle className="w-5 h-5" />
              CREATE QUESTION
            </button>
            
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 mt-3 border border-slate-700 text-slate-300 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg font-medium transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* ================= MAIN CONTENT AREA ================= */}
      <main className="flex-1 relative overflow-y-auto bg-slate-900 p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Section Routing */}
          {activeTab === 'analytics' && (
            <div>
              <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4 mb-6">Platform Analytics</h2>
              {/* Graph and Top Achievers will go here */}
              <div className="h-64 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                [ Analytics Graph Module Pending ]
              </div>
            </div>
          )}

          {activeTab === 'questions' && (
            <div>
              <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4 mb-6">Question Log</h2>
              {/* Question list will go here */}
              <div className="h-64 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                [ Question Log Module Pending ]
              </div>
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              <h2 className="text-3xl font-bold text-white border-b border-slate-800 pb-4 mb-6">Student Database</h2>
              {/* Student Search and Grid will go here */}
              <div className="h-64 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                [ Student Database Module Pending ]
              </div>
            </div>
          )}

          {activeTab === 'create-question' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                 <h2 className="text-3xl font-bold text-white">Create New Challenge</h2>
                 <button onClick={() => setActiveTab('questions')} className="text-slate-400 hover:text-white font-medium px-4 py-2 bg-slate-800 rounded-lg">
                   Cancel & Go Back
                 </button>
              </div>
              {/* Form will go here */}
              <div className="h-96 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500">
                [ Question Creation Form Pending ]
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}