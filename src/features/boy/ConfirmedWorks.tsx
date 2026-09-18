import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { WorkMember, Work } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckCircle2, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

export const ConfirmedWorks: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [memberships, setMemberships] = useState<WorkMember[]>([]);

  useEffect(() => {
    if (!profile) return;
    const active = workforceService.getBoyActiveWorks(profile.uid);
    setMemberships(active);
  }, [profile]);

  return (
    <PageContainer maxWidth="lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Confirmed Works</h2>
          <p className="text-xs text-text-muted mt-0.5">Your active catering bookings and upcoming event assignments</p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/boy/works')}
        >
          Browse More Works
        </Button>
      </div>

      {memberships.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-12 h-12 text-slate-300" />}
          title="No confirmed Works yet"
          description="You have not joined any upcoming events. Visit Available Works to take a booking."
          actionLabel="View Available Works"
          onAction={() => navigate('/boy/works')}
        />
      ) : (
        <div className="space-y-3">
          {memberships.map((m) => {
            const work = workforceService.getWorkById(m.workId);
            if (!work) return null;

            return (
              <Card
                key={m.id}
                variant="interactive"
                padding="md"
                onClick={() => navigate(`/boy/confirmed/${work.id}`)}
                className="border-l-4 border-l-primary shadow-subtle"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-text-strong">{work.name}</h4>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span className="flex items-center gap-1 font-semibold text-text-strong">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {work.workDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Reporting: {work.reportingTime}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={work.status} size="sm" />
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1 my-2 truncate">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{work.sitePlace}</span>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    Site Lead: <strong className="text-text-strong">{work.mainSiteCaptainName || 'Assigned'}</strong>
                  </span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <span>Manage Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
