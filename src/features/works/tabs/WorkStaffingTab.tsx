import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { workforceService } from '../../../services/workforceService';
import { Work, WorkMember, UserProfile } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Modal } from '../../../components/ui/Modal';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { Plus, Search, UserMinus, RotateCcw, ExternalLink } from 'lucide-react';

interface WorkStaffingTabProps {
  work: Work;
}

export const WorkStaffingTab: React.FC<WorkStaffingTabProps> = ({ work }) => {
  const { profile, role } = useAuth();
  const navigate = useNavigate();

  const [members, setMembers] = useState<WorkMember[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBoyId, setSelectedBoyId] = useState('');
  const [ownerOverride, setOwnerOverride] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [removingMember, setRemovingMember] = useState<WorkMember | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadMembers = () => {
    setMembers(workforceService.getWorkMembers(work.id));
  };

  useEffect(() => {
    loadMembers();
    const unsub = workforceService.subscribe(loadMembers);
    return unsub;
  }, [work.id]);

  const activeMembers = members.filter(m => m.membershipStatus === 'active');
  const historicalMembers = members.filter(m => m.membershipStatus !== 'active');

  // Eligible boys for manual add
  const allBoys = workforceService.getUsers().filter(u => u.role === 'boy' && u.accountStatus === 'active');
  const availableBoys = allBoys.filter(b => !activeMembers.some(m => m.userId === b.uid));

  const handleAddBoy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !selectedBoyId) return;

    setActionLoading(true);
    try {
      const boy = workforceService.getUserById(selectedBoyId);
      if (!boy) return;
      workforceService.takeWork(work.id, boy);
      setShowAddModal(false);
      setSelectedBoyId('');
      setOwnerOverride(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveConfirm = () => {
    if (!profile || !removingMember) return;
    setActionLoading(true);
    try {
      workforceService.removeBoyFromWork(work.id, removingMember.userId, profile);
      setRemovingMember(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReadd = (member: WorkMember) => {
    if (!profile) return;
    setActionLoading(true);
    try {
      workforceService.readdBoyToWork(work.id, member.userId, profile, true);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredActive = activeMembers.filter(m => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return m.snapshotName.toLowerCase().includes(q) || m.snapshotBoyId.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search assigned boys by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-control text-xs sm:text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
          />
        </div>

        {work.status !== 'finished' && work.status !== 'cancelled' && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowAddModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Add Boy Manually
          </Button>
        )}
      </div>

      {/* Active Staff List */}
      <div>
        <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
          Active Assigned Staff ({activeMembers.length} / {work.totalRequired})
        </h3>

        {filteredActive.length === 0 ? (
          <Card padding="lg" className="text-center py-8">
            <p className="text-xs text-text-muted">No active staff members assigned yet.</p>
          </Card>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="space-y-3 lg:hidden">
              {filteredActive.map((m) => (
                <Card key={m.id} padding="sm" className="shadow-subtle">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-teal-100 text-primary font-bold text-xs flex items-center justify-center">
                        {m.snapshotName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-text-strong">{m.snapshotName}</h4>
                        <span className="font-mono text-[11px] text-slate-500">{m.snapshotBoyId}</span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-50 text-primary border border-teal-200">
                      Cat {m.snapshotCategory}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border text-xs">
                    <span className="text-text-muted">
                      Joined: {new Date(m.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    <div className="flex items-center gap-1">
                      {role === 'owner' && (
                        <button
                          type="button"
                          onClick={() => navigate(`/owner/boys/${m.userId}`)}
                          className="p-1 text-slate-500 hover:text-primary"
                          title="View Profile"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      )}
                      {work.status !== 'finished' && work.status !== 'cancelled' && (
                        <Button
                          variant="danger-outline"
                          size="sm"
                          onClick={() => setRemovingMember(m)}
                          className="text-xs py-1 px-2 min-h-[32px]"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-surface border border-border rounded-panel overflow-hidden shadow-subtle">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-border text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Boy Name</th>
                    <th className="px-4 py-3.5">Official ID</th>
                    <th className="px-4 py-3.5">Category Snapshot</th>
                    <th className="px-4 py-3.5">Base Wage Snapshot</th>
                    <th className="px-4 py-3.5">Joined Time</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredActive.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-text-strong">{m.snapshotName}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{m.snapshotBoyId}</td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-teal-50 text-primary border border-teal-200">
                          Category {m.snapshotCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-text-strong">₹{m.snapshotBaseWage}</td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {new Date(m.joinedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {role === 'owner' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/owner/boys/${m.userId}`)}
                              className="text-xs"
                            >
                              Profile
                            </Button>
                          )}
                          {work.status !== 'finished' && work.status !== 'cancelled' && (
                            <Button
                              variant="danger-outline"
                              size="sm"
                              onClick={() => setRemovingMember(m)}
                              className="text-xs"
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Historical Membership (Left / Removed) */}
      {historicalMembers.length > 0 && (
        <div className="pt-4 border-t border-border">
          <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
            Membership History (Left / Removed)
          </h3>
          <div className="space-y-2">
            {historicalMembers.map((m) => (
              <Card key={m.id} padding="sm" className="bg-slate-50 border-dashed">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-text-strong">{m.snapshotName}</span>
                    <span className="ml-2 font-mono text-slate-500">({m.snapshotBoyId})</span>
                    <span className={`ml-2 px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                      m.membershipStatus === 'left' ? 'bg-amber-100 text-warning' : 'bg-red-100 text-danger'
                    }`}>
                      {m.membershipStatus}
                    </span>
                  </div>

                  {work.status !== 'finished' && work.status !== 'cancelled' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReadd(m)}
                      icon={<RotateCcw className="w-3.5 h-3.5" />}
                    >
                      Re-add
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Manual Add Modal */}
      <Modal
        isOpen={showAddModal}
        title="Add Boy to Work"
        onClose={() => setShowAddModal(false)}
      >
        <form onSubmit={handleAddBoy} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Select Active Boy
            </label>
            <select
              value={selectedBoyId}
              onChange={(e) => setSelectedBoyId(e.target.value)}
              className="w-full px-3 py-2.5 bg-white border border-border rounded-control text-sm text-text-strong focus:ring-2 focus:ring-primary min-h-[44px]"
            >
              <option value="">Choose worker...</option>
              {availableBoys.map((b) => (
                <option key={b.uid} value={b.uid}>
                  {b.fullName} ({b.currentOfficialId}) — Cat {b.currentCategory}
                </option>
              ))}
            </select>
          </div>

          {role === 'owner' && (
            <label className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-control cursor-pointer">
              <input
                type="checkbox"
                checked={ownerOverride}
                onChange={(e) => setOwnerOverride(e.target.checked)}
                className="w-4 h-4 text-primary rounded border-border"
              />
              <span className="text-xs text-amber-900 font-medium">
                Authorize Owner Override (bypass same-day lock if exceptional)
              </span>
            </label>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={actionLoading}
              disabled={!selectedBoyId}
            >
              Add Boy
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Remove Dialog */}
      <ConfirmDialog
        isOpen={!!removingMember}
        title="Remove Worker from Work?"
        message={`Are you sure you want to remove ${removingMember?.snapshotName} (${removingMember?.snapshotBoyId})? Vacancy will be released and removal event will be recorded in audit history.`}
        confirmLabel="Remove Worker"
        variant="danger"
        isLoading={actionLoading}
        onConfirm={handleRemoveConfirm}
        onCancel={() => setRemovingMember(null)}
      />
    </div>
  );
};
