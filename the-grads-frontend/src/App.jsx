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
  const { user } = useContext(AuthContext);

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/community/chat" element={<ChatBox />} />
      <Route path="/community/voice" element={<VoiceRoom />} />
      
      {/* 🔥 THE ADMIN ROUTE */}
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