import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Application } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { 
  ArrowLeft, 
  Check, 
  X, 
  User, 
  MapPin, 
  Calendar, 
  Phone, 
  Heart, 
  ShieldCheck, 
  AlertCircle 
} from 'lucide-react';

export const ApplicationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [application, setApplication] = useState<Application | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    if (id) {
      const app = workforceService.getApplicationById(id);
      setApplication(app || null);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [id]);

  if (!application) {
    return (
      <PageContainer maxWidth="lg">
        <div className="text-center py-12">
          <p className="text-sm text-text-muted mb-4">Application not found.</p>
          <Button variant="outline" size="sm" onClick={() => navigate('/owner/applications')}>
            Back to Applications
          </Button>
        </div>
      </PageContainer>
    );
  }

  const handleApprove = () => {
    if (!profile) return;
    setActionLoading(true);
    setError('');
    try {
      workforceService.approveApplication(application.id, profile);
      navigate('/owner/applications');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejecting this application');
      return;
    }

    setActionLoading(true);
    setError('');
    try {
      workforceService.rejectApplication(application.id, rejectReason.trim(), profile);
      setShowRejectModal(false);
      navigate('/owner/applications');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="lg">
      <button
        type="button"
        onClick={() => navigate('/owner/applications')}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Applications</span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-24 sm:mb-8">
        {/* Left 2 Columns: Application Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card padding="lg" className="shadow-subtle">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-6 border-b border-border">
              <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-primary/20 overflow-hidden shrink-0 flex items-center justify-center font-bold text-2xl text-slate-700">
                {application.photoUrl ? (
                  <img src={application.photoUrl} alt={application.fullName} className="w-full h-full object-cover" />
                ) : (
                  application.fullName.charAt(0).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-text-strong truncate">{application.fullName}</h3>
                  <StatusBadge status={application.status} />
                </div>
                <p className="text-xs text-text-muted">Registered Phone: {application.mobileNumber}</p>
                <p className="text-[11px] text-text-muted mt-1">
                  Submitted: {new Date(application.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Submitted Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
              <div>
                <span className="text-text-muted block mb-1">Date of Birth</span>
                <span className="font-semibold text-text-strong">{application.DOB}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Blood Group</span>
                <span className="font-bold text-danger">{application.bloodGroup}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Exact Place / Town</span>
                <span className="font-semibold text-text-strong">{application.exactPlace}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Post Office</span>
                <span className="font-semibold text-text-strong">{application.postOffice}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">District</span>
                <span className="font-semibold text-text-strong">{application.district}</span>
              </div>
            </div>

            {application.rejectionReason && (
              <div className="mt-6 p-4 bg-danger-light border border-danger-border rounded-control text-xs">
                <p className="font-bold text-danger mb-1 uppercase">Prior Rejection Reason:</p>
                <p className="text-slate-800">{application.rejectionReason}</p>
              </div>
            )}

            {error && (
              <div className="mt-4 p-3 bg-danger-light border border-danger-border rounded-control text-xs text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Desktop Decision Card */}
        <div className="space-y-4">
          <Card padding="lg" className="shadow-subtle">
            <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3">
              Application Decision
            </h4>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              Approving this applicant will automatically assign them to <strong>Category C</strong> and generate a unique collision-safe official Boy ID.
            </p>

            {application.status === 'pending' ? (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  fullWidth
                  isLoading={actionLoading}
                  onClick={handleApprove}
                  icon={<Check className="w-4 h-4" />}
                >
                  Accept & Generate ID
                </Button>
                <Button
                  type="button"
                  variant="danger-outline"
                  size="md"
                  fullWidth
                  disabled={actionLoading}
                  onClick={() => setShowRejectModal(true)}
                  icon={<X className="w-4 h-4" />}
                >
                  Reject with Reason
                </Button>
              </div>
            ) : (
              <div className="p-3 bg-slate-50 border border-border rounded-control text-xs text-center text-text-muted">
                This application has already been reviewed ({application.status}).
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Mobile Sticky Decision Bar */}
      {application.status === 'pending' && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-border lg:hidden z-40 pb-safe flex gap-3">
          <Button
            type="button"
            variant="danger-outline"
            size="md"
            fullWidth
            disabled={actionLoading}
            onClick={() => setShowRejectModal(true)}
          >
            Reject
          </Button>
          <Button
            type="button"
            variant="primary"
            size="md"
            fullWidth
            isLoading={actionLoading}
            onClick={handleApprove}
          >
            Accept & Issue ID
          </Button>
        </div>
      )}

      {/* Rejection Reason Modal */}
      <Modal
        isOpen={showRejectModal}
        title="Reject Worker Application"
        onClose={() => setShowRejectModal(false)}
      >
        <form onSubmit={handleRejectConfirm} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-text-strong mb-1.5">
              Reason for Rejection <span className="text-danger">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Unclear photo, incomplete address details, age restriction..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white border border-border rounded-control text-sm focus:ring-2 focus:ring-danger"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowRejectModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              size="sm"
              isLoading={actionLoading}
            >
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </PageContainer>
  );
};
