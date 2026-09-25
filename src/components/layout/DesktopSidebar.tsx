import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Briefcase, 
  Calendar, 
  UserCheck, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  DollarSign, 
  CreditCard, 
  History, 
  Search, 
  Bell, 
  Shield, 
  Settings, 
  LogOut,
  Sparkles,
  Award
} from 'lucide-react';
import { UserProfile } from '../../types';

interface DesktopSidebarProps {
  profile: UserProfile | null;
  unreadCount?: number;
  onLogout: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({ profile, unreadCount = 0, onLogout }) => {
  if (!profile) return null;

  const role = profile.role;
  const displayName = (profile.fullName || '').trim();
  const displayId = (profile.currentOfficialId || '').trim();
  const displayMobile = (profile.mobileNumber || '').trim();
  const avatarLabel = displayName || displayId || 'User';
  const avatarInitial = avatarLabel.charAt(0).toUpperCase();

  let navSections: {
    title?: string;
    items: { label: string; to: string; icon: React.ReactNode; badge?: number }[];
  }[] = [];

  if (role === 'owner') {
    navSections = [
      {
        title: 'Operations',
        items: [
          { label: 'Dashboard', to: '/owner', icon: <Home className="w-4 h-4" /> },
          { label: 'Works', to: '/owner/works', icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Calendar', to: '/owner/works/calendar', icon: <Calendar className="w-4 h-4" /> },
          { label: 'Applications', to: '/owner/applications', icon: <UserCheck className="w-4 h-4" /> },
        ]
      },
      {
        title: 'Workforce',
        items: [
          { label: 'Boys', to: '/owner/boys', icon: <Users className="w-4 h-4" /> },
          { label: 'Captains', to: '/owner/captains', icon: <Award className="w-4 h-4" /> },
          { label: 'Search Boy ID', to: '/owner/search', icon: <Search className="w-4 h-4" /> },
        ]
      },
      {
        title: 'Financials',
        items: [
          { label: 'Wage Settings', to: '/owner/wage-settings', icon: <DollarSign className="w-4 h-4" /> },
          { label: 'Captain Wages', to: '/owner/captain-wages', icon: <CreditCard className="w-4 h-4" /> },
          { label: 'Payments Center', to: '/owner/payments', icon: <CreditCard className="w-4 h-4" /> },
        ]
      },
      {
        title: 'System & Audit',
        items: [
          { label: 'Work History', to: '/owner/history', icon: <History className="w-4 h-4" /> },
          { label: 'Notifications', to: '/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
          { label: 'Audit Logs', to: '/owner/audit', icon: <Shield className="w-4 h-4" /> },
          { label: 'Settings', to: '/owner/settings', icon: <Settings className="w-4 h-4" /> },
        ]
      }
    ];
  } else if (role === 'captain') {
    navSections = [
      {
        title: 'Operations',
        items: [
          { label: 'Dashboard', to: '/captain', icon: <Home className="w-4 h-4" /> },
          { label: 'Assigned Works', to: '/captain/works', icon: <Briefcase className="w-4 h-4" /> },
        ]
      },
      {
        title: 'Financials',
        items: [
          { label: 'Captain Wages', to: '/captain/wages', icon: <DollarSign className="w-4 h-4" /> },
          { label: 'Payment History', to: '/captain/payments', icon: <CreditCard className="w-4 h-4" /> },
        ]
      },
      {
        title: 'Account',
        items: [
          { label: 'Work History', to: '/captain/history', icon: <History className="w-4 h-4" /> },
          { label: 'Notifications', to: '/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
          { label: 'Profile', to: '/profile', icon: <Users className="w-4 h-4" /> },
          { label: 'Settings', to: '/settings', icon: <Settings className="w-4 h-4" /> },
        ]
      }
    ];
  } else if (role === 'boy') {
    navSections = [
      {
        title: 'Works',
        items: [
          { label: 'Home', to: '/boy', icon: <Home className="w-4 h-4" /> },
          { label: 'Available Works', to: '/boy/works', icon: <Briefcase className="w-4 h-4" /> },
          { label: 'Confirmed Works', to: '/boy/confirmed', icon: <CheckCircle2 className="w-4 h-4" /> },
        ]
      },
      {
        title: 'Records & Profile',
        items: [
          { label: 'Work History', to: '/boy/history', icon: <History className="w-4 h-4" /> },
          { label: 'Wage & Payments', to: '/boy/payments', icon: <DollarSign className="w-4 h-4" /> },
          { label: 'Notifications', to: '/notifications', icon: <Bell className="w-4 h-4" />, badge: unreadCount },
          { label: 'Profile', to: '/profile', icon: <Users className="w-4 h-4" /> },
          { label: 'Settings', to: '/settings', icon: <Settings className="w-4 h-4" /> },
        ]
      }
    ];
  }

  return (
    <aside
      className="hidden lg:flex flex-col w-64 bg-surface border-r border-border shrink-0 select-none min-h-[100dvh]"
      aria-label="Desktop Sidebar"
    >
      {/* App Branding */}
      <div className="h-16 flex items-center px-6 border-b border-border gap-3">
        <div className="w-9 h-9 rounded-control bg-primary flex items-center justify-center text-white font-bold shadow-subtle">
          CW
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-text-strong">Catering Force</span>
          <span className="text-[11px] text-text-muted font-medium">Workforce Mgmt</span>
        </div>
      </div>

      {/* Role Pill */}
      <div className="px-6 py-3.5 border-b border-border/60 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-xs font-semibold text-text-strong uppercase tracking-wider">{role}</span>
        </div>
        <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-white border border-border text-slate-700">
          {displayId || displayName || 'N/A'}
        </span>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {section.title && (
              <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.title}
              </h4>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to + item.label}
                to={item.to}
                end={item.to === '/owner' || item.to === '/captain' || item.to === '/boy'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-control text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-primary-light text-primary font-semibold border border-primary-border shadow-xs'
                      : 'text-text-muted hover:text-text-strong hover:bg-slate-100/80'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="px-1.5 py-0.5 bg-danger text-white text-[10px] font-bold rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* User profile & logout footer */}
      <div className="p-4 border-t border-border bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs font-bold text-slate-700 shrink-0">
              {avatarInitial}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-text-strong truncate">{displayName || 'Unnamed User'}</p>
              <p className="text-[11px] text-text-muted truncate">{displayMobile || 'No mobile number'}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onLogout}
            title="Sign out"
            className="p-2 rounded-control text-text-muted hover:text-danger hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
