import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Work, WorkMember } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Award, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';

export const BoyWorkDetail: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [work, setWork] = useState<Work | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = () => {
    if (workId && profile) {
      const w = workforceService.getWorkById(workId);
      setWork(w || null);
      const myActive = workforceService.getBoyActiveWorks(profile.uid);
      setIsJoined(myActive.some(m => m.workId === workId));
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
          <Button variant="outline" size="sm" onClick={() => navigate('/boy/works')}>
            Back to Available Works
          </Button>
        </div>
      </PageContainer>
    );
  }

  const isFull = work.status === 'full';
  const isCancelled = work.status === 'cancelled';
  const isFinished = work.status === 'finished';

  const handleTakeWork = async () => {
    if (!profile) return;
    setIsLoading(true);
    setError('');

    try {
      workforceService.takeWork(work.id, profile);
      navigate(`/boy/confirmed/${work.id}`);
    } catch (err: any) {
      setError(err.message || 'Unable to join this Work');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="md">
      <button
        type="button"
        onClick={() => navigate('/boy/works')}
        className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-4"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Available Works</span>
      </button>

      {/* Main Info Card */}
      <Card padding="lg" className="shadow-subtle mb-24 sm:mb-8 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-text-strong">{work.name}</h2>
            <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
              <span className="font-semibold text-text-strong">{work.workDate}</span>
              <span>• Reporting: {work.reportingTime}</span>
            </div>
          </div>
          <StatusBadge status={work.status} />
        </div>

        {/* Schedule & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-control border border-border text-xs">
          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-text-muted block font-semibold">Event Venue</span>
              <span className="font-bold text-text-strong">{work.sitePlace}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Award className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span className="text-text-muted block font-semibold">Site Captain</span>
              <span className="font-bold text-text-strong">{work.mainSiteCaptainName || 'Assigned Lead'}</span>
              {work.mainSiteCaptainOfficialId && (
                <span className="font-mono text-slate-500 ml-1">({work.mainSiteCaptainOfficialId})</span>
              )}
            </div>
          </div>
        </div>

        {/* Instructions & Dress Code */}
        {work.instructions && (
          <div>
            <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-1.5">
              Staff Instructions & Dress Code
            </h4>
            <div className="p-3.5 bg-teal-50/50 border border-teal-200 rounded-control text-xs text-teal-950 leading-relaxed">
              {work.instructions}
            </div>
          </div>
        )}

        {/* Description */}
        {work.description && (
          <div>
            <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-1">
              Event Details
            </h4>
            <p className="text-xs text-text-muted leading-relaxed">{work.description}</p>
          </div>
        )}

        {error && (
          <div className="p-3.5 bg-danger-light border border-danger-border rounded-control flex items-center gap-2 text-xs text-danger font-medium">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Desktop Primary Action */}
        <div className="hidden sm:block pt-4 border-t border-border">
          {isJoined ? (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => navigate(`/boy/confirmed/${work.id}`)}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              View My Confirmed Booking
            </Button>
          ) : isFull ? (
            <div>
              <Button variant="secondary" size="lg" fullWidth disabled>
                Work is Full
              </Button>
              <p className="text-center text-xs text-text-muted mt-1.5">
                All worker positions for your category are currently filled.
              </p>
            </div>
          ) : isCancelled || isFinished ? (
            <Button variant="secondary" size="lg" fullWidth disabled>
              Booking Closed
            </Button>
          ) : (
            <Button
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              loadingText="Taking Work..."
              onClick={handleTakeWork}
              icon={<CheckCircle2 className="w-4 h-4" />}
            >
              Take Work
            </Button>
          )}
        </div>
      </Card>

      {/* Sticky Mobile Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-border sm:hidden z-40 pb-safe">
        {isJoined ? (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate(`/boy/confirmed/${work.id}`)}
          >
            View Confirmed Booking
          </Button>
        ) : isFull ? (
          <div>
            <Button variant="secondary" size="lg" fullWidth disabled>
              Work is Full
            </Button>
            <p className="text-center text-[11px] text-text-muted mt-1">
              Positions currently filled for your category.
            </p>
          </div>
        ) : isCancelled || isFinished ? (
          <Button variant="secondary" size="lg" fullWidth disabled>
            Booking Closed
          </Button>
        ) : (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            isLoading={isLoading}
            loadingText="Taking Work..."
            onClick={handleTakeWork}
          >
            Take Work
          </Button>
        )}
      </div>
    </PageContainer>
  );
};
