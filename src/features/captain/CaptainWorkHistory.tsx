import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Work } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { History, Calendar, Clock, MapPin } from 'lucide-react';

export const CaptainWorkHistory: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);

  useEffect(() => {
    if (!profile) return;
    const all = workforceService.getWorks();
    const myWorks = all.filter(w => {
      if (w.mainSiteCaptainId === profile.uid) return true;
      const capRels = workforceService.getWorkCaptains(w.id);
      return capRels.some(r => r.captainId === profile.uid);
    });
    setWorks(myWorks);
  }, [profile]);

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">Captain Work History</h2>
        <p className="text-xs text-text-muted mt-0.5">Historical log of all events you have led or supported</p>
      </div>

      {works.length === 0 ? (
        <EmptyState
          icon={<History className="w-12 h-12 text-slate-300" />}
          title="No event history found"
          description="Your completed and assigned Works will be archived here."
        />
      ) : (
        <div className="space-y-3">
          {works.map((w) => (
            <Card
              key={w.id}
              variant="interactive"
              padding="md"
              onClick={() => navigate(`/owner/works/${w.id}`)}
              className="shadow-subtle"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-text-strong">{w.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                    <span className="flex items-center gap-1 font-semibold text-text-strong">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {w.workDate}
                    </span>
                    <span>Reporting: {w.reportingTime}</span>
                  </div>
                </div>
                <StatusBadge status={w.status} size="sm" />
              </div>

              <div className="text-xs text-slate-600 flex items-center gap-1 mt-2 pt-2 border-t border-border">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{w.sitePlace}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
