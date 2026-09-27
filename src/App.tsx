import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { router } from './app/routes';
import { AppErrorBoundary } from './components/common/AppErrorBoundary';

export const App: React.FC = () => {
  return (
    <AppErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </AppErrorBoundary>
  );
};

export default App;
