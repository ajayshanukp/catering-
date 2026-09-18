import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Button } from '../../components/ui/Button';

export const SplashScreen: React.FC = () => {
  const { profile, role, accountStatus, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (!profile) {
        navigate('/login', { replace: true });
      } else if (accountStatus === 'pending' || accountStatus === 'rejected' || accountStatus === 'deactivated') {
        navigate('/status', { replace: true });
      } else if (role === 'owner') {
        navigate('/owner', { replace: true });
      } else if (role === 'captain') {
        navigate('/captain', { replace: true });
      } else if (role === 'boy') {
        navigate('/boy', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [profile, role, accountStatus, isLoading, navigate]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-16 h-16 rounded-panel bg-primary flex items-center justify-center text-white text-2xl font-black shadow-elevated mb-6 animate-pulse">
        CW
      </div>
      <h1 className="text-xl font-bold text-text-strong mb-2">Catering Workforce</h1>
      <p className="text-xs text-text-muted mb-6">Operations & Staffing Platform</p>

      {isLoading ? (
        <div className="flex items-center gap-2 text-xs font-medium text-text-muted">
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span>Connecting securely...</span>
        </div>
      ) : (
        <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
          Retry
        </Button>
      )}
    </div>
  );
};
