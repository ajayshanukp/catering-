import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { Application } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { UserCheck, Clock, MapPin, Search } from 'lucide-react';

export const ApplicationsList: React.FC = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [tab, setTab] = useState<'pending' | 'reviewed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setApplications(workforceService.getApplications());
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, []);

  const filteredApps = applications.filter(a => {
    if (tab === 'pending' && a.status !== 'pending') return false;
    if (tab === 'reviewed' && a.status === 'pending') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.fullName.toLowerCase().includes(q) ||
        a.district.toLowerCase().includes(q) ||
        a.exactPlace.toLowerCase().includes(q) ||
        a.mobileNumber.includes(q)
      );
    }
    return true;
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // pending sorted oldest first per PDF

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Worker Applications</h2>
          <p className="text-xs text-text-muted mt-0.5">Review prospective worker submissions and issue official IDs</p>
        </div>

        {/* Tab Filter */}
        <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border">
          <button
            type="button"
            onClick={() => setTab('pending')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              tab === 'pending' ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setTab('reviewed')}
            className={`px-3 py-1.5 rounded-control text-xs font-semibold transition-all ${
              tab === 'reviewed' ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
            }`}
          >
            Reviewed ({applications.length - pendingCount})
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search applicants by name, town, or mobile..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-control text-xs sm:text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
        />
      </div>

      {filteredApps.length === 0 ? (
        <EmptyState
          icon={<UserCheck className="w-12 h-12 text-slate-300" />}
          title={tab === 'pending' ? 'No pending applications' : 'No reviewed applications'}
          description={tab === 'pending' ? 'All submitted worker registrations have been evaluated.' : 'No archived application history.'}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => (
            <Card
              key={app.id}
              variant="interactive"
              padding="md"
              onClick={() => navigate(`/owner/applications/${app.id}`)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center font-bold text-slate-600 text-sm">
                  {app.photoUrl ? (
                    <img src={app.photoUrl} alt={app.fullName} className="w-full h-full object-cover" />
                  ) : (
                    app.fullName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="text-sm font-bold text-text-strong truncate">{app.fullName}</h4>
                    <StatusBadge status={app.status} size="sm" />
                  </div>

                  <p className="text-xs text-text-muted">{app.mobileNumber}</p>

                  <div className="flex items-center gap-2 text-xs text-slate-600 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{app.exactPlace}, {app.district}</span>
                  </div>

                  <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-[11px] text-text-muted">
                    <span>Blood Group: <strong className="text-danger">{app.bloodGroup}</strong></span>
                    <span>Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
