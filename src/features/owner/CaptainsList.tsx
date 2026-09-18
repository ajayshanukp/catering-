import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { UserProfile } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Award, Search, MapPin } from 'lucide-react';

export const CaptainsList: React.FC = () => {
  const navigate = useNavigate();
  const [captains, setCaptains] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    const all = workforceService.getUsers().filter(u => u.role === 'captain');
    setCaptains(all);
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, []);

  const filteredCaptains = captains.filter(c => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.fullName.toLowerCase().includes(q);
      const matchId = c.currentOfficialId.toLowerCase().includes(q);
      const matchPlace = c.exactPlace.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchPlace) return false;
    }
    return true;
  });

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Captains Directory</h2>
          <p className="text-xs text-text-muted mt-0.5">Site leadership team responsible for on-site execution and billing</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search Captains by name, ID, or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-control text-xs sm:text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
        />
      </div>

      {filteredCaptains.length === 0 ? (
        <EmptyState
          icon={<Award className="w-12 h-12 text-slate-300" />}
          title="No Captains found"
          description="No event Captains match your search criteria."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCaptains.map((c) => (
            <Card
              key={c.uid}
              variant="interactive"
              padding="md"
              onClick={() => navigate(`/owner/captains/${c.uid}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-teal-100 border border-teal-200 text-primary font-bold text-xs flex items-center justify-center">
                    {c.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-text-strong">{c.fullName}</h4>
                    <span className="font-mono text-xs text-slate-500">{c.currentOfficialId}</span>
                  </div>
                </div>
                <StatusBadge status={c.accountStatus} size="sm" />
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs text-text-muted">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {c.exactPlace}
                </span>
                <span className="font-semibold text-primary">View Assignments →</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
