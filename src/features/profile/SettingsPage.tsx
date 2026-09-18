import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { User, Bell, History, Shield, LogOut, ChevronRight, Moon, Smartphone, HelpCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { profile, role, logout } = useAuth();
  const navigate = useNavigate();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  if (!profile) return null;

  const historyRoute = role === 'owner' ? '/owner/history' : role === 'captain' ? '/captain/history' : '/boy/history';

  return (
    <PageContainer maxWidth="md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">Settings & Account</h2>
        <p className="text-xs text-text-muted mt-0.5">Preferences, app version, and security controls</p>
      </div>

      <div className="space-y-4">
        {/* Account Group */}
        <Card padding="none" className="shadow-subtle divide-y divide-border">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-control bg-slate-100 text-slate-700">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-strong">Personal Profile</h4>
                <p className="text-xs text-text-muted">Manage name, photo, address, and credentials</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => navigate(historyRoute)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-control bg-slate-100 text-slate-700">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-strong">Work History</h4>
                <p className="text-xs text-text-muted">Review all past event participation and snapshots</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </Card>

        {/* Preferences Group */}
        <Card padding="none" className="shadow-subtle divide-y divide-border">
          <div className="px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-control bg-slate-100 text-slate-700">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-text-strong">In-App Notifications</h4>
                <p className="text-xs text-text-muted">Alerts when new Works or wages are published</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="px-5 py-3.5 flex items-center justify-between text-xs text-text-muted">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-slate-400" />
              <span>App Version</span>
            </div>
            <span className="font-mono font-medium text-slate-600">v1.0.0 (Production Build)</span>
          </div>
        </Card>

        {/* Logout Action */}
        <Card padding="none" className="shadow-subtle">
          <button
            type="button"
            onClick={logout}
            className="w-full px-5 py-4 flex items-center gap-3 text-danger hover:bg-red-50 transition-colors text-left font-semibold text-sm rounded-panel"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of Account</span>
          </button>
        </Card>
      </div>
    </PageContainer>
  );
};
