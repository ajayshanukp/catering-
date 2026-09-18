import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { role } = useAuth();
  const navigate = useNavigate();

  const handleGoHome = () => {
    if (role === 'owner') navigate('/owner');
    else if (role === 'captain') navigate('/captain');
    else if (role === 'boy') navigate('/boy');
    else navigate('/login');
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-6 bg-background">
      <Card padding="lg" className="max-w-md w-full text-center shadow-elevated">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
          <Compass className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-text-strong mb-2">404 — Page Not Found</h2>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          The operational page or Work record you are looking for does not exist or has been relocated.
        </p>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleGoHome}
          icon={<Home className="w-4 h-4" />}
        >
          Return to Dashboard
        </Button>
      </Card>
    </div>
  );
};
