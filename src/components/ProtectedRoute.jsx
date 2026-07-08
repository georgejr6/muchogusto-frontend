import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isUserAuthenticated, isAdminAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f001a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#D4AF37]">Loading...</p>
        </div>
      </div>
    );
  }

  if (requireAdmin) {
    if (!isAdminAuthenticated) {
      return <Navigate to="/admin-login" replace state={{ from: location.pathname }} />;
    }
    return children;
  }

  if (!isUserAuthenticated) {
    // Send members to Login (not Signup) and remember where they were headed.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
