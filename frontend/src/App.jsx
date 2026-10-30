import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PageLoader } from './components/shared/LoadingSpinner';

import Home from './pages/Home';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';

function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) return <PageLoader />;
  if (!currentUser) return <Navigate to="/" replace />;
  // If allowedRoles specified and user role doesn't match, redirect to home
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="min-h-screen"
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/login/patient" element={<Login />} />
          <Route path="/login/doctor" element={<Login />} />
          <Route path="/patient/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-[#020617] text-slate-100 font-sans selection:bg-brand-500/30">
          {/* Global Toaster Support */}
          <Toaster 
            position="top-right" 
            theme="dark" 
            richColors 
            closeButton
            expand={false}
            toastOptions={{
              className: 'glass-morphism border-white/10 backdrop-blur-2xl rounded-2xl p-4 shadow-2xl',
              descriptionClassName: 'text-slate-400 font-medium',
              titleClassName: 'text-sm font-black uppercase tracking-widest',
            }}
          />

          <AnimatedRoutes />
        </div>
      </AuthProvider>
    </Router>
  );
}
