import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4 sm:p-5',
    lg: 'p-5 sm:p-6',
  };

  const variantClasses = {
    default: 'bg-surface border border-border shadow-subtle',
    elevated: 'bg-surface border border-border shadow-elevated',
    interactive: 'bg-surface border border-border shadow-subtle hover:border-teal-300 hover:shadow-elevated transition-all cursor-pointer active:scale-[0.99]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'rounded-panel overflow-hidden transition-all',
          paddingClasses[padding],
          variantClasses[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
