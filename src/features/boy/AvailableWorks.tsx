import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { WorkPublic } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Briefcase, Calendar, Clock, MapPin, ArrowRight } from 'lucide-react';

export const AvailableWorks: React.FC = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState<WorkPublic[]>([]);
  const [segment, setSegment] = useState<'all' | 'today' | 'upcoming'>('all');

  useEffect(() => {
    const pub = workforceService.getPublicWorks();
    setWorks(pub);
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredWorks = works.filter((w) => {
    if (segment === 'today' && w.workDate !== todayStr) return false;
    if (segment === 'upcoming' && w.workDate <= todayStr) return false;
    return true;
  }).sort((a, b) => a.workDate.localeCompare(b.workDate));

  return (
    <PageContainer maxWidth="lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Available Works</h2>
          <p className="text-xs text-text-muted mt-0.5">Browse open catering events published by management</p>
        </div>

        <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border self-start sm:self-auto">
          {(['all', 'today', 'upcoming'] as const).map((seg) => (
            <button
              key={seg}
              type="button"
              onClick={() => setSegment(seg)}
              className={`px-3 py-1 rounded-control text-xs font-semibold capitalize transition-all ${
                segment === seg ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {filteredWorks.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="w-12 h-12 text-slate-300" />}
          title="No available Works right now"
          description="There are currently no events open for booking in this filter. Please check back later."
        />
      ) : (
        <div className="space-y-3">
          {filteredWorks.map((work) => (
            <Card
              key={work.id}
              variant="interactive"
              padding="md"
              onClick={() => navigate(`/boy/works/${work.id}`)}
              className="shadow-subtle"
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
                      {work.reportingTime}
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
                <span className={`font-bold flex items-center gap-1 ${
                  work.status === 'full' ? 'text-slate-400' : 'text-primary'
                }`}>
                  <span>{work.status === 'full' ? 'Work Full' : 'Take Work'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
