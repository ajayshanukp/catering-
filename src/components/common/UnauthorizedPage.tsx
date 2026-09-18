import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ShieldAlert, Home } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
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
        <div className="w-16 h-16 rounded-full bg-red-100 text-danger mx-auto flex items-center justify-center mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-text-strong mb-2">Access Restricted</h2>
        <p className="text-xs text-text-muted mb-6 leading-relaxed">
          You do not have permission to view or manage this workforce section. Please contact the system Owner for elevated access privileges.
        </p>

        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleGoHome}
          icon={<Home className="w-4 h-4" />}
        >
          Back to Authorized Area
        </Button>
      </Card>
    </div>
  );
};
