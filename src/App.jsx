
import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/lib/i18n.jsx';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public Pages
import HomePage from '@/pages/HomePage';
import SignupPage from '@/pages/SignupPage';
import QRCodePage from '@/pages/QRCodePage';
import UserInbox from '@/pages/UserInbox';
import RSVPsPage from '@/pages/RSVPsPage';

// User Protected Pages
import DashboardPage from '@/pages/DashboardPage';
import ProfileEditPage from '@/pages/ProfileEditPage';

// Admin Pages
import AdminLoginPage from '@/pages/AdminLoginPage';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/pages/AdminDashboard';
import EventPage from '@/pages/EventPage';
import UserProfilePage from '@/pages/UserProfilePage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/qr-code" element={<QRCodePage />} />
            <Route path="/inbox" element={<UserInbox />} />
            {/* Public RSVPs Route (Anonymized for non-admins) */}
            <Route path="/rsvps" element={<RSVPsPage />} />
            
            {/* User Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile-edit" 
              element={
                <ProtectedRoute>
                  <ProfileEditPage />
                </ProtectedRoute>
              } 
            />

            {/* Login */}
            <Route path="/login" element={<LoginPage />} />

            {/* Admin Routes */}
            <Route path="/admin-login" element={<AdminLoginPage />} />
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/event/:eventname" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <EventPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/:userid" 
              element={
                <ProtectedRoute requireAdmin={true}>
                  <UserProfilePage />
                </ProtectedRoute>
              } 
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
