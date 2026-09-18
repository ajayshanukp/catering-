import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { UserProfile, Work, CaptainWage } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { 
  ArrowLeft, 
  Award, 
  Briefcase, 
  DollarSign, 
  UserX, 
  UserCheck, 
  MapPin, 
  Calendar,
  ExternalLink 
} from 'lucide-react';

export const CaptainDetail: React.FC = () => {
  const { uid } = useParams<{ uid: string }>();
  const { profile: currentActor } = useAuth();
  const navigate = useNavigate();

  const [captain, setCaptain] = useState<UserProfile | null>(null);
  const [assignedWorks, setAssignedWorks] = useState<Work[]>([]);
  const [wages, setWages] = useState<CaptainWage[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'assignments' | 'wages'>('overview');

  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = () => {
    if (uid) {
      const u = workforceService.getUserById(uid);
      setCaptain(u || null);
      if (u) {
        // Find works where this captain is main lead or assigned
        const allWorks = workforceService.getWorks();
        const relevant = allWorks.filter(w => {
          if (w.mainSiteCaptainId === u.uid) return true;
          const capRels = workforceService.getWorkCaptains(w.id);
          return capRels.some(r => r.captainId === u.uid);
        });
        setAssignedWorks(relevant);
        setWages(workforceService.getCaptainWages(u.uid));
      }
    }
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [uid]);

  if (!captain) {
    return (
      <PageContainer maxWidth="lg">
        <div className="text-center py-12">
          <p className="text-sm text-text-muted mb-4">Captain profile not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/owner/captains')}>
            Back to Captains
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handleToggleStatus = () => {
    if (!currentActor) return;
    const nextStatus = captain.accountStatus === 'active' ? 'deactivated' : 'active';
    setActionLoading(true);
    try {
      workforceService.setUserStatus(captain.uid, nextStatus, currentActor);
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
        onClick={() => navigate('/owner/captains')}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Captains</span>
      </button>

      {/* Identity Card */}
      <Card padding="md" className="shadow-subtle mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-teal-100 border-2 border-teal-200 text-primary font-bold text-xl flex items-center justify-center shrink-0">
              {captain.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-text-strong">{captain.fullName}</h2>
                <StatusBadge status={captain.accountStatus} size="sm" />
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mt-1">
                <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-text-strong">
                  {captain.currentOfficialId}
                </span>
                <span>Mobile: {captain.mobileNumber}</span>
                <span>Place: {captain.exactPlace}</span>
              </div>
            </div>
          </div>

          <Button
            variant={captain.accountStatus === 'active' ? 'danger-outline' : 'outline'}
            size="sm"
            onClick={() => setShowDeactivateModal(true)}
            icon={captain.accountStatus === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
          >
            {captain.accountStatus === 'active' ? 'Deactivate Captain' : 'Reactivate'}
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-2 mb-6">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'assignments', label: `Assigned Works (${assignedWorks.length})` },
          { id: 'wages', label: `Captain Wages (${wages.length})` },
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

      {/* Tab Panels */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card padding="md" className="shadow-subtle">
              <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
                Address & Contact
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-text-muted block">Place:</span>
                  <span className="font-semibold text-text-strong">{captain.exactPlace || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Post Office:</span>
                  <span className="font-semibold text-text-strong">{captain.postOffice || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-text-muted block">District:</span>
                  <span className="font-semibold text-text-strong">{captain.district || 'N/A'}</span>
                </div>
              </div>
            </Card>

            <Card padding="md" className="shadow-subtle">
              <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
                Captain Role Details
              </h4>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-text-muted block">Role Type:</span>
                  <span className="font-bold text-text-strong uppercase">Site Lead / Captain</span>
                </div>
                <div>
                  <span className="text-text-muted block">Official Captain ID:</span>
                  <span className="font-mono font-bold text-primary">{captain.currentOfficialId}</span>
                </div>
                <div>
                  <span className="text-text-muted block">Total Events Led:</span>
                  <span className="font-bold text-text-strong">{assignedWorks.length} Events</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-3">
            {assignedWorks.length === 0 ? (
              <Card padding="lg" className="text-center py-8">
                <p className="text-xs text-text-muted">No Works currently assigned to this Captain.</p>
              </Card>
            ) : (
              assignedWorks.map((w) => (
                <Card key={w.id} padding="sm" className="shadow-subtle flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-text-strong">{w.name}</h5>
                    <p className="text-[11px] text-text-muted">
                      {w.workDate} at {w.reportingTime} • Site: {w.sitePlace}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={w.status} size="sm" />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/owner/works/${w.id}`)}
                    >
                      Manage Work
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'wages' && (
          <div className="space-y-3">
            {wages.length === 0 ? (
              <Card padding="lg" className="text-center py-8">
                <p className="text-xs text-text-muted">No separate Captain wage records recorded yet.</p>
              </Card>
            ) : (
              wages.map((wg) => (
                <Card key={wg.id} padding="sm" className="shadow-subtle flex justify-between items-center text-xs">
                  <div>
                    <h5 className="font-bold text-text-strong">{wg.workName}</h5>
                    <p className="text-[11px] text-text-muted">Date: {wg.workDate}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-text-strong text-sm block">₹{wg.wageAmount}</span>
                    <StatusBadge status={wg.status} size="sm" />
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {/* Confirm Deactivate Dialog */}
      <ConfirmDialog
        isOpen={showDeactivateModal}
        title={captain.accountStatus === 'active' ? 'Deactivate Captain Account?' : 'Reactivate Captain?'}
        message={`Deactivating ${captain.fullName} will prevent them from leading Works or accessing Captain operations. Past assignments are preserved.`}
        confirmLabel={captain.accountStatus === 'active' ? 'Deactivate' : 'Reactivate'}
        variant={captain.accountStatus === 'active' ? 'danger' : 'primary'}
        isLoading={actionLoading}
        onConfirm={handleToggleStatus}
        onCancel={() => setShowDeactivateModal(false)}
      />
    </PageContainer>
  );
};
