import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { CaptainWage, Work, UserProfile, PaymentStatus } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { Plus, CreditCard, Check, Clock, Award, Briefcase } from 'lucide-react';

export const CaptainWagesPage: React.FC = () => {
  const { profile } = useAuth();
  const [captainWages, setCaptainWages] = useState<CaptainWage[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [captains, setCaptains] = useState<UserProfile[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [selectedWorkId, setSelectedWorkId] = useState('');
  const [selectedCaptainId, setSelectedCaptainId] = useState('');
  const [wageAmount, setWageAmount] = useState<number>(1200);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    setCaptainWages(workforceService.getCaptainWages());
    setWorks(workforceService.getWorks());
    setCaptains(workforceService.getUsers().filter(u => u.role === 'captain'));
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, []);

  const handleRecordWage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedWorkId || !selectedCaptainId) return;

    const work = works.find(w => w.id === selectedWorkId);
    const captain = captains.find(c => c.uid === selectedCaptainId);
    if (!work || !captain) return;

    setActionLoading(true);
    try {
      workforceService.recordCaptainWage({
        workId: work.id,
        workName: work.name,
        workDate: work.workDate,
        captainId: captain.uid,
        captainName: captain.fullName,
        captainOfficialId: captain.currentOfficialId,
        wageAmount: Number(wageAmount) || 0,
        notes: notes.trim(),
      }, profile);

      setShowModal(false);
      setSelectedWorkId('');
      setSelectedCaptainId('');
      setNotes('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = (record: CaptainWage) => {
    if (!profile) return;
    const nextStatus: PaymentStatus = record.status === 'paid' ? 'unpaid' : 'paid';
    workforceService.setCaptainWagePaymentStatus(record.id, nextStatus, profile);
  };

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">Captain Wages</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Dedicated compensation records for Site Captains and event leadership
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setShowModal(true)}
          icon={<Plus className="w-4 h-4" />}
        >
          Record Captain Wage
        </Button>
      </div>

      {captainWages.length === 0 ? (
        <EmptyState
          icon={<CreditCard className="w-12 h-12 text-slate-300" />}
          title="No Captain wage records"
          description="Click 'Record Captain Wage' to track event compensation for a Site Captain."
          actionLabel="Record Wage"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3">
          {captainWages.map((cw) => (
            <Card key={cw.id} padding="md" className="shadow-subtle">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-text-strong">{cw.captainName}</h4>
                    <span className="font-mono text-xs text-slate-500">({cw.captainOfficialId})</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">
                    Work: <strong className="text-text-strong">{cw.workName}</strong> ({cw.workDate})
                  </p>
                  {cw.notes && <p className="text-xs text-slate-500 mt-1 italic">{cw.notes}</p>}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-border">
                  <div className="text-left sm:text-right">
                    <span className="text-base font-black text-text-strong block">₹{cw.wageAmount}</span>
                    <StatusBadge status={cw.status} size="sm" />
                  </div>

                  <Button
                    variant={cw.status === 'paid' ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleStatus(cw)}
                    className={`text-xs font-bold ${cw.status !== 'paid' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                    icon={cw.status === 'paid' ? <Clock className="w-3.5 h-3.5 text-slate-500" /> : <Check className="w-3.5 h-3.5" />}
                  >
                    {cw.status === 'paid' ? 'Set Unpaid' : 'Mark Paid'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Record Captain Wage Modal */}
      <Modal
        isOpen={showModal}
        title="Record Captain Wage"
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={handleRecordWage} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Select Work Event
            </label>
            <select
              value={selectedWorkId}
              onChange={(e) => setSelectedWorkId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-border rounded-control text-sm"
              required
            >
              <option value="">Choose Work...</option>
              {works.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.workDate})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Select Captain
            </label>
            <select
              value={selectedCaptainId}
              onChange={(e) => setSelectedCaptainId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-border rounded-control text-sm"
              required
            >
              <option value="">Choose Captain...</option>
              {captains.map((c) => (
                <option key={c.uid} value={c.uid}>
                  {c.fullName} ({c.currentOfficialId})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Wage Amount (₹ INR)
            </label>
            <input
              type="number"
              min={1}
              value={wageAmount}
              onChange={(e) => setWageAmount(parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-border rounded-control text-sm font-bold"
              required
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Operational Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Extra hours coordination, transport reimbursement..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-border rounded-control text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Save Captain Wage
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
