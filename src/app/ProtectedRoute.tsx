import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { Role } from '../types';
import { Skeleton } from '../components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { profile, role, accountStatus, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-medium text-text-muted">Connecting securely...</p>
      </div>
    );
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check account status
  if (accountStatus === 'pending' || accountStatus === 'rejected' || accountStatus === 'deactivated') {
    if (location.pathname !== '/status' && location.pathname !== '/apply') {
      return <Navigate to="/status" replace />;
    }
  }

  // Check role authorization
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to respective authorized home
    if (role === 'owner') return <Navigate to="/owner" replace />;
    if (role === 'captain') return <Navigate to="/captain" replace />;
    if (role === 'boy') return <Navigate to="/boy" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
