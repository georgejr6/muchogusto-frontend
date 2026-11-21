import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false, allowPending = false }) => {
  const { isUserAuthenticated, isAdminAuthenticated, loading, userProfile } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-primary">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAdmin) {
    if (!isAdminAuthenticated) {
      return <Navigate to="/admin-login" replace state={{ from: location.pathname + location.search }} />;
    }
    return children;
  }

  if (!isUserAuthenticated) {
    // Send members to Login (not Signup) and remember where they were headed.
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  // Invite-only: signed-in but not yet approved members only see the waiting page.
  if (!allowPending && userProfile && userProfile.access_status !== 'approved') {
    return <Navigate to="/pending" replace />;
  }

  return children;
};

export default ProtectedRoute;
