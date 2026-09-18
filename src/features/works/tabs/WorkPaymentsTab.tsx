import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { workforceService } from '../../../services/workforceService';
import { Work, WorkMember, WorkPayment, PaymentEvent, PaymentStatus } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { CreditCard, Check, Clock, History, AlertCircle } from 'lucide-react';

interface WorkPaymentsTabProps {
  work: Work;
}

export const WorkPaymentsTab: React.FC<WorkPaymentsTabProps> = ({ work }) => {
  const { profile, role } = useAuth();
  const [members, setMembers] = useState<WorkMember[]>([]);
  const [payments, setPayments] = useState<WorkPayment[]>([]);
  const [events, setEvents] = useState<PaymentEvent[]>([]);
  const [inspectingBoyId, setInspectingBoyId] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = () => {
    setMembers(workforceService.getWorkMembers(work.id).filter(m => m.membershipStatus === 'active'));
    setPayments(workforceService.getWorkPayments(work.id));
    setEvents(workforceService.getPaymentEvents(work.id));
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [work.id]);

  const handleTogglePayment = (boyId: string, currentStatus: PaymentStatus) => {
    if (!profile) return;
    const nextStatus: PaymentStatus = currentStatus === 'paid' ? 'unpaid' : 'paid';
    setActionLoadingId(boyId);
    try {
      workforceService.setPaymentStatus(work.id, boyId, nextStatus, profile);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const totalPaidAmount = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const totalUnpaidAmount = payments
    .filter(p => p.status === 'unpaid')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const boyEvents = events.filter(e => e.boyId === inspectingBoyId);

  return (
    <div className="space-y-6">
      {/* Payment Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card padding="sm" className="bg-emerald-50 border border-emerald-200">
          <span className="text-[10px] font-bold text-emerald-900 uppercase">Total Paid</span>
          <div className="text-xl font-black text-emerald-700 mt-0.5">₹{totalPaidAmount}</div>
        </Card>

        <Card padding="sm" className="bg-red-50 border border-red-200">
          <span className="text-[10px] font-bold text-red-900 uppercase">Total Pending / Unpaid</span>
          <div className="text-xl font-black text-danger mt-0.5">₹{totalUnpaidAmount}</div>
        </Card>

        <Card padding="sm" className="bg-slate-50 border border-border col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-text-muted uppercase">Paid Workers</span>
          <div className="text-xl font-black text-text-strong mt-0.5">
            {payments.filter(p => p.status === 'paid').length} / {members.length}
          </div>
        </Card>
      </div>

      {/* Payments List */}
      {members.length === 0 ? (
        <Card padding="lg" className="text-center py-8">
          <p className="text-xs text-text-muted">No workers assigned to this Work yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const payment = payments.find(p => p.boyId === m.userId);
            const status: PaymentStatus = payment?.status || 'unpaid';
            const isPaid = status === 'paid';
            const amount = payment?.amount || m.snapshotBaseWage;
            const isBillerOrOwner = role === 'owner' || (profile && payment?.billerId === profile.uid);
            const isUpdating = actionLoadingId === m.userId;

            return (
              <Card key={m.id} padding="sm" className="shadow-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-text-strong truncate">{m.snapshotName}</h5>
                      <span className="font-mono text-[11px] text-slate-500">({m.snapshotBoyId})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted mt-1">
                      <span>Biller: <strong>{payment?.billerName || 'Unassigned'}</strong></span>
                      <span>Amount: <strong className="text-text-strong font-bold">₹{amount}</strong></span>
                      <StatusBadge status={status} size="sm" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-border justify-between sm:justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectingBoyId(m.userId)}
                      className="text-xs text-slate-600"
                      icon={<History className="w-3.5 h-3.5" />}
                    >
                      Audit
                    </Button>

                    {isBillerOrOwner && (
                      <Button
                        variant={isPaid ? 'secondary' : 'primary'}
                        size="sm"
                        isLoading={isUpdating}
                        onClick={() => handleTogglePayment(m.userId, status)}
                        className={`text-xs font-bold min-w-[90px] ${!isPaid ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                        icon={isPaid ? <Clock className="w-3.5 h-3.5 text-slate-500" /> : <Check className="w-3.5 h-3.5" />}
                      >
                        {isPaid ? 'Set Unpaid' : 'Mark Paid'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payment Event Audit Modal */}
      <Modal
        isOpen={!!inspectingBoyId}
        title="Payment Event History"
        onClose={() => setInspectingBoyId(null)}
      >
        <div className="space-y-3">
          {boyEvents.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No payment state changes recorded yet.</p>
          ) : (
            <div className="divide-y divide-border">
              {boyEvents.map((evt) => (
                <div key={evt.id} className="py-2.5 text-xs">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-text-strong capitalize">
                      {evt.previousStatus} → {evt.newStatus.toUpperCase()}
                    </span>
                    <span className="text-[10px] text-text-muted">
                      {new Date(evt.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Action by: <strong>{evt.actorNameSnapshot}</strong> | Amount: ₹{evt.amount}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
