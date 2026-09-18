import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Work, WorkMember } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Award, 
  CheckCircle2, 
  AlertTriangle,
  UserMinus
} from 'lucide-react';

export const ConfirmedWorkDetail: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [work, setWork] = useState<Work | null>(null);
  const [membership, setMembership] = useState<WorkMember | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    if (workId && profile) {
      const w = workforceService.getWorkById(workId);
      setWork(w || null);
      const myActive = workforceService.getBoyActiveWorks(profile.uid);
      const mem = myActive.find(m => m.workId === workId);
      setMembership(mem || null);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [workId, profile]);

  if (!work) {
    return (
      <PageContainer maxWidth="md">
        <div className="text-center py-12">
          <p className="text-sm text-text-muted mb-4">Work not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/boy/confirmed')}>
            Back to Confirmed
          </Button>
        </div>
      </PageContainer>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const canLeave = todayStr < work.workDate && work.status !== 'finished' && work.status !== 'cancelled';

  const handleLeaveWork = () => {
    if (!profile) return;
    setIsLoading(true);
    setError('');

    try {
      workforceService.leaveWork(work.id, profile);
      setShowLeaveModal(false);
      navigate('/boy/confirmed');
    } catch (err: any) {
      setError(err.message || 'Unable to leave this Work');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="md">
      <button
        type="button"
        onClick={() => navigate('/boy/confirmed')}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Confirmed Works</span>
      </button>

      <Card padding="lg" className="shadow-subtle mb-24 sm:mb-8 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-primary uppercase">
                Confirmed Booking
              </span>
              <StatusBadge status={work.status} size="sm" />
            </div>
            <h2 className="text-xl font-bold text-text-strong">{work.name}</h2>
          </div>
        </div>

        {/* Schedule & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-control border border-border text-xs">
          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-text-muted block font-semibold">Event Date</span>
              <span className="font-bold text-text-strong">{work.workDate}</span>
              <span className="text-text-muted block mt-0.5">Reporting Time: {work.reportingTime}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-text-muted block font-semibold">Venue</span>
              <span className="font-bold text-text-strong">{work.sitePlace}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {work.instructions && (
          <div>
            <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-1.5">
              Staff Instructions & Uniform
            </h4>
            <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-control text-xs text-teal-950 leading-relaxed">
              {work.instructions}
            </div>
          </div>
        )}

        {/* Leadership Contact */}
        <div className="p-3.5 bg-slate-50 border border-border rounded-control text-xs flex items-center justify-between">
          <div>
            <span className="text-text-muted block">Site Captain</span>
            <span className="font-bold text-text-strong">{work.mainSiteCaptainName || 'Assigned Lead'}</span>
          </div>
          {work.mainSiteCaptainOfficialId && (
            <span className="font-mono text-slate-500 bg-white border border-border px-2 py-0.5 rounded">
              {work.mainSiteCaptainOfficialId}
            </span>
          )}
        </div>

        {error && (
          <div className="p-3 bg-danger-light border border-danger-border rounded-control text-xs text-danger font-medium">
            {error}
          </div>
        )}

        {/* Leave Action Section */}
        <div className="pt-6 border-t border-border">
          {canLeave ? (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-text-muted">
                Need to cancel? You may release your vacancy before the event date arrives.
              </div>
              <Button
                variant="danger-outline"
                size="md"
                onClick={() => setShowLeaveModal(true)}
                icon={<UserMinus className="w-4 h-4" />}
                className="shrink-0"
              >
                Leave Work
              </Button>
            </div>
          ) : (
            <div className="p-3 bg-slate-100 rounded-control text-xs text-slate-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                This Work can no longer be left because the Work Date has arrived or the event is completed.
              </span>
            </div>
          )}
        </div>
      </Card>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLeaveModal}
        title="Leave this Catering Work?"
        message={`Are you sure you want to leave "${work.name}"? Your spot will be made available to other workers immediately.`}
        confirmLabel="Confirm Leave"
        variant="danger"
        isLoading={isLoading}
        onConfirm={handleLeaveWork}
        onCancel={() => setShowLeaveModal(false)}
      />
    </PageContainer>
  );
};
