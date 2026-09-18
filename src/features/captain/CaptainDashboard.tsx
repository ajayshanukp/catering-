import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Work, WorkBiller, WorkPayment } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Briefcase, Calendar, Clock, MapPin, DollarSign, CheckCircle2, ChevronRight } from 'lucide-react';

export const CaptainDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [assignedWorks, setAssignedWorks] = useState<Work[]>([]);
  const [billerAssignments, setBillerAssignments] = useState<WorkBiller[]>([]);
  const [payments, setPayments] = useState<WorkPayment[]>([]);

  useEffect(() => {
    if (!profile) return;
    const load = () => {
      const allWorks = workforceService.getWorks();
      const myWorks = allWorks.filter(w => {
        if (w.mainSiteCaptainId === profile.uid) return true;
        const capRels = workforceService.getWorkCaptains(w.id);
        return capRels.some(r => r.captainId === profile.uid && r.active);
      });
      setAssignedWorks(myWorks);

      const allBillers = myWorks.flatMap(w => workforceService.getWorkBillers(w.id));
      const myBillings = allBillers.filter(b => b.captainId === profile.uid);
      setBillerAssignments(myBillings);

      const allPayments = myWorks.flatMap(w => workforceService.getWorkPayments(w.id));
      setPayments(allPayments.filter(p => p.billerId === profile.uid));
    };
    load();
    const unsub = workforceService.subscribe(load);
    return unsub;
  }, [profile]);

  if (!profile) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayWorks = assignedWorks.filter(w => w.workDate === todayStr && w.status !== 'cancelled');
  const upcomingWorks = assignedWorks.filter(w => w.workDate > todayStr && w.status !== 'cancelled');

  const unpaidBillerCount = payments.filter(p => p.status === 'unpaid').length;

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-strong tracking-tight">
            Captain Operations
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            On-site event leadership, attendance marking, and worker wage disbursements
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <Card padding="sm" className="border-l-4 border-l-teal-600 shadow-subtle">
          <span className="text-[10px] font-bold text-text-muted uppercase">Today's Leads</span>
          <div className="text-2xl font-black text-text-strong mt-0.5">{todayWorks.length}</div>
        </Card>

        <Card padding="sm" className="border-l-4 border-l-blue-600 shadow-subtle">
          <span className="text-[10px] font-bold text-text-muted uppercase">Upcoming Assigned</span>
          <div className="text-2xl font-black text-text-strong mt-0.5">{upcomingWorks.length}</div>
        </Card>

        <Card padding="sm" className="border-l-4 border-l-amber-600 shadow-subtle">
          <span className="text-[10px] font-bold text-text-muted uppercase">Workers to Bill</span>
          <div className="text-2xl font-black text-warning mt-0.5">{billerAssignments.length}</div>
        </Card>

        <Card padding="sm" className="border-l-4 border-l-red-600 shadow-subtle">
          <span className="text-[10px] font-bold text-text-muted uppercase">Pending Payouts</span>
          <div className="text-2xl font-black text-danger mt-0.5">{unpaidBillerCount}</div>
        </Card>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Works */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Works */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Today's On-Site Works ({todayWorks.length})</span>
              </h3>
            </div>

            {todayWorks.length === 0 ? (
              <Card padding="md" className="text-center py-6">
                <p className="text-xs text-text-muted">No events scheduled for you today.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayWorks.map((w) => (
                  <Card
                    key={w.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => navigate(`/owner/works/${w.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-text-strong">{w.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {w.reportingTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {w.sitePlace}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-text-muted">
                        Staff: <strong>{w.totalFilled} / {w.totalRequired}</strong>
                      </span>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/owner/works/${w.id}`);
                        }}
                      >
                        Open Event
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Assigned Works */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold text-text-strong uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>Upcoming Assigned Works</span>
              </h3>
            </div>

            {upcomingWorks.length === 0 ? (
              <Card padding="md" className="text-center py-6">
                <p className="text-xs text-text-muted">No upcoming events currently assigned.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingWorks.slice(0, 3).map((w) => (
                  <Card
                    key={w.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => navigate(`/owner/works/${w.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-text-strong">{w.name}</h4>
                        <p className="text-xs text-text-muted mt-0.5">{w.workDate} at {w.reportingTime}</p>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Biller & Attendance Attention */}
        <div className="space-y-6">
          {/* Biller Workspace Shortcut */}
          <Card padding="md" className="bg-slate-50 border border-border shadow-subtle">
            <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-2 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Biller Responsibilities</span>
            </h4>
            <p className="text-xs text-text-muted leading-relaxed mb-4">
              You are assigned as Biller for <strong>{billerAssignments.length}</strong> worker(s) across finished events.
            </p>

            {todayWorks.length > 0 && (
              <Button
                variant="primary"
                size="sm"
                fullWidth
                onClick={() => navigate(`/captain/works/${todayWorks[0].id}/biller`)}
              >
                Open Today's Biller Sheet
              </Button>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
