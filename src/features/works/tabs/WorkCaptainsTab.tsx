import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { workforceService } from '../../../services/workforceService';
import { Work, WorkCaptain } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Award, Plus, UserMinus, RefreshCw } from 'lucide-react';

interface WorkCaptainsTabProps {
  work: Work;
}

export const WorkCaptainsTab: React.FC<WorkCaptainsTabProps> = ({ work }) => {
  const { profile, role } = useAuth();
  const [captains, setCaptains] = useState<WorkCaptain[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChangeMainModal, setShowChangeMainModal] = useState(false);
  const [selectedCaptainId, setSelectedCaptainId] = useState('');
  const [removingCaptain, setRemovingCaptain] = useState<WorkCaptain | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadCaptains = () => {
    setCaptains(workforceService.getWorkCaptains(work.id));
  };

  useEffect(() => {
    loadCaptains();
    const unsub = workforceService.subscribe(loadCaptains);
    return unsub;
  }, [work.id]);

  const allCaptains = workforceService.getUsers().filter(u => u.role === 'captain' && u.accountStatus === 'active');
  const activeCaptains = captains.filter(c => c.active);
  const historicalCaptains = captains.filter(c => !c.active);

  const mainCaptain = activeCaptains.find(c => c.isMain) || {
    id: 'main',
    workId: work.id,
    captainId: work.mainSiteCaptainId,
    isMain: true,
    active: true,
    snapshotName: work.mainSiteCaptainName,
    snapshotOfficialId: work.mainSiteCaptainOfficialId,
    assignedAt: work.createdAt,
  };

  const additionalCaptains = activeCaptains.filter(c => !c.isMain);

  const handleAddCaptain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedCaptainId) return;

    setActionLoading(true);
    try {
      workforceService.assignCaptain(work.id, selectedCaptainId, false, profile);
      setShowAddModal(false);
      setSelectedCaptainId('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeMain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedCaptainId) return;

    setActionLoading(true);
    try {
      workforceService.assignCaptain(work.id, selectedCaptainId, true, profile);
      setShowChangeMainModal(false);
      setSelectedCaptainId('');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveConfirm = () => {
    if (!profile || !removingCaptain) return;
    setActionLoading(true);
    try {
      workforceService.removeCaptain(work.id, removingCaptain.captainId, profile);
      setRemovingCaptain(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Site Captain Section */}
      <div>
        <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-primary" />
          <span>Primary Site Captain</span>
        </h3>

        <Card padding="md" className="border-l-4 border-l-primary shadow-subtle">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 border border-teal-200 text-primary flex items-center justify-center font-bold text-base shrink-0">
                {mainCaptain.snapshotName?.charAt(0).toUpperCase() || 'C'}
              </div>
              <div>
                <h4 className="text-sm font-bold text-text-strong">{mainCaptain.snapshotName}</h4>
                <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                    {mainCaptain.snapshotOfficialId}
                  </span>
                  <span>• Main Site Lead</span>
                </div>
              </div>
            </div>

            {role === 'owner' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangeMainModal(true)}
                icon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Change Site Captain
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Additional Captains Section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider">
            Additional Support Captains ({additionalCaptains.length})
          </h3>
          {role === 'owner' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(true)}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Support Captain
            </Button>
          )}
        </div>

        {additionalCaptains.length === 0 ? (
          <Card padding="md" className="text-center py-6 bg-slate-50 border-dashed">
            <p className="text-xs text-text-muted">No additional Captains assigned. The Main Site Captain manages this event.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {additionalCaptains.map((c) => (
              <Card key={c.id} padding="sm" className="shadow-subtle">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-text-strong">{c.snapshotName}</h5>
                    <span className="font-mono text-[11px] text-slate-500">{c.snapshotOfficialId}</span>
                  </div>
                  {role === 'owner' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemovingCaptain(c)}
                      className="text-danger hover:bg-red-50 text-xs p-1"
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Historical Removed Captains */}
      {historicalCaptains.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">
            Historical Captain Assignments
          </h4>
          <div className="space-y-2">
            {historicalCaptains.map((c) => (
              <div key={c.id} className="p-3 bg-slate-50 rounded-control text-xs flex justify-between items-center text-slate-500">
                <span>{c.snapshotName} ({c.snapshotOfficialId})</span>
                <span>Removed: {new Date(c.removedAt || '').toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Support Captain Modal */}
      <Modal
        isOpen={showAddModal}
        title="Assign Additional Captain"
        onClose={() => setShowAddModal(false)}
      >
        <form onSubmit={handleAddCaptain} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Choose Captain
            </label>
            <select
              value={selectedCaptainId}
              onChange={(e) => setSelectedCaptainId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-control text-sm text-text-strong focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              <option value="">Select active Captain...</option>
              {allCaptains.filter(c => c.uid !== work.mainSiteCaptainId).map((c) => (
                <option key={c.uid} value={c.uid}>
                  {c.fullName} ({c.currentOfficialId})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={!selectedCaptainId}>
              Assign Captain
            </Button>
          </div>
        </form>
      </Modal>

      {/* Change Main Site Captain Modal */}
      <Modal
        isOpen={showChangeMainModal}
        title="Replace Primary Site Captain"
        onClose={() => setShowChangeMainModal(false)}
      >
        <form onSubmit={handleChangeMain} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Select New Site Captain
            </label>
            <select
              value={selectedCaptainId}
              onChange={(e) => setSelectedCaptainId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-control text-sm text-text-strong focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              <option value="">Select replacement...</option>
              {allCaptains.map((c) => (
                <option key={c.uid} value={c.uid}>
                  {c.fullName} ({c.currentOfficialId})
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowChangeMainModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} disabled={!selectedCaptainId}>
              Update Lead
            </Button>
          </div>
        </form>
      </Modal>

      {/* Remove Captain Confirm */}
      <ConfirmDialog
        isOpen={!!removingCaptain}
        title="Revoke Captain Access?"
        message={`Remove ${removingCaptain?.snapshotName} from this Work? They will lose edit management permissions, but historical read access is preserved.`}
        confirmLabel="Remove Captain"
        variant="danger"
        isLoading={actionLoading}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRemovingCaptain(null)}
      />
    </div>
  );
};
