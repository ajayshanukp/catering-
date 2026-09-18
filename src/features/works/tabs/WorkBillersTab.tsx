import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { workforceService } from '../../../services/workforceService';
import { Work, WorkMember, WorkCaptain, WorkBiller, WorkWage } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Users, UserCheck, AlertCircle } from 'lucide-react';

interface WorkBillersTabProps {
  work: Work;
}

export const WorkBillersTab: React.FC<WorkBillersTabProps> = ({ work }) => {
  const { profile, role } = useAuth();
  const [members, setMembers] = useState<WorkMember[]>([]);
  const [captains, setCaptains] = useState<WorkCaptain[]>([]);
  const [billers, setBillers] = useState<WorkBiller[]>([]);
  const [wages, setWages] = useState<WorkWage[]>([]);

  const [assigningBoyId, setAssigningBoyId] = useState<string | null>(null);
  const [selectedCaptainId, setSelectedCaptainId] = useState<string>('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    setMembers(workforceService.getWorkMembers(work.id).filter(m => m.membershipStatus === 'active'));
    setCaptains(workforceService.getWorkCaptains(work.id).filter(c => c.active));
    setBillers(workforceService.getWorkBillers(work.id));
    setWages(workforceService.getWorkWages(work.id));
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [work.id]);

  const handleAssignBiller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !assigningBoyId || !selectedCaptainId) return;

    setActionLoading(true);
    try {
      workforceService.assignBiller(work.id, assigningBoyId, selectedCaptainId, profile);
      setAssigningBoyId(null);
      setSelectedCaptainId('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card padding="md" className="bg-slate-50 border border-border">
        <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-1">
          Biller Assignment Concept
        </h4>
        <p className="text-xs text-text-muted leading-relaxed">
          Biller is <strong>not</strong> a permanent account role. A Biller is a Captain active on this specific Work who is delegated the responsibility of disbursing cash/digital payments to specific assigned workers.
        </p>
      </Card>

      {captains.length === 0 ? (
        <Card padding="lg" className="text-center py-8 bg-amber-50/50 border border-amber-200">
          <AlertCircle className="w-8 h-8 text-warning mx-auto mb-2" />
          <h4 className="text-sm font-bold text-amber-900">No Eligible Captains on this Work</h4>
          <p className="text-xs text-amber-800 mt-1 max-w-md mx-auto">
            Before assigning Billers, ensure at least one active Captain (such as the Site Captain) is assigned in the "Captains" tab.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map((m) => {
            const biller = billers.find(b => b.boyId === m.userId);
            const wage = wages.find(w => w.boyId === m.userId);
            const totalWage = wage?.publishedTotal || wage?.draftTotal || m.snapshotBaseWage;

            return (
              <Card key={m.id} padding="sm" className="shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                    {m.snapshotName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-text-strong">{m.snapshotName}</h5>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted">
                      <span className="font-mono">{m.snapshotBoyId}</span>
                      <span>• Total Wage: <strong className="text-text-strong">₹{totalWage}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-0 border-border">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-text-muted block">Assigned Biller</span>
                    <span className="text-xs font-semibold text-primary">
                      {biller ? `${biller.billerName} (${biller.billerOfficialId})` : 'Unassigned'}
                    </span>
                  </div>

                  {role === 'owner' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setAssigningBoyId(m.userId);
                        setSelectedCaptainId(biller?.captainId || captains[0]?.captainId || '');
                      }}
                    >
                      {biller ? 'Change Biller' : 'Assign Biller'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Assign Biller Modal */}
      <Modal
        isOpen={!!assigningBoyId}
        title="Assign Work Biller"
        onClose={() => setAssigningBoyId(null)}
      >
        <form onSubmit={handleAssignBiller} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Select Captain Assigned to this Work
            </label>
            <select
              value={selectedCaptainId}
              onChange={(e) => setSelectedCaptainId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-control text-sm text-text-strong focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              {captains.map((c) => (
                <option key={c.captainId} value={c.captainId}>
                  {c.snapshotName} ({c.snapshotOfficialId}) {c.isMain ? '— Main Site Captain' : '— Support Captain'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setAssigningBoyId(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={!selectedCaptainId}>
              Save Assignment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
