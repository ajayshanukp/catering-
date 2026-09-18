import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Work, WorkBiller, WorkPayment, WorkWage, PaymentEvent, PaymentStatus } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { ArrowLeft, Check, Clock, History, DollarSign } from 'lucide-react';

export const CaptainBillerWorkspace: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [work, setWork] = useState<Work | null>(null);
  const [billerAssignments, setBillerAssignments] = useState<WorkBiller[]>([]);
  const [payments, setPayments] = useState<WorkPayment[]>([]);
  const [wages, setWages] = useState<WorkWage[]>([]);
  const [events, setEvents] = useState<PaymentEvent[]>([]);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [inspectingBoyId, setInspectingBoyId] = useState<string | null>(null);

  const loadData = () => {
    if (!workId || !profile) return;
    const w = workforceService.getWorkById(workId);
    setWork(w || null);

    // Only boys where THIS captain is the assigned Biller
    const allBillerAss = workforceService.getWorkBillers(workId);
    const myBoys = allBillerAss.filter(b => b.captainId === profile.uid);
    setBillerAssignments(myBoys);

    const allPayments = workforceService.getWorkPayments(workId);
    setPayments(allPayments.filter(p => p.billerId === profile.uid));

    setWages(workforceService.getWorkWages(workId));
    setEvents(workforceService.getPaymentEvents(workId));
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [workId, profile]);

  if (!work) {
    return (
      <PageContainer maxWidth="lg">
        <div className="text-center py-12">
          <p className="text-sm text-text-muted">Work not found.</p>
        </div>
      </PageContainer>
    );
  }

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

  const assignedCount = billerAssignments.length;
  const paidCount = payments.filter(p => p.status === 'paid').length;
  const unpaidCount = assignedCount - paidCount;

  const boyEvents = events.filter(e => e.boyId === inspectingBoyId);

  return (
    <PageContainer maxWidth="xl">
      <button
        type="button"
        onClick={() => navigate(`/owner/works/${work.id}`)}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Event</span>
      </button>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-text-strong">Biller Workspace</h2>
          <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            Assigned Biller: {profile?.fullName}
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Event: <strong className="text-text-strong">{work.name}</strong> ({work.workDate})
        </p>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card padding="sm" className="bg-slate-50 border border-border text-center">
          <span className="text-[10px] uppercase font-bold text-text-muted block">Assigned Workers</span>
          <span className="text-xl font-black text-text-strong">{assignedCount}</span>
        </Card>

        <Card padding="sm" className="bg-emerald-50 border border-emerald-200 text-center">
          <span className="text-[10px] uppercase font-bold text-emerald-900 block">Paid</span>
          <span className="text-xl font-black text-emerald-700">{paidCount}</span>
        </Card>

        <Card padding="sm" className="bg-red-50 border border-red-200 text-center">
          <span className="text-[10px] uppercase font-bold text-red-900 block">Unpaid</span>
          <span className="text-xl font-black text-danger">{unpaidCount}</span>
        </Card>
      </div>

      {/* Biller Assigned Workers List */}
      {billerAssignments.length === 0 ? (
        <EmptyState
          icon={<DollarSign className="w-12 h-12 text-slate-300" />}
          title="No workers assigned to you"
          description="You have not been assigned as the Biller for any workers on this event."
        />
      ) : (
        <div className="space-y-3">
          {billerAssignments.map((b) => {
            const boy = workforceService.getUserById(b.boyId);
            const payment = payments.find(p => p.boyId === b.boyId);
            const wage = wages.find(w => w.boyId === b.boyId);
            const status: PaymentStatus = payment?.status || 'unpaid';
            const isPaid = status === 'paid';
            const amount = payment?.amount || wage?.publishedTotal || wage?.draftTotal || 0;
            const isUpdating = actionLoadingId === b.boyId;

            return (
              <Card key={b.id} padding="md" className="shadow-subtle">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text-strong">{boy?.fullName || 'Worker'}</h4>
                      <span className="font-mono text-xs text-slate-500">({boy?.currentOfficialId})</span>
                      <StatusBadge status={status} size="sm" />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1.5">
                      <span>Base: ₹{wage?.baseWage || boy?.currentCategory === 'A' ? 600 : 450}</span>
                      <span>Adj: ₹{wage?.publishedAdjustment || wage?.draftAdjustment || 0}</span>
                      <span>Total Payout: <strong className="text-text-strong font-black text-sm">₹{amount}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setInspectingBoyId(b.boyId)}
                      icon={<History className="w-3.5 h-3.5" />}
                      className="text-xs text-slate-600"
                    >
                      History
                    </Button>

                    <Button
                      variant={isPaid ? 'secondary' : 'primary'}
                      size="sm"
                      isLoading={isUpdating}
                      onClick={() => handleTogglePayment(b.boyId, status)}
                      className={`min-w-[105px] font-bold text-xs ${!isPaid ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                      icon={isPaid ? <Clock className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                    >
                      {isPaid ? 'Set Unpaid' : 'Mark Paid'}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* History Modal */}
      <Modal
        isOpen={!!inspectingBoyId}
        title="Disbursement Event Log"
        onClose={() => setInspectingBoyId(null)}
      >
        <div className="space-y-3">
          {boyEvents.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No events logged yet.</p>
          ) : (
            boyEvents.map((evt) => (
              <div key={evt.id} className="p-2.5 bg-slate-50 border border-border rounded-control text-xs">
                <div className="flex justify-between items-center font-bold">
                  <span>{evt.previousStatus.toUpperCase()} → {evt.newStatus.toUpperCase()}</span>
                  <span className="text-[10px] text-text-muted">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-slate-600 mt-1">Amount: ₹{evt.amount} by {evt.actorNameSnapshot}</p>
              </div>
            ))
          )}
        </div>
      </Modal>
    </PageContainer>
  );
};
