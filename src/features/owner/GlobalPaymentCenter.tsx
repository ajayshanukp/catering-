import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { WorkPayment, CaptainWage, Work, UserProfile } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { CreditCard, Search, Filter, Clock, CheckCircle2 } from 'lucide-react';

export const GlobalPaymentCenter: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<WorkPayment[]>([]);
  const [captainWages, setCaptainWages] = useState<CaptainWage[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'boys' | 'captains'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = () => {
    setPayments(workforceService.getAllPayments());
    setCaptainWages(workforceService.getCaptainWages());
    setWorks(workforceService.getWorks());
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, []);

  // Filtered Boy payments
  const filteredBoyPayments = payments.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (typeFilter === 'captains') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const work = works.find(w => w.id === p.workId);
      const matchWork = (work?.name || '').toLowerCase().includes(q);
      const matchBiller = (p.billerName || '').toLowerCase().includes(q);
      if (!matchWork && !matchBiller) return false;
    }
    return true;
  });

  // Filtered Captain wages
  const filteredCaptainWages = captainWages.filter(cw => {
    if (statusFilter !== 'all' && cw.status !== statusFilter) return false;
    if (typeFilter === 'boys') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchWork = cw.workName.toLowerCase().includes(q);
      const matchCaptain = cw.captainName.toLowerCase().includes(q);
      if (!matchWork && !matchCaptain) return false;
    }
    return true;
  });

  const totalUnpaid = payments.filter(p => p.status === 'unpaid').reduce((s, p) => s + (p.amount || 0), 0) +
                      captainWages.filter(c => c.status === 'unpaid').reduce((s, c) => s + (c.wageAmount || 0), 0);

  const totalPaid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + (p.amount || 0), 0) +
                    captainWages.filter(c => c.status === 'paid').reduce((s, c) => s + (c.wageAmount || 0), 0);

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Global Payment Center</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Audit and reconcile cash and digital disbursements across all catering events
          </p>
        </div>
      </div>

      {/* Metrics Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <Card padding="sm" className="bg-red-50 border border-red-200">
          <span className="text-[10px] font-bold text-red-900 uppercase">Total Pending / Unpaid</span>
          <div className="text-xl font-black text-danger mt-0.5">₹{totalUnpaid}</div>
        </Card>

        <Card padding="sm" className="bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-900 uppercase">Total Disbursed / Paid</span>
          <div className="text-xl font-black text-emerald-700 mt-0.5">₹{totalPaid}</div>
        </Card>

        <Card padding="sm" className="bg-slate-50 border border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase">Boy Transactions</span>
          <div className="text-xl font-black text-text-strong mt-0.5">{payments.length}</div>
        </Card>

        <Card padding="sm" className="bg-slate-50 border border-border">
          <span className="text-[10px] font-bold text-text-muted uppercase">Captain Disbursals</span>
          <div className="text-xl font-black text-text-strong mt-0.5">{captainWages.length}</div>
        </Card>
      </div>

      {/* Filter Bars */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by event, worker name, or Biller..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-control text-xs sm:text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Status Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border">
            {(['all', 'unpaid', 'paid'] as const).map((st) => (
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

          {/* Type Filter */}
          <div className="flex items-center p-1 bg-slate-100 rounded-control border border-border">
            {(['all', 'boys', 'captains'] as const).map((tp) => (
              <button
                key={tp}
                type="button"
                onClick={() => setTypeFilter(tp)}
                className={`px-3 py-1 rounded-control text-xs font-semibold capitalize transition-all ${
                  typeFilter === tp ? 'bg-white text-text-strong shadow-xs' : 'text-text-muted hover:text-text-strong'
                }`}
              >
                {tp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Disbursals List */}
      <div className="space-y-6">
        {/* Boy Payments */}
        {typeFilter !== 'captains' && (
          <div>
            <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
              Worker Event Payments ({filteredBoyPayments.length})
            </h3>

            {filteredBoyPayments.length === 0 ? (
              <Card padding="md" className="text-center py-6">
                <p className="text-xs text-text-muted">No worker payments found for this filter.</p>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filteredBoyPayments.map((p) => {
                  const work = works.find(w => w.id === p.workId);
                  const boy = workforceService.getUserById(p.boyId);

                  return (
                    <Card
                      key={p.id}
                      variant="interactive"
                      padding="sm"
                      onClick={() => navigate(`/owner/works/${p.workId}`)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-text-strong">{boy?.fullName || 'Worker'}</h4>
                          <span className="font-mono text-slate-500">({boy?.currentOfficialId})</span>
                          <span className="text-slate-400">• Work: <strong>{work?.name}</strong></span>
                        </div>
                        <p className="text-[11px] text-text-muted mt-0.5">
                          Assigned Biller: {p.billerName || 'Unassigned'} • Updated: {new Date(p.lastChangedAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                        <span className="text-sm font-black text-text-strong">₹{p.amount}</span>
                        <StatusBadge status={p.status} size="sm" />
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Captain Payments */}
        {typeFilter !== 'boys' && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
              Captain Event Compensation ({filteredCaptainWages.length})
            </h3>

            {filteredCaptainWages.length === 0 ? (
              <Card padding="md" className="text-center py-6">
                <p className="text-xs text-text-muted">No Captain wage records found for this filter.</p>
              </Card>
            ) : (
              <div className="space-y-2.5">
                {filteredCaptainWages.map((cw) => (
                  <Card
                    key={cw.id}
                    variant="interactive"
                    padding="sm"
                    onClick={() => navigate(`/owner/works/${cw.workId}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-text-strong">{cw.captainName}</h4>
                        <span className="font-mono text-slate-500">({cw.captainOfficialId})</span>
                        <span className="text-slate-400">• Work: <strong>{cw.workName}</strong></span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        Work Date: {cw.workDate} {cw.notes ? `• ${cw.notes}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                      <span className="text-sm font-black text-text-strong">₹{cw.wageAmount}</span>
                      <StatusBadge status={cw.status} size="sm" />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
};
