import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Calendar, 
  Users, 
  CreditCard, 
  MoreHorizontal, 
  CheckCircle2, 
  History, 
  Bell, 
  User, 
  Clock,
  DollarSign
} from 'lucide-react';
import { Role } from '../../types';

interface BottomNavProps {
  role: Role;
  unreadCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ role, unreadCount = 0 }) => {
  let navItems: { label: string; to: string; icon: React.ReactNode; badge?: number }[] = [];

  if (role === 'owner') {
    navItems = [
      { label: 'Dashboard', to: '/owner', icon: <Home className="w-5 h-5" /> },
      { label: 'Works', to: '/owner/works', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Users', to: '/owner/boys', icon: <Users className="w-5 h-5" /> },
      { label: 'Payments', to: '/owner/payments', icon: <CreditCard className="w-5 h-5" /> },
      { label: 'More', to: '/settings', icon: <MoreHorizontal className="w-5 h-5" /> },
    ];
  } else if (role === 'captain') {
    navItems = [
      { label: 'Dashboard', to: '/captain', icon: <Home className="w-5 h-5" /> },
      { label: 'Works', to: '/captain/works', icon: <Briefcase className="w-5 h-5" /> },
      { label: 'Attendance', to: '/captain/works', icon: <CheckCircle2 className="w-5 h-5" /> },
      { label: 'Biller', to: '/captain/works', icon: <DollarSign className="w-5 h-5" /> },
      { label: 'More', to: '/settings', icon: <MoreHorizontal className="w-5 h-5" /> },
    ];
  } else if (role === 'boy') {
    navItems = [
      { label: 'Home', to: '/boy', icon: <Home className="w-5 h-5" /> },
      { label: 'Confirmed', to: '/boy/confirmed', icon: <CheckCircle2 className="w-5 h-5" /> },
      { label: 'History', to: '/boy/history', icon: <History className="w-5 h-5" /> },
      { label: 'Alerts', to: '/notifications', icon: <Bell className="w-5 h-5" />, badge: unreadCount },
      { label: 'Profile', to: '/profile', icon: <User className="w-5 h-5" /> },
    ];
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-surface border-t border-border shadow-lg lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to + item.label}
            to={item.to}
            end={item.to === '/owner' || item.to === '/captain' || item.to === '/boy'}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center w-full h-full py-1 text-xs transition-colors select-none ${
                isActive ? 'text-primary font-semibold' : 'text-text-muted hover:text-text-strong'
              }`
            }
          >
            <div className="relative">
              {item.icon}
              {item.badge && item.badge > 0 ? (
                <span className="absolute -top-1.5 -right-2 px-1.5 py-0.2 bg-danger text-white text-[10px] font-bold rounded-full min-w-[16px] text-center">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              ) : null}
            </div>
            <span className="mt-1 text-[11px] leading-tight tracking-tight">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
