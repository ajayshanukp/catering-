import React from 'react';
import { clsx } from 'clsx';

interface PageContainerProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  hasBottomNav?: boolean;
}

export const PageContainer: React.FC<PageContainerProps> = ({
  children,
  maxWidth = 'xl',
  className,
  hasBottomNav = true,
}) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <main
      className={clsx(
        'w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6',
        maxWidthClasses[maxWidth],
        hasBottomNav ? 'pb-24 lg:pb-8' : 'pb-8',
        className
      )}
    >
      {children}
    </main>
  );
};
