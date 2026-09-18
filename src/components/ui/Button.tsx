import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'danger-outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  fullWidth = false,
  icon,
  className,
  disabled,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-control transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 select-none disabled:opacity-50 disabled:pointer-events-none min-h-[44px] active:scale-[0.98]';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5 min-h-[38px]',
    md: 'px-4 py-2.5 text-sm gap-2 min-h-[44px]',
    lg: 'px-5 py-3 text-base gap-2.5 min-h-[48px] md:min-h-[52px]',
  };

  const variantClasses = {
    primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary shadow-subtle',
    secondary: 'bg-slate-100 text-text-strong hover:bg-slate-200 focus:ring-slate-300 border border-border',
    outline: 'bg-white text-text-strong hover:bg-slate-50 border border-border focus:ring-slate-200',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-danger shadow-subtle',
    'danger-outline': 'bg-white text-danger border border-danger/30 hover:bg-danger-light focus:ring-danger',
    ghost: 'bg-transparent text-text-muted hover:text-text-strong hover:bg-slate-100 focus:ring-slate-200',
  };

  return (
    <button
      className={twMerge(
        clsx(
          baseClasses,
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {icon && <span className="shrink-0">{icon}</span>}
          <span>{children}</span>
        </>
      )}
    </button>
  );
};
