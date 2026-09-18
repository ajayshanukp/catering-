import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  requiredIndicator?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  requiredIndicator = false,
  className,
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1.5"
        >
          {label}
          {requiredIndicator && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        ref={ref}
        className={twMerge(
          clsx(
            'w-full px-3.5 py-2.5 bg-white border rounded-control text-sm text-text-strong placeholder:text-text-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-[44px]',
            error ? 'border-danger focus:ring-danger' : 'border-border',
            className
          )
        )}
        {...props}
      />
      {error ? (
        <p className="mt-1 text-xs text-danger font-medium flex items-center gap-1">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-text-muted">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';
