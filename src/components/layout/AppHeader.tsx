import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Bell, User as UserIcon } from 'lucide-react';
import { UserProfile } from '../../types';

interface AppHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  profile?: UserProfile | null;
  unreadCount?: number;
  rightAction?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBack = false,
  onBack,
  profile,
  unreadCount = 0,
  rightAction,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 sm:h-16 bg-surface/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {showBack && (
          <button
            type="button"
            onClick={handleBack}
            className="p-2 -ml-2 rounded-control text-text-muted hover:text-text-strong hover:bg-slate-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-base sm:text-lg font-bold text-text-strong truncate">
          {title || 'Catering Force'}
        </h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {rightAction}

        {profile && (
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="relative p-2 rounded-control text-text-muted hover:text-text-strong hover:bg-slate-100 transition-colors"
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-danger rounded-full ring-2 ring-white" />
            )}
          </button>
        )}

        {profile && (
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-control hover:bg-slate-100 transition-colors"
            aria-label="View profile"
          >
            <div className="w-8 h-8 rounded-full bg-teal-100 border border-teal-200 text-primary flex items-center justify-center text-xs font-bold shrink-0">
              {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
          </button>
        )}
      </div>
    </header>
  );
};
