import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { Work } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { History, Calendar, MapPin, Clock, Search } from 'lucide-react';

export const GlobalWorkHistory: React.FC = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const all = workforceService.getWorks();
    setWorks(all);
  }, []);

  const historyWorks = works.filter(w => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        w.name.toLowerCase().includes(q) ||
        w.sitePlace.toLowerCase().includes(q) ||
        (w.mainSiteCaptainName || '').toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => b.workDate.localeCompare(a.workDate));

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Global Work History</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Permanent archive of all past, finished, and scheduled catering events
          </p>
        </div>
      </div>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search historical events by title, venue, or Captain..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-control text-xs sm:text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
        />
      </div>

      {historyWorks.length === 0 ? (
        <EmptyState
          icon={<History className="w-12 h-12 text-slate-300" />}
          title="No historical events found"
          description="Events that are finished, cancelled, or past their scheduled date will appear here."
        />
      ) : (
        <div className="space-y-3">
          {historyWorks.map((work) => (
            <Card
              key={work.id}
              variant="interactive"
              padding="md"
              onClick={() => navigate(`/owner/works/${work.id}`)}
              className="shadow-subtle"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div>
                  <h4 className="text-sm font-bold text-text-strong">{work.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <span className="flex items-center gap-1 font-medium text-text-strong">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                      {work.workDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {work.reportingTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {work.sitePlace}
                    </span>
                  </div>
                </div>
                <StatusBadge status={work.status} size="sm" />
              </div>

              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  Site Captain: <strong className="text-text-strong">{work.mainSiteCaptainName || 'Unassigned'}</strong>
                </span>
                <span className="font-bold text-primary">
                  Staffing: {work.totalFilled} / {work.totalRequired}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
