import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { WorkMember, Work } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { History, Calendar, Clock, MapPin } from 'lucide-react';

export const BoyWorkHistory: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [historyMemberships, setHistoryMemberships] = useState<WorkMember[]>([]);

  useEffect(() => {
    if (!profile) return;
    setHistoryMemberships(workforceService.getAllBoyMemberships(profile.uid));
  }, [profile]);

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">My Work History</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Complete chronological record of your past event assignments and attendance
        </p>
      </div>

      {historyMemberships.length === 0 ? (
        <EmptyState
          icon={<History className="w-12 h-12 text-slate-300" />}
          title="No work history yet"
          description="Your completed and confirmed catering bookings will be archived here."
        />
      ) : (
        <div className="space-y-3">
          {historyMemberships.map((m) => {
            const work = workforceService.getWorkById(m.workId);

            return (
              <Card
                key={m.id}
                padding="md"
                className="shadow-subtle"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-sm font-bold text-text-strong">{work?.name || 'Catering Event'}</h4>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span className="flex items-center gap-1 font-semibold text-text-strong">
                        <Calendar className="w-3.5 h-3.5 text-primary" />
                        {work?.workDate}
                      </span>
                      <span>Category Snapshot: <strong>Category {m.snapshotCategory}</strong></span>
                      <span>Base: <strong>₹{m.snapshotBaseWage}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                      m.membershipStatus === 'active' ? 'bg-emerald-100 text-success' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {m.membershipStatus}
                    </span>
                  </div>
                </div>

                {work && (
                  <div className="text-xs text-slate-600 flex items-center gap-1 mt-2 pt-2 border-t border-border">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{work.sitePlace}</span>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
