import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Work, WorkMember, WorkCaptain, WorkWage, WorkPayment } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { 
  ArrowLeft, 
  Check, 
  Slash, 
  XCircle, 
  Edit3, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award,
  DollarSign,
  CreditCard,
  History as HistoryIcon,
  CheckCircle2,
  FileText
} from 'lucide-react';

// Sub-tabs
import { WorkStaffingTab } from './tabs/WorkStaffingTab';
import { WorkCaptainsTab } from './tabs/WorkCaptainsTab';
import { WorkAttendanceTab } from './tabs/WorkAttendanceTab';
import { WorkWagesTab } from './tabs/WorkWagesTab';
import { WorkBillersTab } from './tabs/WorkBillersTab';
import { WorkPaymentsTab } from './tabs/WorkPaymentsTab';
import { WorkHistoryTab } from './tabs/WorkHistoryTab';

export type WorkTab = 'overview' | 'staffing' | 'captains' | 'attendance' | 'wages' | 'billers' | 'payments' | 'history';

export const WorkOverview: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const { profile, role } = useAuth();
  const navigate = useNavigate();

  const [work, setWork] = useState<Work | null>(null);
  const [activeTab, setActiveTab] = useState<WorkTab>('overview');

  // Modals & confirmation dialogs
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Edit fields
  const [editName, setEditName] = useState('');
  const [editTime, setEditTime] = useState('');
  const [editPlace, setEditPlace] = useState('');
  const [editInstructions, setEditInstructions] = useState('');

  const loadWork = () => {
    if (workId) {
      const w = workforceService.getWorkById(workId);
      setWork(w || null);
      if (w) {
        setEditName(w.name);
        setEditTime(w.reportingTime);
        setEditPlace(w.sitePlace);
        setEditInstructions(w.instructions);
      }
    }
  };

  useEffect(() => {
    loadWork();
    const unsub = workforceService.subscribe(loadWork);
    return unsub;
  }, [workId]);

  if (!work) {
    return (
      <PageContainer maxWidth="lg">
        <div className="text-center py-12">
          <p className="text-sm text-text-muted mb-4">Work not found or has been removed.</p>
          <Button variant="outline" size="sm" onClick={() => navigate(role === 'owner' ? '/owner/works' : '/captain/works')}>
            Back to Works
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handleConfirmWork = () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      workforceService.confirmWork(work.id, profile);
      setShowConfirmModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinishWork = () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      workforceService.finishWork(work.id, profile);
      setShowFinishModal(false);
      setActiveTab('wages');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelWork = () => {
    if (!profile) return;
    setActionLoading(true);
    try {
      workforceService.cancelWork(work.id, cancelReason || 'Cancelled by management', profile);
      setShowCancelModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setActionLoading(true);
    try {
      workforceService.updateWork(work.id, {
        name: editName.trim(),
        reportingTime: editTime,
        sitePlace: editPlace.trim(),
        instructions: editInstructions.trim(),
      }, profile);
      setShowEditModal(false);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const tabs: { id: WorkTab; label: string; icon: React.ReactNode; allowedRoles: string[] }[] = [
    { id: 'overview', label: 'Overview', icon: <FileText className="w-3.5 h-3.5" />, allowedRoles: ['owner', 'captain'] },
    { id: 'staffing', label: 'Staffing', icon: <Users className="w-3.5 h-3.5" />, allowedRoles: ['owner', 'captain'] },
    { id: 'captains', label: 'Captains', icon: <Award className="w-3.5 h-3.5" />, allowedRoles: ['owner'] },
    { id: 'attendance', label: 'Attendance', icon: <CheckCircle2 className="w-3.5 h-3.5" />, allowedRoles: ['owner', 'captain'] },
    { id: 'wages', label: 'Wages', icon: <DollarSign className="w-3.5 h-3.5" />, allowedRoles: ['owner', 'captain'] },
    { id: 'billers', label: 'Billers', icon: <Users className="w-3.5 h-3.5" />, allowedRoles: ['owner'] },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-3.5 h-3.5" />, allowedRoles: ['owner', 'captain'] },
    { id: 'history', label: 'Audit History', icon: <HistoryIcon className="w-3.5 h-3.5" />, allowedRoles: ['owner', 'captain'] },
  ];

  const visibleTabs = tabs.filter(t => role && t.allowedRoles.includes(role));

  return (
    <PageContainer maxWidth="2xl">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate(role === 'owner' ? '/owner/works' : '/captain/works')}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-3"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Works</span>
      </button>

      {/* Main Work Header Card */}
      <Card padding="md" className="shadow-subtle mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl sm:text-2xl font-black text-text-strong tracking-tight">
                {work.name}
              </h2>
              <StatusBadge status={work.status} />
            </div>

            <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1 text-text-strong font-medium">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                {work.workDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Reporting: {work.reportingTime}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {work.sitePlace}
              </span>
            </div>
          </div>

          {/* Operational Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            {role === 'owner' && work.status !== 'cancelled' && work.status !== 'finished' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                icon={<Edit3 className="w-4 h-4" />}
              >
                Edit Details
              </Button>
            )}

            {work.status === 'draft' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowConfirmModal(true)}
                icon={<Check className="w-4 h-4" />}
              >
                Confirm & Publish Work
              </Button>
            )}

            {(work.status === 'available' || work.status === 'full') && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowFinishModal(true)}
                icon={<Slash className="w-4 h-4" />}
              >
                Finish Work & Start Wages
              </Button>
            )}

            {work.status !== 'cancelled' && work.status !== 'finished' && (
              <Button
                variant="danger-outline"
                size="sm"
                onClick={() => setShowCancelModal(true)}
                icon={<XCircle className="w-4 h-4" />}
              >
                Cancel Work
              </Button>
            )}
          </div>
        </div>

        {/* Private Management Coverage Card */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-50 rounded-control border border-border">
            <span className="text-text-muted block text-[11px] font-semibold uppercase">Total Staffing</span>
            <span className="text-lg font-bold text-text-strong">
              {work.totalFilled} / {work.totalRequired}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-control border border-border">
            <span className="text-text-muted block text-[11px] font-semibold uppercase">Category A</span>
            <span className="text-lg font-bold text-teal-700">
              {work.aFilled} / {work.aRequired}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-control border border-border">
            <span className="text-text-muted block text-[11px] font-semibold uppercase">Category B</span>
            <span className="text-lg font-bold text-blue-700">
              {work.bFilled} / {work.bRequired}
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-control border border-border">
            <span className="text-text-muted block text-[11px] font-semibold uppercase">Category C</span>
            <span className="text-lg font-bold text-slate-700">
              {work.cFilled} / {work.cRequired}
            </span>
          </div>
        </div>
      </Card>

      {/* Tab Navigation Strip (Horizontal scroll on mobile) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-6 border-b border-border custom-scrollbar">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-control text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === t.id
                ? 'bg-primary text-white shadow-subtle'
                : 'bg-white hover:bg-slate-50 text-text-muted hover:text-text-strong border border-border'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Active Tab View */}
      <div>
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card padding="md" className="shadow-subtle">
                <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
                  Event Scope & Venue
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-text-muted block">Venue / Site Location:</span>
                    <span className="font-semibold text-text-strong">{work.sitePlace}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block">Expected Guest Pax:</span>
                    <span className="font-semibold text-text-strong">{work.pax} Guests</span>
                  </div>
                  {work.description && (
                    <div>
                      <span className="text-text-muted block">Event Description:</span>
                      <p className="text-slate-700 mt-1 leading-relaxed">{work.description}</p>
                    </div>
                  )}
                </div>
              </Card>

              <Card padding="md" className="shadow-subtle">
                <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
                  Site Leadership
                </h4>
                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-text-muted block">Main Site Captain:</span>
                    <span className="font-bold text-primary text-sm">
                      {work.mainSiteCaptainName || 'Unassigned'}
                    </span>
                    {work.mainSiteCaptainOfficialId && (
                      <span className="ml-2 px-1.5 py-0.5 bg-slate-100 rounded font-mono text-[11px]">
                        {work.mainSiteCaptainOfficialId}
                      </span>
                    )}
                  </div>
                  {work.instructions && (
                    <div>
                      <span className="text-text-muted block">Dress Code & Instructions:</span>
                      <p className="text-slate-700 mt-1 leading-relaxed bg-slate-50 p-2.5 rounded-control border border-border">
                        {work.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'staffing' && <WorkStaffingTab work={work} />}
        {activeTab === 'captains' && <WorkCaptainsTab work={work} />}
        {activeTab === 'attendance' && <WorkAttendanceTab work={work} />}
        {activeTab === 'wages' && <WorkWagesTab work={work} />}
        {activeTab === 'billers' && <WorkBillersTab work={work} />}
        {activeTab === 'payments' && <WorkPaymentsTab work={work} />}
        {activeTab === 'history' && <WorkHistoryTab work={work} />}
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        title="Confirm & Publish Work"
        message={`This will make "${work.name}" live for Boys to claim in Available Works. Continue?`}
        confirmLabel="Publish Work"
        variant="primary"
        isLoading={actionLoading}
        onConfirm={handleConfirmWork}
        onCancel={() => setShowConfirmModal(false)}
      />

      <ConfirmDialog
        isOpen={showFinishModal}
        title="Mark Work Finished?"
        message={`Marking this event Finished will lock staffing and advance the Work to the wage preparation and publishing workflow.`}
        confirmLabel="Finish Work"
        variant="primary"
        isLoading={actionLoading}
        onConfirm={handleFinishWork}
        onCancel={() => setShowFinishModal(false)}
      />

      <ConfirmDialog
        isOpen={showCancelModal}
        title="Cancel this Work?"
        message={`Are you sure you want to cancel "${work.name}"? All assigned Boys and Captains will be immediately notified. Historical records are preserved.`}
        confirmLabel="Cancel Event"
        variant="danger"
        isLoading={actionLoading}
        onConfirm={handleCancelWork}
        onCancel={() => setShowCancelModal(false)}
      />

      {/* Edit Work Modal */}
      <Modal
        isOpen={showEditModal}
        title="Edit Work Details"
        onClose={() => setShowEditModal(false)}
      >
        <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
          <Input
            label="Work Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            requiredIndicator
          />
          <Input
            label="Reporting Time"
            type="time"
            value={editTime}
            onChange={(e) => setEditTime(e.target.value)}
            requiredIndicator
          />
          <Input
            label="Site / Place"
            value={editPlace}
            onChange={(e) => setEditPlace(e.target.value)}
            requiredIndicator
          />
          <div>
            <label className="block text-xs font-semibold text-text-strong uppercase mb-1">
              Instructions
            </label>
            <textarea
              rows={3}
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-control text-sm"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={actionLoading}
            >
              Save Details
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
