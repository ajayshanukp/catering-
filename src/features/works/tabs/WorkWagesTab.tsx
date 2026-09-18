import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { workforceService } from '../../../services/workforceService';
import { Work, WorkMember, WorkWage } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { DollarSign, Send, Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface WorkWagesTabProps {
  work: Work;
}

export const WorkWagesTab: React.FC<WorkWagesTabProps> = ({ work }) => {
  const { profile, role } = useAuth();
  const [members, setMembers] = useState<WorkMember[]>([]);
  const [wages, setWages] = useState<WorkWage[]>([]);
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = () => {
    const mems = workforceService.getWorkMembers(work.id).filter(m => m.membershipStatus === 'active');
    const wg = workforceService.getWorkWages(work.id);
    setMembers(mems);
    setWages(wg);

    // Populate adjustments map
    const adjMap: Record<string, number> = {};
    mems.forEach(m => {
      const w = wg.find(item => item.boyId === m.userId);
      adjMap[m.userId] = w ? w.draftAdjustment : 0;
    });
    setAdjustments(adjMap);
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [work.id]);

  const isFinished = work.status === 'finished';

  const handleAdjustmentChange = (boyId: string, val: number) => {
    setAdjustments(prev => ({ ...prev, [boyId]: val }));
  };

  const handleSaveDraft = (boyId: string) => {
    if (!profile) return;
    setActionLoadingId(boyId);
    try {
      const adj = adjustments[boyId] || 0;
      workforceService.saveWageDraft(work.id, boyId, adj, profile);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  const handlePublish = (boyId: string) => {
    if (!profile) return;
    setActionLoadingId(boyId);
    try {
      const adj = adjustments[boyId] || 0;
      workforceService.saveWageDraft(work.id, boyId, adj, profile);
      workforceService.publishWage(work.id, boyId, profile);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      {!isFinished ? (
        <Card padding="md" className="bg-amber-50 border border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                Event Not Yet Marked Finished
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Wages can be drafted now, but published wages should typically be finalized after the Work has been marked "Finished".
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="md" className="bg-teal-50 border border-teal-200 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wider">
              Work Finished — Wage Preparation
            </h4>
            <p className="text-xs text-teal-700 mt-0.5">
              Draft bonuses/penalties, then click Publish. Workers only see wages once explicitly Published.
            </p>
          </div>
        </Card>
      )}

      {/* Workers Wage Table / Cards */}
      {members.length === 0 ? (
        <Card padding="lg" className="text-center py-10">
          <p className="text-sm text-text-muted">No workers assigned to this event.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {members.map((m) => {
            const wage = wages.find(w => w.boyId === m.userId);
            const base = m.snapshotBaseWage || 450;
            const currentAdj = adjustments[m.userId] !== undefined ? adjustments[m.userId] : (wage?.draftAdjustment || 0);
            const draftTotal = base + currentAdj;
            const isPublished = wage?.isPublished || false;
            const isLoading = actionLoadingId === m.userId;

            return (
              <Card key={m.id} padding="md" className="shadow-subtle">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Boy identity & snapshot */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-text-strong truncate">{m.snapshotName}</h4>
                      <span className="font-mono text-xs text-slate-500">({m.snapshotBoyId})</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        Cat {m.snapshotCategory}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-text-muted mt-2">
                      <span>Base Wage: <strong className="text-text-strong">₹{base}</strong></span>
                      {isPublished && (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Published: ₹{wage?.publishedTotal} (v{wage?.publishedVersion})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Calculations & inputs */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-text-muted uppercase mb-1">
                        Adjustment (Bonus / Deduction)
                      </label>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500 font-semibold">₹</span>
                        <input
                          type="number"
                          value={currentAdj}
                          onChange={(e) => handleAdjustmentChange(m.userId, parseInt(e.target.value) || 0)}
                          className="w-24 px-2 py-1.5 bg-white border border-border rounded-control text-sm font-bold text-text-strong focus:ring-2 focus:ring-primary text-center"
                        />
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-border p-2 rounded-control text-center min-w-[90px]">
                      <span className="block text-[10px] font-semibold text-text-muted uppercase">Draft Total</span>
                      <span className="text-base font-black text-primary">₹{draftTotal}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 sm:pt-0">
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={isLoading}
                        onClick={() => handleSaveDraft(m.userId)}
                        icon={<Save className="w-3.5 h-3.5" />}
                      >
                        Save Draft
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        isLoading={isLoading}
                        onClick={() => handlePublish(m.userId)}
                        icon={<Send className="w-3.5 h-3.5" />}
                      >
                        {isPublished ? 'Update & Publish' : 'Publish Wage'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
