import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from './AppShell';
import { ProtectedRoute } from './ProtectedRoute';

// Public & Auth
import { SplashScreen } from '../features/auth/SplashScreen';
import { PhoneLogin } from '../features/auth/PhoneLogin';
import { OtpVerify } from '../features/auth/OtpVerify';
import { ApplyForm } from '../features/auth/ApplyForm';
import { StatusPage } from '../features/auth/StatusPage';

// Shared
import { NotificationsPage } from '../features/notifications/NotificationsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { EditProfilePage } from '../features/profile/EditProfilePage';
import { SettingsPage } from '../features/profile/SettingsPage';

// Owner Pages
import { OwnerDashboard } from '../features/owner/OwnerDashboard';
import { WorksList } from '../features/owner/WorksList';
import { WorksCalendar } from '../features/owner/WorksCalendar';
import { AddWorkWizard } from '../features/owner/AddWorkWizard';
import { WorkOverview } from '../features/works/WorkOverview';
import { ApplicationsList } from '../features/applications/ApplicationsList';
import { ApplicationDetail } from '../features/applications/ApplicationDetail';
import { BoysList } from '../features/owner/BoysList';
import { BoyDetail } from '../features/owner/BoyDetail';
import { CaptainsList } from '../features/owner/CaptainsList';
import { CaptainDetail } from '../features/owner/CaptainDetail';
import { WageSettingsPage } from '../features/owner/WageSettingsPage';
import { CaptainWagesPage } from '../features/owner/CaptainWagesPage';
import { GlobalPaymentCenter } from '../features/owner/GlobalPaymentCenter';
import { GlobalWorkHistory } from '../features/owner/GlobalWorkHistory';
import { BoySearchPage } from '../features/owner/BoySearchPage';
import { AuditLogExplorer } from '../features/owner/AuditLogExplorer';
import { OwnerSystemSettings } from '../features/owner/OwnerSystemSettings';

// Captain Pages
import { CaptainDashboard } from '../features/captain/CaptainDashboard';
import { CaptainAssignedWorks } from '../features/captain/CaptainAssignedWorks';
import { CaptainBillerWorkspace } from '../features/captain/CaptainBillerWorkspace';
import { CaptainOwnWages } from '../features/captain/CaptainOwnWages';
import { CaptainPaymentsHistory } from '../features/captain/CaptainPaymentsHistory';
import { CaptainWorkHistory } from '../features/captain/CaptainWorkHistory';

// Boy Pages
import { BoyHome } from '../features/boy/BoyHome';
import { AvailableWorks } from '../features/boy/AvailableWorks';
import { BoyWorkDetail } from '../features/boy/BoyWorkDetail';
import { ConfirmedWorks } from '../features/boy/ConfirmedWorks';
import { ConfirmedWorkDetail } from '../features/boy/ConfirmedWorkDetail';
import { BoyWorkHistory } from '../features/boy/BoyWorkHistory';
import { BoyWagePayments } from '../features/boy/BoyWagePayments';

// Fallbacks
import { NotFoundPage } from '../components/common/NotFoundPage';
import { UnauthorizedPage } from '../components/common/UnauthorizedPage';

