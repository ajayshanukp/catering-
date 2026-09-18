import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { WageSettings, BoyCategory } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DollarSign, Edit3, ShieldAlert, Check } from 'lucide-react';

export const WageSettingsPage: React.FC = () => {
  const { profile } = useAuth();
  const [settings, setSettings] = useState<WageSettings>(workforceService.getWageSettings());
  const [editingCategory, setEditingCategory] = useState<BoyCategory | null>(null);
  const [newAmount, setNewAmount] = useState<number>(0);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    setSettings(workforceService.getWageSettings());
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, []);

  const handleOpenEdit = (cat: BoyCategory) => {
    setEditingCategory(cat);
    const curr = cat === 'A' ? settings.categoryA : cat === 'B' ? settings.categoryB : settings.categoryC;
    setNewAmount(curr);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !editingCategory) return;
    if (newAmount <= 0) {
      alert('Wage must be greater than 0');
      return;
    }

    setActionLoading(true);
    try {
      const patch = editingCategory === 'A' ? { categoryA: newAmount } :
                    editingCategory === 'B' ? { categoryB: newAmount } : { categoryC: newAmount };
      workforceService.updateWageSettings(patch, profile);
      setEditingCategory(null);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">Standard Boy Wage Settings</h2>
        <p className="text-xs text-text-muted mt-0.5">
          Configure default base wages for worker categories. Changes affect future event bookings without altering historical snapshots.
        </p>
      </div>

      {/* 3 Category Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { cat: 'A' as BoyCategory, title: 'Category A (Senior)', amount: settings.categoryA, desc: 'Lead servers & experienced supervisors' },
          { cat: 'B' as BoyCategory, title: 'Category B (Intermediate)', amount: settings.categoryB, desc: 'Trained catering servers & runners' },
          { cat: 'C' as BoyCategory, title: 'Category C (Entry / Standard)', amount: settings.categoryC, desc: 'Standard workers & newly approved applicants' },
        ].map((item) => (
          <Card key={item.cat} padding="lg" className="shadow-subtle border-t-4 border-t-primary flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2.5 py-0.5 rounded-full font-bold text-xs bg-teal-50 text-primary border border-teal-200">
                  Category {item.cat}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenEdit(item.cat)}
                  className="p-1 text-slate-400 hover:text-primary transition-colors"
                  title={`Edit Category ${item.cat} Base Wage`}
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>

              <h4 className="text-sm font-bold text-text-strong mt-1">{item.title}</h4>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">{item.desc}</p>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-baseline justify-between">
              <span className="text-xs text-text-muted uppercase font-semibold">Standard Base</span>
              <span className="text-2xl font-black text-text-strong">₹{item.amount}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Immutability Explainer */}
      <Card padding="md" className="bg-slate-50 border border-border text-xs text-slate-600 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-primary shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-text-strong uppercase tracking-wider mb-1">
            Historical Snapshot Guarantee
          </h5>
          <p className="leading-relaxed">
            When a worker takes or is added to a Work, their current category base wage is snapshotted into the Work membership record. Updating standard base wages here ensures future bookings use the new amount while preserving past financial records exactly as they were executed.
          </p>
        </div>
      </Card>

      {/* Edit Wage Modal */}
      <Modal
        isOpen={!!editingCategory}
        title={`Edit Category ${editingCategory} Standard Base Wage`}
        onClose={() => setEditingCategory(null)}
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Base Wage Amount (₹ INR)
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-bold text-slate-500">₹</span>
              <input
                type="number"
                min={1}
                value={newAmount}
                onChange={(e) => setNewAmount(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-control text-base font-bold text-text-strong focus:ring-2 focus:ring-primary min-h-[44px]"
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setEditingCategory(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading} icon={<Check className="w-4 h-4" />}>
              Save Standard Wage
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
