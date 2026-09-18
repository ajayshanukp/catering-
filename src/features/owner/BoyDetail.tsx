import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { UserProfile, BoyCategory, WorkMember, UserWageView } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { 
  ArrowLeft, 
  Award, 
  History, 
  CreditCard, 
  UserX, 
  UserCheck, 
  MapPin, 
  Calendar, 
  Phone,
  ShieldAlert
} from 'lucide-react';

export const BoyDetail: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const { profile: currentActor } = useAuth();
  const navigate = useNavigate();

  const [boy, setBoy] = useState<UserProfile | null>(null);
  const [workHistory, setWorkHistory] = useState<WorkMember[]>([]);
  const [payments, setPayments] = useState<UserWageView[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'works' | 'payments' | 'id_history'>('overview');

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState<BoyCategory>('A');
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    if (uid) {
      const u = workforceService.getUserById(uid);
      setBoy(u || null);
      if (u) {
        setNewCategory((u.currentCategory as BoyCategory) || 'C');
        const works = workforceService.getBoyActiveWorks(u.uid);
        setWorkHistory(works);
        setPayments(workforceService.getUserWageViews(u.uid));
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [uid]);

  if (!boy) {
    return (
      <PageContainer maxWidth="lg">
        <div className="text-center py-12">
          <p className="text-sm text-text-muted mb-4">Worker profile not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/owner/boys')}>
            Back to Boys
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handleChangeCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentActor) return;
    setActionLoading(true);
    try {
      workforceService.changeBoyCategory(boy.uid, newCategory, currentActor);
      setShowCategoryModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = () => {
    if (!currentActor) return;
    const nextStatus = boy.accountStatus === 'active' ? 'deactivated' : 'active';
    setActionLoading(true);
    try {
      workforceService.setUserStatus(boy.uid, nextStatus, currentActor);
      setShowDeactivateModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="2xl">
      <button
        type="button"
        onClick={() => navigate('/owner/boys')}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Boys</span>
      </button>

      {/* Identity Banner */}
      <Card padding="md" className="shadow-subtle mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 border-2 border-teal-200 text-primary font-bold text-xl flex items-center justify-center shrink-0">
              {boy.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-text-strong">{boy.fullName}</h2>
                <StatusBadge status={boy.accountStatus} size="sm" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-text-strong">
                  {boy.currentOfficialId}
                </span>
                <span className="font-semibold text-primary px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200">
                  Current Category: {boy.currentCategory || 'C'}
                </span>
                <span>{boy.mobileNumber}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCategoryModal(true)}
              icon={<Award className="w-4 h-4" />}
            >
              Change Category
            </Button>

            <Button
              variant={boy.accountStatus === 'active' ? 'danger-outline' : 'outline'}
              size="sm"
              onClick={() => setShowDeactivateModal(true)}
              icon={boy.accountStatus === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            >
              {boy.accountStatus === 'active' ? 'Deactivate' : 'Reactivate'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 mb-6">
        {[
          { id: 'overview', label: 'Profile Overview' },
          { id: 'works', label: `Works History (${workHistory.length})` },
          { id: 'payments', label: `Payments (${payments.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-3.5 py-2 rounded-control text-xs font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-primary text-white shadow-subtle'
                : 'bg-white hover:bg-slate-50 text-text-muted hover:text-text-strong border border-border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="md" className="shadow-subtle">
              <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
                Location Details
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-text-muted block">Exact Place:</span>
                  <span className="font-semibold text-text-strong">{boy.exactPlace || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Post Office:</span>
                  <span className="font-semibold text-text-strong">{boy.postOffice || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">District:</span>
                  <span className="font-semibold text-text-strong">{boy.district || 'N/A'}</span>
                </div>
              </div>
            </Card>

            <Card padding="md" className="shadow-subtle">
              <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
                Biographical & Official
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-text-muted block">Date of Birth:</span>
                  <span className="font-semibold text-text-strong">{boy.DOB || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Blood Group:</span>
                  <span className="font-bold text-danger">{boy.bloodGroup || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Approved By:</span>
                  <span className="font-medium text-text-strong">{boy.approvedBy || 'System'}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'works' && (
          <div className="space-y-3">
            {workHistory.length === 0 ? (
              <Card padding="lg" className="text-center py-8">
                <p className="text-xs text-text-muted">No Work assignments on record for this worker.</p>
              </Card>
            ) : (
              workHistory.map((m) => (
                <Card key={m.id} padding="sm" className="shadow-subtle flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-text-strong">{m.snapshotName}</h5>
                    <p className="text-[11px] text-text-muted">
                      Snapshot: Category {m.snapshotCategory} • Base Wage ₹{m.snapshotBaseWage}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/owner/works/${m.workId}`)}
                  >
                    View Event
                  </Button>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3">
            {payments.length === 0 ? (
              <Card padding="lg" className="text-center py-8">
                <p className="text-xs text-text-muted">No published wage or payment history yet.</p>
              </Card>
            ) : (
              payments.map((p) => (
                <Card key={p.workId} padding="sm" className="shadow-subtle flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-text-strong">{p.workName}</h5>
                    <p className="text-[11px] text-text-muted">{p.workDate} • Biller: {p.billerName || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-text-strong block text-sm">₹{p.publishedTotal}</span>
                    <StatusBadge status={p.paymentStatus} size="sm" />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Change Category Modal */}
      <Modal
        isOpen={showCategoryModal}
        title="Change Worker Category"
        onClose={() => setShowCategoryModal(false)}
      >
        <form onSubmit={handleChangeCategory} className="space-y-4 text-xs">
          <p className="text-text-muted leading-relaxed">
            Changing category will update the worker's official ID suffix (e.g. <code>BOY-1001-A</code>) for future event bookings. <strong>Historical Work records will retain their original category snapshots.</strong>
          </p>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Select New Category
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['A', 'B', 'C'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setNewCategory(cat)}
                  className={`p-3 rounded-control border text-center font-bold text-sm transition-all ${
                    newCategory === cat
                      ? 'bg-primary text-white border-primary shadow-subtle'
                      : 'bg-white text-text-strong border-border hover:bg-slate-50'
                  }`}
                >
                  Category {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowCategoryModal(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={actionLoading}>
              Update Category
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deactivate User Confirm */}
      <ConfirmDialog
        isOpen={showDeactivateModal}
        title={boy.accountStatus === 'active' ? 'Deactivate Worker Account?' : 'Reactivate Account?'}
        message={boy.accountStatus === 'active' 
          ? `Deactivating ${boy.fullName} will prevent them from signing in or joining Works. All past Work, wage, and payment history remains strictly preserved.`
          : `Reactivate ${boy.fullName}'s account to allow them to take available Works again.`}
        confirmLabel={boy.accountStatus === 'active' ? 'Deactivate User' : 'Reactivate'}
        variant={boy.accountStatus === 'active' ? 'danger' : 'primary'}
        isLoading={actionLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setShowDeactivateModal(false)}
      />
    </PageContainer>
  );
};
