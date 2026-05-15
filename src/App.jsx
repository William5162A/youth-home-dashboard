import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { auth } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Meetings from './pages/Meetings';
import Activities from './pages/Activities';
import Camps from './pages/Camps';

const ProtectedRoute = ({ children, user, loading }) => {
  if (loading) return <div className="flex h-screen items-center justify-center text-brand-blue font-bold">جاري التحميل...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
        
        <Route path="/" element={<ProtectedRoute user={user} loading={loading}><Dashboard /></ProtectedRoute>} />
        <Route path="/members" element={<ProtectedRoute user={user} loading={loading}><Members /></ProtectedRoute>} />
        <Route path="/meetings" element={<ProtectedRoute user={user} loading={loading}><Meetings /></ProtectedRoute>} />
        <Route path="/activities" element={<ProtectedRoute user={user} loading={loading}><Activities /></ProtectedRoute>} />
        <Route path="/camps" element={<ProtectedRoute user={user} loading={loading}><Camps /></ProtectedRoute>} />
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}