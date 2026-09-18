import React from 'react';
import { WifiOff } from 'lucide-react';

interface OfflineBannerProps {
  isOffline: boolean;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline }) => {
  if (!isOffline) return null;

  return (
    <div
      className="bg-amber-600 text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-sm shrink-0 z-50 animate-in slide-in-from-top duration-300"
      role="alert"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>You are currently offline. Critical mutations and Take Work actions are disabled until reconnected.</span>
    </div>
  );
};
