import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import PatientDashboard from './pages/PatientDashboard';
import PatientUpload from './pages/PatientUpload';
import PatientTimeline from './pages/PatientTimeline';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientView from './pages/PatientView';
import OnboardingPage from './pages/OnboardingPage';

// Components
import Navbar from './components/Navbar';
import Healtheu from './components/Healtheu';

const ProtectedRoute = ({ children, role }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="h-screen w-screen flex items-center justify-center font-sans tracking-tight text-gray-400 font-bold">Loading MedVault...</div>;
  if (!user) return <Navigate to="/login" />;
  
  // Enforce onboarding if not done, unless already on onboarding page
  // Route is /onboarding, so we need to know if we are there. 
  // Actually, Route path="/onboarding" handles it.
  
  if (!user.onboarded && window.location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'patient' ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }
  
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-[#f5f7fa] font-sans text-[#1a1c1e] select-none">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            {/* Onboarding */}
            <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />

            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={
              <ProtectedRoute role="patient">
                <>
                  <Navbar />
                  <PatientDashboard />
                  <Healtheu />
                </>
              </ProtectedRoute>
            } />
            <Route path="/patient/upload" element={
              <ProtectedRoute role="patient">
                <>
                  <Navbar />
                  <PatientUpload />
                </>
              </ProtectedRoute>
            } />
            <Route path="/patient/timeline" element={
              <ProtectedRoute role="patient">
                <>
                  <Navbar />
                  <PatientTimeline />
                </>
              </ProtectedRoute>
            } />

            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={
              <ProtectedRoute role="doctor">
                <>
                  <Navbar />
                  <DoctorDashboard />
                  <Healtheu />
                </>
              </ProtectedRoute>
            } />
            <Route path="/doctor/patient/:id" element={
              <ProtectedRoute role="doctor">
                <>
                  <Navbar />
                  <PatientView />
                </>
              </ProtectedRoute>
            } />

            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
