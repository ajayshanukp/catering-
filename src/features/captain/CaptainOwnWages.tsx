import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { CaptainWage } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { DollarSign, Calendar, Clock } from 'lucide-react';

export const CaptainOwnWages: React.FC = () => {
  const { profile } = useAuth();
  const [wages, setWages] = useState<CaptainWage[]>([]);

  useEffect(() => {
    if (!profile) return;
    const myWages = workforceService.getCaptainWages(profile.uid);
    setWages(myWages);
  }, [profile]);

  const totalEarned = wages.filter(w => w.status === 'paid').reduce((s, w) => s + (w.wageAmount || 0), 0);
  const totalPending = wages.filter(w => w.status === 'unpaid').reduce((s, w) => s + (w.wageAmount || 0), 0);

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">My Captain Wages</h2>
        <p className="text-xs text-text-muted mt-0.5">Read-only statement of event leadership compensation from Owner</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card padding="sm" className="bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-900 uppercase">Total Paid</span>
          <div className="text-2xl font-black text-emerald-700 mt-0.5">₹{totalEarned}</div>
        </Card>

        <Card padding="sm" className="bg-amber-50 border border-amber-200">
          <span className="text-[10px] font-bold text-amber-900 uppercase">Pending Payment</span>
          <div className="text-2xl font-black text-warning mt-0.5">₹{totalPending}</div>
        </Card>
      </div>

      {wages.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="w-12 h-12 text-slate-300" />}
          title="No Captain wage records"
          description="Leadership compensation recorded by the Owner for completed events will appear here."
        />
      ) : (
        <div className="space-y-3">
          {wages.map((w) => (
            <Card key={w.id} padding="md" className="shadow-subtle flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-strong">{w.workName}</h4>
                <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {w.workDate}
                  </span>
                  {w.notes && <span>• Note: {w.notes}</span>}
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-black text-text-strong block">₹{w.wageAmount}</span>
                <StatusBadge status={w.status} size="sm" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
