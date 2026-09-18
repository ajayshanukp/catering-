import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { Work } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Plus, Search, Calendar as CalendarIcon, Clock, MapPin, Filter, ArrowRight } from 'lucide-react';

export const WorksList: React.FC = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState<Work[]>([]);
  const [segment, setSegment] = useState<'today' | 'upcoming' | 'past' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const load = () => setWorks(workforceService.getWorks());
    load();
    const unsub = workforceService.subscribe(load);
    return unsub;
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredWorks = works.filter((w) => {
    // Segment filter
    if (segment === 'today' && w.workDate !== todayStr) return false;
    if (segment === 'upcoming' && w.workDate <= todayStr) return false;
    if (segment === 'past' && w.workDate >= todayStr) return false;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.name.toLowerCase().includes(q);
      const matchPlace = w.sitePlace.toLowerCase().includes(q);
      const matchCaptain = (w.mainSiteCaptainName || '').toLowerCase().includes(q);
      if (!matchName && !matchPlace && !matchCaptain) return false;
    }

    return true;
  }).sort((a, b) => a.workDate.localeCompare(b.workDate));

  return (
    <PageContainer maxWidth="2xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Manage Works</h2>
          <p className="text-xs text-text-muted mt-0.5">Comprehensive schedule of catering events and staffing coverage</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/owner/works/calendar')}
            icon={<CalendarIcon className="w-4 h-4" />}
          >
            Calendar View
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/owner/works/new')}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Work
          </Button>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event name, venue, or Site Captain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-control text-xs sm:text-sm text-text-strong placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
          />
        </div>

        {/* Segments */}
        <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border self-start sm:self-auto overflow-x-auto">
          {(['all', 'today', 'upcoming', 'past'] as const).map((seg) => (
            <button
              key={seg}
              type="button"
              onClick={() => setSegment(seg)}
              className={`px-3 py-1 rounded-control text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                segment === seg
                  ? 'bg-white text-text-strong shadow-xs'
                  : 'text-text-muted hover:text-text-strong'
              }`}
            >
              {seg}
            </button>
          ))}
        </div>
      </div>

      {/* Content: Mobile Cards vs Desktop Table */}
      {filteredWorks.length === 0 ? (
        <EmptyState
          title="No Works found"
          description={searchQuery ? 'No events matched your search query.' : 'There are no events in this category.'}
          actionLabel="Create New Work"
          onAction={() => navigate('/owner/works/new')}
        />
      ) : (
        <>
          {/* Mobile Cards (hidden on desktop) */}
          <div className="space-y-3 lg:hidden">
            {filteredWorks.map((work) => (
              <Card
                key={work.id}
                variant="interactive"
                padding="md"
                onClick={() => navigate(`/owner/works/${work.id}`)}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-sm font-bold text-text-strong">{work.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                      <span className="flex items-center gap-1 font-medium text-text-strong">
                        <CalendarIcon className="w-3.5 h-3.5 text-primary" />
                        {work.workDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {work.reportingTime}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={work.status} />
                </div>

                <div className="text-xs text-slate-600 flex items-center gap-1 my-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{work.sitePlace}</span>
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted">
                    Site Captain: <strong className="text-text-strong">{work.mainSiteCaptainName || 'Unassigned'}</strong>
                  </span>
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-teal-50 border border-teal-200">
                    {work.totalFilled} / {work.totalRequired}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table (hidden on mobile) */}
          <div className="hidden lg:block bg-surface border border-border rounded-panel overflow-hidden shadow-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Work / Venue</th>
                  <th className="px-4 py-3.5">Date & Time</th>
                  <th className="px-4 py-3.5">Site Captain</th>
                  <th className="px-4 py-3.5">Staffing Coverage</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredWorks.map((work) => (
                  <tr
                    key={work.id}
                    onClick={() => navigate(`/owner/works/${work.id}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-text-strong text-sm">{work.name}</p>
                      <p className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {work.sitePlace}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-text-strong">{work.workDate}</p>
                      <p className="text-slate-500 text-xs mt-0.5">{work.reportingTime}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-text-strong">{work.mainSiteCaptainName || 'None'}</p>
                      <p className="text-[11px] font-mono text-slate-400">{work.mainSiteCaptainOfficialId}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{ width: `${Math.min(100, work.totalRequired > 0 ? (work.totalFilled / work.totalRequired) * 100 : 0)}%` }}
                          />
                        </div>
                        <span className="font-bold text-text-strong">
                          {work.totalFilled} / {work.totalRequired}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={work.status} />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/owner/works/${work.id}`);
                        }}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </PageContainer>
  );
};
