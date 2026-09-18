import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { WorkPayment } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { CreditCard, Calendar } from 'lucide-react';

export const CaptainPaymentsHistory: React.FC = () => {
  const { profile } = useAuth();
  const [billerPayments, setBillerPayments] = useState<WorkPayment[]>([]);

  useEffect(() => {
    if (!profile) return;
    const allPayments = workforceService.getAllPayments();
    const myDisbursements = allPayments.filter(p => p.billerId === profile.uid);
    setBillerPayments(myDisbursements);
  }, [profile]);

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">Biller Payment History</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Record of all worker disbursements executed by you as an assigned Biller
        </p>
      </div>

      {billerPayments.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-12 h-12 text-slate-300" />}
          title="No disbursements on record"
          description="Worker payments disbursed by you across your assigned events will be listed here."
        />
      ) : (
        <div className="space-y-3">
          {billerPayments.map((p) => {
            const boy = workforceService.getUserById(p.boyId);

            return (
              <Card key={p.id} padding="md" className="shadow-subtle flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-text-strong">{boy?.fullName || 'Worker'}</h4>
                  <p className="text-xs text-text-muted mt-0.5">
                    Boy ID: <span className="font-mono text-text-strong">{boy?.currentOfficialId}</span>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-base font-black text-text-strong block">₹{p.amount}</span>
                  <StatusBadge status={p.status} size="sm" />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
