import React from 'react';
import { clsx } from 'clsx';
import { CheckCircle2, Clock, AlertCircle, XCircle, Check, Slash } from 'lucide-react';
import { WorkStatus, AccountStatus, AttendanceStatus, PaymentStatus } from '../../types';

export interface StatusBadgeProps {
  status: WorkStatus | AccountStatus | AttendanceStatus | PaymentStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toLowerCase();

  let label = status.toUpperCase();
  let icon = <Check className="w-3 h-3" />;
  let colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';

  if (normalized === 'available' || normalized === 'active' || normalized === 'present' || normalized === 'paid' || normalized === 'approved') {
    icon = <CheckCircle2 className="w-3.5 h-3.5 text-success" />;
    colorStyles = 'bg-success-light text-success border-success-border';
    label = normalized === 'available' ? 'Available' :
            normalized === 'active' ? 'Active' :
            normalized === 'present' ? 'Present' :
            normalized === 'paid' ? 'Paid' : 'Approved';
  } else if (normalized === 'full' || normalized === 'draft' || normalized === 'pending') {
    icon = <Clock className="w-3.5 h-3.5 text-warning" />;
    colorStyles = 'bg-warning-light text-warning border-warning-border';
    label = normalized === 'full' ? 'Full' :
            normalized === 'draft' ? 'Draft' : 'Pending';
  } else if (normalized === 'unmarked' || normalized === 'unpaid') {
    icon = <AlertCircle className="w-3.5 h-3.5 text-slate-500" />;
    colorStyles = 'bg-slate-100 text-slate-700 border-slate-200';
    label = normalized === 'unmarked' ? 'Unmarked' : 'Unpaid';
  } else if (normalized === 'cancelled' || normalized === 'rejected' || normalized === 'deactivated') {
    icon = <XCircle className="w-3.5 h-3.5 text-danger" />;
    colorStyles = 'bg-danger-light text-danger border-danger-border';
    label = normalized === 'cancelled' ? 'Cancelled' :
            normalized === 'rejected' ? 'Rejected' : 'Deactivated';
  } else if (normalized === 'finished') {
    icon = <Slash className="w-3.5 h-3.5 text-info" />;
    colorStyles = 'bg-info-light text-info border-info-border';
    label = 'Work Finished';
  }

  const sizeClass = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border shadow-sm font-medium tracking-wide whitespace-nowrap',
        sizeClass,
        colorStyles
      )}
    >
      {icon}
      <span>{label}</span>
    </span>
  );
};
