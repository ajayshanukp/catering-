import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { UserWageView } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DollarSign, Calendar, CheckCircle2, Clock } from 'lucide-react';

export const BoyWagePayments: React.FC = () => {
  const { profile } = useAuth();
  const [wageViews, setWageViews] = useState<UserWageView[]>([]);

  useEffect(() => {
    if (!profile) return;
    const views = workforceService.getUserWageViews(profile.uid);
    setWageViews(views);
  }, [profile]);

  const totalEarned = wageViews.filter(w => w.paymentStatus === 'paid').reduce((s, w) => s + w.publishedTotal, 0);
  const totalPending = wageViews.filter(w => w.paymentStatus === 'unpaid').reduce((s, w) => s + w.publishedTotal, 0);

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">My Wage & Payments</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Verified statement of published event wages and disbursement status
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card padding="sm" className="bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-900 uppercase">Received (Paid)</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">₹{totalEarned}</div>
        </Card>

        <Card padding="sm" className="bg-amber-50 border border-amber-200">
          <span className="text-[10px] font-bold text-amber-900 uppercase">Pending Disbursement</span>
          <div className="text-2xl font-black text-warning mt-0.5">₹{totalPending}</div>
        </Card>
      </div>

      {wageViews.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="w-12 h-12 text-slate-300" />}
          title="No payment records yet"
          description="Once management marks events finished and publishes your wages, they will be listed here."
        />
      ) : (
        <div className="space-y-3">
          {wageViews.map((wv) => (
            <Card key={wv.workId} padding="md" className="shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-text-strong">{wv.workName}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {wv.workDate}
                    </span>
                    <span>Category: <strong>Cat {wv.categorySnapshot}</strong></span>
                    <span>Base: ₹{wv.publishedBase}</span>
                    {wv.publishedAdjustment !== 0 && (
                      <span className={wv.publishedAdjustment > 0 ? 'text-emerald-600 font-bold' : 'text-danger font-bold'}>
                        Adjustment: {wv.publishedAdjustment > 0 ? `+₹${wv.publishedAdjustment}` : `-₹${Math.abs(wv.publishedAdjustment)}`}
                      </span>
                    )}
                  </div>
                  {wv.billerName && (
                    <p className="text-[11px] text-slate-500 mt-1">
                      Biller: <strong>{wv.billerName}</strong>
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                  <div className="text-left sm:text-right">
                    <span className="text-lg font-black text-text-strong block">₹{wv.publishedTotal}</span>
                    <span className="text-[10px] text-slate-400 font-mono">v{wv.publishedVersion} published</span>
                  </div>

                  <StatusBadge status={wv.paymentStatus} size="sm" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
