import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const OtpVerify: React.FC = () => {
  const { pendingPhone, verifyOtp, setPendingPhone } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(30);
  const navigate = useNavigate();

  useEffect(() => {
    if (!pendingPhone) {
      navigate('/login', { replace: true });
    }
  }, [pendingPhone, navigate]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const user = await verifyOtp(code);
      if (!user.fullName || user.accountStatus === 'pending') {
        if (!user.fullName) {
          navigate('/apply', { replace: true });
        } else {
          navigate('/status', { replace: true });
        }
      } else if (user.accountStatus === 'rejected' || user.accountStatus === 'deactivated') {
        navigate('/status', { replace: true });
      } else if (user.role === 'owner') {
        navigate('/owner', { replace: true });
      } else if (user.role === 'captain') {
        navigate('/captain', { replace: true });
      } else {
        navigate('/boy', { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeNumber = () => {
    setPendingPhone(null);
    navigate('/login');
  };

  const handleResend = () => {
    if (cooldown === 0) {
      setCooldown(30);
      setError('');
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={handleChangeNumber}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Number</span>
        </button>

        <Card padding="lg" className="shadow-elevated">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-text-strong tracking-tight">Enter Verification Code</h2>
            <p className="text-xs text-text-muted mt-1.5">
              Code sent to <span className="font-semibold text-text-strong">{pendingPhone}</span>
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center tracking-[0.4em] font-mono text-2xl font-bold py-3 bg-slate-50 border border-border rounded-control focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[52px]"
                autoFocus
              />
              {error && <p className="mt-2 text-xs text-danger font-medium text-center">{error}</p>}
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Tip: Enter any 6-digit code (e.g. 123456) in development
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              loadingText="Verifying..."
              disabled={code.length !== 6}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Verify & Proceed
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border flex items-center justify-between text-xs text-text-muted">
            <button
              type="button"
              onClick={handleChangeNumber}
              className="text-primary font-medium hover:underline"
            >
              Change number
            </button>

            <div>
              {cooldown > 0 ? (
                <span>Resend code in {cooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-primary font-bold hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
