import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-danger-light rounded-panel border border-danger-border my-4">
      <div className="p-3 bg-red-100 rounded-full mb-3 text-danger">
        <AlertCircle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-danger mb-1">{title}</h3>
      <p className="text-sm text-slate-700 max-w-md mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
};
