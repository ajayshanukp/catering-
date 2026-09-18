import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Clock, XCircle, AlertTriangle, RefreshCw, LogOut, Edit3 } from 'lucide-react';

export const StatusPage: React.FC = () => {
  const { profile, accountStatus, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = () => {
    refreshProfile();
    // If approved, redirect to home
    if (profile?.accountStatus === 'active') {
      if (profile.role === 'owner') navigate('/owner');
      else if (profile.role === 'captain') navigate('/captain');
      else navigate('/boy');
    }
  };

  if (!profile) return null;

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-lg">
        <Card padding="lg" className="shadow-elevated text-center">
          {accountStatus === 'pending' && (
            <div>
              <div className="w-16 h-16 rounded-full bg-amber-100 border border-amber-200 text-warning mx-auto flex items-center justify-center mb-4">
                <Clock className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text-strong mb-2">Application Under Review</h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                Thank you for applying, <span className="font-semibold text-text-strong">{profile.fullName || 'Worker'}</span>. Your profile details have been submitted to management for verification. Once approved, you will receive your official Boy ID and access to Available Works.
              </p>

              <div className="bg-slate-50 border border-border rounded-control p-4 text-left text-xs space-y-2 mb-6">
                <div className="flex justify-between">
                  <span className="text-text-muted">Registered Mobile:</span>
                  <span className="font-medium text-text-strong">{profile.mobileNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Location:</span>
                  <span className="font-medium text-text-strong">{profile.exactPlace}, {profile.district}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Status:</span>
                  <span className="font-bold text-warning">Pending Approval</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={handleRefresh}
                  icon={<RefreshCw className="w-4 h-4" />}
                >
                  Check Approval Status
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={logout}
                  icon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {accountStatus === 'rejected' && (
            <div>
              <div className="w-16 h-16 rounded-full bg-red-100 border border-red-200 text-danger mx-auto flex items-center justify-center mb-4">
                <XCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-danger mb-2">Application Needs Revision</h2>
              <p className="text-sm text-text-muted mb-4 leading-relaxed">
                Your application could not be approved at this time. Management noted the following reason:
              </p>

              <div className="bg-danger-light border border-danger-border rounded-control p-4 text-left text-xs mb-6">
                <p className="font-bold text-danger uppercase tracking-wider mb-1">Reason for Rejection:</p>
                <p className="text-slate-800 font-medium">{profile.rejectionReason || 'Incomplete details or invalid documents.'}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => navigate('/apply')}
                  icon={<Edit3 className="w-4 h-4" />}
                >
                  Edit & Resubmit
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  fullWidth
                  onClick={logout}
                  icon={<LogOut className="w-4 h-4" />}
                >
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {accountStatus === 'deactivated' && (
            <div>
              <div className="w-16 h-16 rounded-full bg-slate-200 border border-slate-300 text-slate-600 mx-auto flex items-center justify-center mb-4">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-text-strong mb-2">Account Deactivated</h2>
              <p className="text-sm text-text-muted mb-6 leading-relaxed">
                Your workforce account has been temporarily or permanently deactivated by management. Your historical records and payments are securely preserved.
              </p>

              <div className="p-4 bg-slate-100 border border-border rounded-control text-xs text-text-muted mb-6">
                Please contact the Catering Workforce Administrator to resolve account status.
              </div>

              <Button
                variant="outline"
                size="md"
                fullWidth
                onClick={logout}
                icon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