export const router = createBrowserRouter([
  // Public
  { path: '/', element: <SplashScreen /> },
  { path: '/login', element: <PhoneLogin /> },
  { path: '/verify', element: <OtpVerify /> },
  { path: '/apply', element: <ApplyForm /> },
  { path: '/status', element: <StatusPage /> },
  { path: '/unauthorized', element: <UnauthorizedPage /> },

  // Authenticated Root with AppShell Layout
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      // Shared Pages
      { path: '/notifications', element: <NotificationsPage /> },
      { path: '/profile', element: <ProfilePage /> },
      { path: '/profile/edit', element: <EditProfilePage /> },
      { path: '/settings', element: <SettingsPage /> },

      // Owner Routes (Role Protected)
      {
        path: '/owner',
        element: <ProtectedRoute allowedRoles={['owner']}><OwnerDashboard /></ProtectedRoute>,
      },
      {
        path: '/owner/works',
        element: <ProtectedRoute allowedRoles={['owner']}><WorksList /></ProtectedRoute>,
      },
      {
        path: '/owner/works/calendar',
        element: <ProtectedRoute allowedRoles={['owner']}><WorksCalendar /></ProtectedRoute>,
      },
      {
        path: '/owner/works/new',
        element: <ProtectedRoute allowedRoles={['owner']}><AddWorkWizard /></ProtectedRoute>,
      },
      {
        path: '/owner/works/:workId',
        element: <ProtectedRoute allowedRoles={['owner', 'captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/owner/works/:workId/staffing',
        element: <ProtectedRoute allowedRoles={['owner', 'captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/owner/works/:workId/captains',
        element: <ProtectedRoute allowedRoles={['owner']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/owner/works/:workId/attendance',
        element: <ProtectedRoute allowedRoles={['owner', 'captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/owner/works/:workId/wages',
        element: <ProtectedRoute allowedRoles={['owner', 'captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/owner/works/:workId/billers',
        element: <ProtectedRoute allowedRoles={['owner']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/owner/works/:workId/payments',
        element: <ProtectedRoute allowedRoles={['owner', 'captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/owner/works/:workId/history',
        element: <ProtectedRoute allowedRoles={['owner', 'captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/owner/applications',
        element: <ProtectedRoute allowedRoles={['owner']}><ApplicationsList /></ProtectedRoute>,
      },
      {
        path: '/owner/applications/:id',
        element: <ProtectedRoute allowedRoles={['owner']}><ApplicationDetail /></ProtectedRoute>,
      },
      {
        path: '/owner/boys',
        element: <ProtectedRoute allowedRoles={['owner']}><BoysList /></ProtectedRoute>,
      },
      {
        path: '/owner/boys/:uid',
        element: <ProtectedRoute allowedRoles={['owner']}><BoyDetail /></ProtectedRoute>,
      },
      {
        path: '/owner/captains',
        element: <ProtectedRoute allowedRoles={['owner']}><CaptainsList /></ProtectedRoute>,
      },
      {
        path: '/owner/captains/:uid',
        element: <ProtectedRoute allowedRoles={['owner']}><CaptainDetail /></ProtectedRoute>,
      },
      {
        path: '/owner/wage-settings',
        element: <ProtectedRoute allowedRoles={['owner']}><WageSettingsPage /></ProtectedRoute>,
      },
      {
        path: '/owner/captain-wages',
        element: <ProtectedRoute allowedRoles={['owner']}><CaptainWagesPage /></ProtectedRoute>,
      },
      {
        path: '/owner/payments',
        element: <ProtectedRoute allowedRoles={['owner']}><GlobalPaymentCenter /></ProtectedRoute>,
      },
      {
        path: '/owner/history',
        element: <ProtectedRoute allowedRoles={['owner']}><GlobalWorkHistory /></ProtectedRoute>,
      },
      {
        path: '/owner/search',
        element: <ProtectedRoute allowedRoles={['owner']}><BoySearchPage /></ProtectedRoute>,
      },
      {
        path: '/owner/notifications',
        element: <ProtectedRoute allowedRoles={['owner']}><NotificationsPage /></ProtectedRoute>,
      },
      {
        path: '/owner/audit',
        element: <ProtectedRoute allowedRoles={['owner']}><AuditLogExplorer /></ProtectedRoute>,
      },
      {
        path: '/owner/settings',
        element: <ProtectedRoute allowedRoles={['owner']}><OwnerSystemSettings /></ProtectedRoute>,
      },

      // Captain Routes (Role Protected)
      {
        path: '/captain',
        element: <ProtectedRoute allowedRoles={['captain']}><CaptainDashboard /></ProtectedRoute>,
      },
      {
        path: '/captain/works',
        element: <ProtectedRoute allowedRoles={['captain']}><CaptainAssignedWorks /></ProtectedRoute>,
      },
      {
        path: '/captain/works/:workId',
        element: <ProtectedRoute allowedRoles={['captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/captain/works/:workId/staffing',
        element: <ProtectedRoute allowedRoles={['captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/captain/works/:workId/attendance',
        element: <ProtectedRoute allowedRoles={['captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/captain/works/:workId/wages',
        element: <ProtectedRoute allowedRoles={['captain']}><WorkOverview /></ProtectedRoute>,
      },
      {
        path: '/captain/works/:workId/biller',
        element: <ProtectedRoute allowedRoles={['captain']}><CaptainBillerWorkspace /></ProtectedRoute>,
      },
      {
        path: '/captain/history',
        element: <ProtectedRoute allowedRoles={['captain']}><CaptainWorkHistory /></ProtectedRoute>,
      },
      {
        path: '/captain/payments',
        element: <ProtectedRoute allowedRoles={['captain']}><CaptainPaymentsHistory /></ProtectedRoute>,
      },
      {
        path: '/captain/wages',
        element: <ProtectedRoute allowedRoles={['captain']}><CaptainOwnWages /></ProtectedRoute>,
      },

      // Boy Routes (Role Protected)
      {
        path: '/boy',
        element: <ProtectedRoute allowedRoles={['boy']}><BoyHome /></ProtectedRoute>,
      },
      {
        path: '/boy/works',
        element: <ProtectedRoute allowedRoles={['boy']}><AvailableWorks /></ProtectedRoute>,
      },
      {
        path: '/boy/works/:workId',
        element: <ProtectedRoute allowedRoles={['boy']}><BoyWorkDetail /></ProtectedRoute>,
      },
      {
        path: '/boy/confirmed',
        element: <ProtectedRoute allowedRoles={['boy']}><ConfirmedWorks /></ProtectedRoute>,
      },
      {
        path: '/boy/confirmed/:workId',
        element: <ProtectedRoute allowedRoles={['boy']}><ConfirmedWorkDetail /></ProtectedRoute>,
      },
      {
        path: '/boy/history',
        element: <ProtectedRoute allowedRoles={['boy']}><BoyWorkHistory /></ProtectedRoute>,
      },
      {
        path: '/boy/payments',
        element: <ProtectedRoute allowedRoles={['boy']}><BoyWagePayments /></ProtectedRoute>,
      },
    ],
  },

  // 404 Catch-All
  { path: '*', element: <NotFoundPage /> },
]);
