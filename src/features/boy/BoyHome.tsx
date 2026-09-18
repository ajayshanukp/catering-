import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { WorkPublic, WorkMember, UserWageView, NotificationItem } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { 
  Briefcase, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  DollarSign, 
  Bell, 
  ChevronRight,
  ArrowRight
} from 'lucide-react';

export const BoyHome: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [availableWorks, setAvailableWorks] = useState<WorkPublic[]>([]);
  const [confirmedWorks, setConfirmedWorks] = useState<WorkMember[]>([]);
  const [recentPayment, setRecentPayment] = useState<UserWageView | null>(null);
  const [unreadNotifs, setUnreadNotifs] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (!profile) return;
    const load = () => {
      const pub = workforceService.getPublicWorks();
      setAvailableWorks(pub.filter(w => w.status === 'available'));

      const active = workforceService.getBoyActiveWorks(profile.uid);
      setConfirmedWorks(active);

      const pays = workforceService.getUserWageViews(profile.uid);
      setRecentPayment(pays.length > 0 ? pays[pays.length - 1] : null);

      const notifs = workforceService.getNotifications(profile.uid);
      setUnreadNotifs(notifs.filter(n => !n.isRead));
    };
    load();
    const unsub = workforceService.subscribe(load);
    return unsub;
  }, [profile]);

  if (!profile) return null;

  const nextConfirmed = confirmedWorks.length > 0 ? confirmedWorks[0] : null;
  const nextConfirmedWork = nextConfirmed ? workforceService.getWorkById(nextConfirmed.workId) : null;

  return (
    <PageContainer maxWidth="lg">
      {/* Worker Greeting Banner */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-text-strong tracking-tight">
              Hello, {profile.fullName.split(' ')[0]}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
              <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-text-strong">
                {profile.currentOfficialId}
              </span>
              <span>• Category {profile.currentCategory || 'C'}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-teal-100 border border-teal-200 text-primary font-bold flex items-center justify-center text-sm">
            {profile.fullName.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Next Confirmed Event (Hero Card if exists) */}
        {nextConfirmedWork && (
          <div>
            <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span>Your Next Confirmed Work</span>
            </h3>

            <Card
              variant="interactive"
              padding="lg"
              onClick={() => navigate(`/boy/confirmed/${nextConfirmedWork.id}`)}
              className="border-l-4 border-l-primary bg-teal-50/20 shadow-subtle"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wider block">
                    Upcoming Booking
                  </span>
                  <h4 className="text-base font-bold text-text-strong">{nextConfirmedWork.name}</h4>
                </div>
                <StatusBadge status="active" />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-700 my-3">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{nextConfirmedWork.workDate}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary" />
                  <span>Report by: <strong>{nextConfirmedWork.reportingTime}</strong></span>
                </div>
              </div>

              <div className="pt-3 border-t border-border/80 flex items-center justify-between text-xs">
                <span className="text-text-muted flex items-center gap-1 truncate pr-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{nextConfirmedWork.sitePlace}</span>
                </span>
                <span className="font-bold text-primary shrink-0 flex items-center gap-1">
                  <span>View Details</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Card>
          </div>
        )}

        {/* Quick Status Cards: Alerts & Latest Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Unread Alerts */}
          <Card
            variant="interactive"
            padding="md"
            onClick={() => navigate('/notifications')}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-teal-100 text-primary">
                <Bell className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-strong">Notifications</h4>
                <p className="text-xs text-text-muted">
                  {unreadNotifs.length > 0 ? `${unreadNotifs.length} new operational alert(s)` : 'No unread alerts'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Card>

          {/* Recent Payment */}
          <Card
            variant="interactive"
            padding="md"
            onClick={() => navigate('/boy/payments')}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-emerald-100 text-emerald-700">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-text-strong">Recent Wage</h4>
                <p className="text-xs text-text-muted">
                  {recentPayment ? `₹${recentPayment.publishedTotal} (${recentPayment.paymentStatus.toUpperCase()})` : 'No wage history yet'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Card>
        </div>

        {/* Available Works Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>Available Works</span>
              </h3>
              <p className="text-[11px] text-text-muted">Open catering events you are eligible to claim</p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/boy/works')}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View All ({availableWorks.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {availableWorks.length === 0 ? (
            <Card padding="lg" className="text-center py-8 bg-slate-50 border-dashed">
              <p className="text-xs text-text-muted">No open Works available right now. Check back soon.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {availableWorks.slice(0, 3).map((w) => (
                <Card
                  key={w.id}
                  variant="interactive"
                  padding="md"
                  onClick={() => navigate(`/boy/works/${w.id}`)}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-text-strong">{w.name}</h4>
                      <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                        <span className="flex items-center gap-1 font-semibold text-text-strong">
                          <Calendar className="w-3.5 h-3.5 text-primary" />
                          {w.workDate}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {w.reportingTime}
                        </span>
                      </div>
                    </div>
                    <StatusBadge status="available" size="sm" />
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1 my-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{w.sitePlace}</span>
                  </div>

                  <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                    <span className="text-text-muted">
                      Site Lead: <strong className="text-text-strong">{w.mainSiteCaptainName || 'Assigned'}</strong>
                    </span>
                    <span className="font-bold text-primary flex items-center gap-1">
                      <span>Take Work</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
