import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { DesktopSidebar } from '../components/layout/DesktopSidebar';
import { AppHeader } from '../components/layout/AppHeader';
import { BottomNav } from '../components/layout/BottomNav';
import { OfflineBanner } from '../components/layout/OfflineBanner';

export const AppShell: React.FC = () => {
  const { profile, role, isOffline, unreadCount, logout } = useAuth();
  const location = useLocation();

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
    if (path === '/captain/my-works') return 'Assigned Works';
    if (path === '/captain/works') return 'Browse Works';
    if (path === '/captain/wages') return 'My Wage Rates';
    if (path === '/captain/payments') return 'Payment Records';
    if (path === '/captain/history') return 'Operations History';

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

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-text-strong">
      <OfflineBanner isOffline={isOffline} />

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
