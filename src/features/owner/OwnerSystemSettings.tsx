import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { SystemSettings } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Save, Check, Settings, ShieldCheck, BellRing } from 'lucide-react';

export const OwnerSystemSettings: React.FC = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(workforceService.getSystemSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    workforceService.updateSystemSettings(settings, profile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <PageContainer maxWidth="md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">System Operational Rules</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Configure business rules, leave restrictions, and automated notification triggers
        </p>
      </div>

      <Card padding="lg" className="shadow-subtle">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider pb-2 border-b border-border">
              Work & Leave Restrictions
            </h4>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.allowOvernightLeave}
                onChange={(e) => setSettings(prev => ({ ...prev, allowOvernightLeave: e.target.checked }))}
                className="mt-0.5 w-4 h-4 text-primary rounded border-border"
              />
              <div>
                <span className="text-xs font-bold text-text-strong block">
                  Permit Emergency Worker Leave within 12h of Event
                </span>
                <span className="text-xs text-text-muted">
                  When unchecked, workers cannot leave Work once the event date arrives, preventing last-minute vacancies.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.autoNotifyWorkers}
                onChange={(e) => setSettings(prev => ({ ...prev, autoNotifyWorkers: e.target.checked }))}
                className="mt-0.5 w-4 h-4 text-primary rounded border-border"
              />
              <div>
                <span className="text-xs font-bold text-text-strong block">
                  Broadcast Alerts on New Confirmed Works
                </span>
                <span className="text-xs text-text-muted">
                  Automatically notify active Boys when a new event is published to Available Works.
                </span>
              </div>
            </label>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-control flex items-center gap-2 text-xs font-bold text-primary">
              <Check className="w-4 h-4" />
              <span>System settings saved and updated.</span>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-border">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={<Save className="w-4 h-4" />}
            >
              Save System Settings
            </Button>
          </div>
        </form>
      </Card>
    </PageContainer>
  );
};
