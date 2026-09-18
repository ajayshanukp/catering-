import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { DesktopSidebar } from '../components/layout/DesktopSidebar';
import { AppHeader } from '../components/layout/AppHeader';
import { BottomNav } from '../components/layout/BottomNav';
import { OfflineBanner } from '../components/layout/OfflineBanner';
import { workforceService } from '../services/workforceService';
import { Users } from 'lucide-react';

export const AppShell: React.FC = () => {
  const { profile, role, isOffline, unreadCount, logout, switchDevUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/owner') return 'Owner Command Center';
    if (path === '/owner/works') return 'Manage Works';
    if (path === '/owner/works/calendar') return 'Works Calendar';
    if (path === '/owner/works/new') return 'Add New Work';
    if (path === '/owner/applications') return 'Worker Applications';
    if (path === '/owner/boys') return 'Boys Directory';
    if (path === '/owner/captains') return 'Captains Directory';
    if (path === '/owner/wage-settings') return 'Standard Wage Settings';
    if (path === '/owner/captain-wages') return 'Captain Wages';
    if (path === '/owner/payments') return 'Global Payment Center';
    if (path === '/owner/history') return 'Global Work History';
    if (path === '/owner/search') return 'Exact Boy Search';
    if (path === '/owner/audit') return 'System Audit Logs';
    if (path === '/owner/settings') return 'System Settings';

    if (path === '/captain') return 'Captain Operations';
    if (path === '/captain/works') return 'Assigned Works';
    if (path === '/captain/wages') return 'My Captain Wages';
    if (path === '/captain/payments') return 'Payment History';
    if (path === '/captain/history') return 'Work History';

    if (path === '/boy') return 'Worker Home';
    if (path === '/boy/works') return 'Available Works';
    if (path === '/boy/confirmed') return 'Confirmed Works';
    if (path === '/boy/history') return 'My Work History';
    if (path === '/boy/payments') return 'My Wage & Payments';

    if (path === '/notifications') return 'Notifications';
    if (path === '/profile') return 'My Profile';
    if (path === '/profile/edit') return 'Edit Profile';
    if (path === '/settings') return 'Settings';

    if (path.includes('/works/')) return 'Work Details';
    return 'Catering Force';
  };

  const isSubPage = location.pathname.split('/').length > 2 && !['/owner/works', '/owner/boys', '/owner/captains'].includes(location.pathname);

  const allUsers = workforceService.getUsers();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-text-strong">
      <OfflineBanner isOffline={isOffline} />

      {/* Dev Mode Role Switcher Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 z-50">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-teal-400" />
          <span className="font-semibold text-slate-200">Dev Persona:</span>
          <span className="text-teal-300 font-medium">
            {profile?.fullName || 'Not Signed In'} ({profile?.role?.toUpperCase() || 'NONE'})
          </span>
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-slate-400 text-[11px] hidden sm:inline">Switch To:</span>
          {allUsers.map((u) => (
            <button
              key={u.uid}
              type="button"
              onClick={() => {
                switchDevUser(u.uid);
                if (u.role === 'owner') navigate('/owner');
                else if (u.role === 'captain') navigate('/captain');
                else if (u.role === 'boy') navigate('/boy');
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                profile?.uid === u.uid
                  ? 'bg-primary text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {u.fullName.split(' ')[0]} ({u.role.toUpperCase()})
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex w-full">
        {/* Persistent Desktop Sidebar */}
        {role && (
          <DesktopSidebar
            profile={profile}
            unreadCount={unreadCount}
            onLogout={logout}
          />
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          <AppHeader
            title={getPageTitle()}
            showBack={isSubPage}
            profile={profile}
            unreadCount={unreadCount}
          />

          <div className="flex-1 overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {role && <BottomNav role={role} unreadCount={unreadCount} />}
    </div>
  );
};
