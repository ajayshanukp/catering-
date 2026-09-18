import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { UserProfile, BoyCategory } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Users, Search, MapPin, ChevronRight } from 'lucide-react';

export const BoysList: React.FC = () => {
  const navigate = useNavigate();
  const [boys, setBoys] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'A' | 'B' | 'C'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deactivated'>('all');

  const loadData = () => {
    const all = workforceService.getUsers().filter(u => u.role === 'boy');
    setBoys(all);
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, []);

  const filteredBoys = boys.filter(b => {
    if (categoryFilter !== 'all' && b.currentCategory !== categoryFilter) return false;
    if (statusFilter !== 'all' && b.accountStatus !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.fullName.toLowerCase().includes(q);
      const matchId = b.currentOfficialId.toLowerCase().includes(q);
      const matchPlace = b.exactPlace.toLowerCase().includes(q);
      if (!matchName && !matchId && !matchPlace) return false;
    }
    return true;
  });

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Boys Workforce Directory</h2>
          <p className="text-xs text-text-muted mt-0.5">Manage registered event workers, categories, and account statuses</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by worker name, Boy ID, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-control text-xs sm:text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Category Chips */}
          <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border">
            {(['all', 'A', 'B', 'C'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-control text-xs font-semibold uppercase transition-all ${
                  categoryFilter === cat ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
                }`}
              >
                {cat === 'all' ? 'All Cats' : `Cat ${cat}`}
              </button>
            ))}
          </div>

          {/* Status Chips */}
          <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border">
            {(['all', 'active', 'deactivated'] as const).map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-control text-xs font-semibold capitalize transition-all ${
                  statusFilter === st ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Boys Grid / Table */}
      {filteredBoys.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12 text-slate-300" />}
          title="No workers found"
          description="No workers match the selected category or search filters."
        />
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 lg:hidden">
            {filteredBoys.map((boy) => (
              <Card
                key={boy.uid}
                variant="interactive"
                padding="md"
                onClick={() => navigate(`/owner/boys/${boy.uid}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-100 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {boy.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-strong">{boy.fullName}</h4>
                      <p className="font-mono text-xs text-slate-500 mt-0.5">{boy.currentOfficialId}</p>
                    </div>
                  </div>
                  <StatusBadge status={boy.accountStatus} size="sm" />
                </div>

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {boy.exactPlace}
                  </span>
                  <span className="px-2 py-0.5 rounded-full font-bold bg-teal-50 text-primary border border-teal-200">
                    Category {boy.currentCategory || 'C'}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden lg:block bg-surface border border-border rounded-panel overflow-hidden shadow-subtle">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-border text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Worker Name</th>
                  <th className="px-4 py-3.5">Boy ID</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Location</th>
                  <th className="px-4 py-3.5">Contact</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBoys.map((boy) => (
                  <tr
                    key={boy.uid}
                    onClick={() => navigate(`/owner/boys/${boy.uid}`)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-3.5 font-bold text-text-strong">{boy.fullName}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-600 font-medium">{boy.currentOfficialId}</td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-teal-50 text-primary border border-teal-200">
                        Category {boy.currentCategory || 'C'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{boy.exactPlace}, {boy.district}</td>
                    <td className="px-4 py-3.5 text-slate-500">{boy.mobileNumber}</td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={boy.accountStatus} size="sm" />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/owner/boys/${boy.uid}`);
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
