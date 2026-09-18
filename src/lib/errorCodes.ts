export const APP_ERRORS = {
  AUTH_REQUIRED: 'Please sign in again to continue.',
  ACCOUNT_PENDING: 'Your application is still pending approval.',
  ACCOUNT_INACTIVE: 'Your account is currently inactive. Please contact management.',
  PERMISSION_DENIED: 'You do not have permission to perform this action.',
  WORK_NOT_FOUND: 'This Work is no longer available.',
  WORK_FULL: 'This Work is full.',
  WORK_NOT_AVAILABLE: 'This Work is not currently available.',
  ALREADY_ASSIGNED: 'You are already assigned to this Work.',
  DAY_CONFLICT: 'You already have another Work on this date.',
  LEAVE_NOT_ALLOWED: 'This Work can no longer be left because the Work Date has arrived.',
  CAPACITY_CHANGED: 'Staffing changed while you were viewing this Work. Please review the latest availability.',
  INVALID_BILLER: 'Choose a Captain who is assigned to this Work.',
  WAGE_NOT_PUBLISHED: 'Publish the wage before processing payment.',
  NETWORK_REQUIRED: 'You need an internet connection to complete this action.',
  UNKNOWN: 'Something went wrong. Please try again.',
} as const;

export type AppErrorCode = keyof typeof APP_ERRORS;

export class AppError extends Error {
  code: AppErrorCode;

  constructor(code: AppErrorCode, message?: string) {
    super(message || APP_ERRORS[code] || APP_ERRORS.UNKNOWN);
    this.code = code;
    this.name = 'AppError';
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    if (error.message in APP_ERRORS) {
      return APP_ERRORS[error.message as AppErrorCode];
    }
    // Mask raw Firebase errors with friendly human messages per Section 8 & 15
    if (error.message.includes('permission-denied') || error.message.includes('PERMISSION_DENIED')) {
      return APP_ERRORS.PERMISSION_DENIED;
    }
    if (error.message.includes('unavailable') || error.message.includes('network')) {
      return APP_ERRORS.NETWORK_REQUIRED;
    }
    return error.message;
  }
  return APP_ERRORS.UNKNOWN;
}
