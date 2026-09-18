import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Work } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Briefcase, Calendar, Clock, MapPin, DollarSign, CheckCircle2 } from 'lucide-react';

export const CaptainAssignedWorks: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [tab, setTab] = useState<'active' | 'upcoming' | 'history'>('active');

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

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredWorks = works.filter(w => {
    if (tab === 'active') return w.workDate === todayStr && w.status !== 'cancelled';
    if (tab === 'upcoming') return w.workDate > todayStr && w.status !== 'cancelled';
    if (tab === 'history') return w.workDate < todayStr || w.status === 'finished' || w.status === 'cancelled';
    return true;
  });

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">My Assigned Works</h2>
          <p className="text-xs text-text-muted mt-0.5">Catering events where you are designated Site Lead or Support Captain</p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border">
          {(['active', 'upcoming', 'history'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-control text-xs font-semibold capitalize transition-all ${
                tab === t ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {filteredWorks.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-12 h-12 text-slate-300" />}
          title="No Works in this category"
          description="You do not have any catering events matching this schedule."
        />
      ) : (
        <div className="space-y-3">
          {filteredWorks.map((w) => {
            const isMain = w.mainSiteCaptainId === profile?.uid;

            return (
              <Card
                key={w.id}
                variant="interactive"
                padding="md"
                onClick={() => navigate(`/owner/works/${w.id}`)}
                className="shadow-subtle"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-text-strong">{w.name}</h4>
                      <StatusBadge status={w.status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1 font-medium text-text-strong">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {w.workDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {w.reportingTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {w.sitePlace}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-teal-50 text-primary border border-teal-200">
                      {isMain ? 'Primary Site Lead' : 'Support Captain'}
                    </span>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/owner/works/${w.id}`);
                      }}
                    >
                      Open Event
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
