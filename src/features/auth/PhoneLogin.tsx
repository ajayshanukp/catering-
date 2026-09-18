import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Phone, ArrowRight, ShieldCheck } from 'lucide-react';

export const PhoneLogin: React.FC = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { loginWithPhone } = useAuth();
  const navigate = useNavigate();

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    if (cleanNumber.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const e164 = `+91${cleanNumber}`;
      await loginWithPhone(e164);
      navigate('/verify');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center p-4 sm:p-6 bg-background">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-14 h-14 rounded-panel bg-primary mx-auto flex items-center justify-center text-white text-xl font-bold shadow-elevated mb-3">
            CW
          </div>
          <h2 className="text-2xl font-bold text-text-strong tracking-tight">Sign In to Workforce</h2>
          <p className="text-sm text-text-muted mt-1">Internal event staffing & operations portal</p>
        </div>

        <Card padding="lg" className="shadow-elevated">
          <form onSubmit={handleContinue} className="space-y-5">
            <div>
              <label htmlFor="mobile" className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1.5">
                Mobile Number <span className="text-danger">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 text-sm font-semibold text-slate-500 select-none">
                  +91
                </span>
                <input
                  id="mobile"
                  type="tel"
                  placeholder="98765 43210"
                  maxLength={10}
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-14 pr-4 py-2.5 bg-white border border-border rounded-control text-sm font-medium text-text-strong placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]"
                  autoFocus
                />
              </div>
              {error && <p className="mt-1.5 text-xs text-danger font-medium">{error}</p>}
              <p className="mt-1.5 text-[11px] text-text-muted">
                We'll send a 6-digit one-time code to verify your phone.
              </p>
            </div>

            {/* Firebase reCAPTCHA container for Phone Auth */}
            <div id="recaptcha-container" className="my-1 flex justify-center"></div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              loadingText="Sending OTP..."
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-border flex items-center justify-center gap-2 text-xs text-text-muted text-center">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>Authorized workforce portal. Unregistered workers will apply after verification.</span>
          </div>
        </Card>
      </div>
    </div>
  );
};
