
import React from 'react';
import { Navigate, Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/lib/i18n.jsx';
import { Toaster } from '@/components/ui/toaster';
import ScrollToTop from '@/components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public Pages
import HomePage from '@/pages/HomePage';
import PublicEventPage from '@/pages/PublicEventPage';
import EventFeedbackPage from '@/pages/EventFeedbackPage';
import SignupPage from '@/pages/SignupPage';
import QRCodePage from '@/pages/QRCodePage';
import UserInbox from '@/pages/UserInbox';
import RSVPsPage from '@/pages/RSVPsPage';
import ConsentPage from '@/pages/ConsentPage';
import OAuthCallbackPage from '@/pages/OAuthCallbackPage';

// User Protected Pages
import ProfileEditPage from '@/pages/ProfileEditPage';
import MyProfilePage from '@/pages/MyProfilePage';

// Admin Pages
import AdminLoginPage from '@/pages/AdminLoginPage';
import LoginPage from '@/pages/LoginPage';
import AdminDashboard from '@/pages/AdminDashboard';
import EventPage from '@/pages/EventPage';
import UserProfilePage from '@/pages/UserProfilePage';
import SettingsPage from '@/pages/SettingsPage';

// v2 member pages
import TonightPage from '@/pages/guest/TonightPage';
import InvitesPage from '@/pages/guest/InvitesPage';
import InviteDetailPage from '@/pages/guest/InviteDetailPage';
import NotificationsPage from '@/pages/guest/NotificationsPage';
import VerifyPage from '@/pages/guest/VerifyPage';
import WelcomePage from '@/pages/guest/WelcomePage';
import MePage from '@/pages/guest/MePage';
import PublicHostPage from '@/pages/PublicHostPage';
import PrivacyPage from '@/pages/PrivacyPage';
import PendingPage from '@/pages/guest/PendingPage';
import PassPage from '@/pages/guest/PassPage';

// v2 host pages
import HostDeckPage from '@/pages/host/HostDeckPage';
import HostEventsPage from '@/pages/host/HostEventsPage';
import HostEventBoardPage from '@/pages/host/HostEventBoardPage';
import HostCitiesPage from '@/pages/host/HostCitiesPage';
import HostVerificationPage from '@/pages/host/HostVerificationPage';
import HostProfilePage from '@/pages/host/HostProfilePage';
import HostAccessPage from '@/pages/host/HostAccessPage';
import HostScanPage from '@/pages/host/HostScanPage';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/e/:shareToken" element={<PublicEventPage />} />
            <Route path="/feedback/:shareToken" element={<EventFeedbackPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/join/:code" element={<SignupPage />} />
            <Route path="/qr-code" element={<QRCodePage />} />
            <Route
              path="/inbox"
              element={
                <ProtectedRoute>
                  <UserInbox />
                </ProtectedRoute>
              }
            />
            {/* Public RSVPs Route (Anonymized for non-admins) */}
            <Route path="/rsvps" element={<RSVPsPage />} />
            {/* Consent walkthrough */}
            <Route path="/consent/:invitationId" element={<ConsentPage />} />
            {/* OAuth callback */}
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />
            
            <Route path="/h/:handle" element={<PublicHostPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />

            {/* v2 member app */}
            <Route path="/pending" element={<ProtectedRoute allowPending><PendingPage /></ProtectedRoute>} />
            <Route path="/pass" element={<ProtectedRoute><PassPage /></ProtectedRoute>} />
            <Route path="/welcome" element={<ProtectedRoute><WelcomePage /></ProtectedRoute>} />
            <Route path="/tonight" element={<ProtectedRoute><TonightPage /></ProtectedRoute>} />
            <Route path="/invites" element={<ProtectedRoute><InvitesPage /></ProtectedRoute>} />
            <Route path="/invites/:id" element={<ProtectedRoute><InviteDetailPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/verify" element={<ProtectedRoute><VerifyPage /></ProtectedRoute>} />
            <Route path="/me" element={<ProtectedRoute><MePage /></ProtectedRoute>} />

            {/* v2 host app */}
            <Route path="/host" element={<ProtectedRoute requireAdmin><HostDeckPage /></ProtectedRoute>} />
            <Route path="/host/events" element={<ProtectedRoute requireAdmin><HostEventsPage /></ProtectedRoute>} />
            <Route path="/host/events/:id" element={<ProtectedRoute requireAdmin><HostEventBoardPage /></ProtectedRoute>} />
            <Route path="/host/cities" element={<ProtectedRoute requireAdmin><HostCitiesPage /></ProtectedRoute>} />
            <Route path="/host/verification" element={<ProtectedRoute requireAdmin><HostVerificationPage /></ProtectedRoute>} />
            <Route path="/host/access" element={<ProtectedRoute requireAdmin><HostAccessPage /></ProtectedRoute>} />
            <Route path="/host/events/:id/scan" element={<ProtectedRoute requireAdmin><HostScanPage /></ProtectedRoute>} />
            <Route path="/host/profile" element={<ProtectedRoute requireAdmin><HostProfilePage /></ProtectedRoute>} />

            {/* User Routes */}
            <Route path="/dashboard" element={<Navigate to="/tonight" replace />} />
            <Route
              path="/profile-edit"
              element={
                <ProtectedRoute>
                  <ProfileEditPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-profile"
              element={
                <ProtectedRoute>
                  <MyProfilePage />
                </ProtectedRoute>
              }
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsPage />
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
