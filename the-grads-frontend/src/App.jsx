import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext'; 

// Import your pages
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import ChatBox from './pages/ChatBox';
import VoiceRoom from './pages/VoiceRoom';
import AdminDashboard from './pages/AdminDashboard';

// 🔥 We create an inner component so we can safely read the AuthContext
function AppRoutes() {
  // 🔥 THE FIX: We are explicitly pulling 'loading' out of the context here alongside 'user'
  const { user, loading } = useContext(AuthContext);

  // The Bouncer Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-[#03070b] flex flex-col items-center justify-center">
         <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
         <p className="text-blue-400 font-mono animate-pulse tracking-widest text-sm uppercase">Initializing Secure Connection...</p>
      </div>
    );
  }

  // Your Normal Routes
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/community/chat" element={<ChatBox />} />
      <Route path="/community/voice" element={<VoiceRoom />} />
      
      {/* THE ADMIN ROUTE */}
      <Route path="/admin-dashboard" element={
        user?.role === 'ADMIN' ? <AdminDashboard /> : <Navigate to="/dashboard" />
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}