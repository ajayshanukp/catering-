import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { Work, Application, WorkPayment, AuditLog } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { 
  Plus, 
  Briefcase, 
  Calendar, 
  Users, 
  UserCheck, 
  CreditCard, 
  AlertTriangle, 
  ArrowRight,
  Clock,
  MapPin,
  ChevronRight
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [works, setWorks] = useState<Work[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [payments, setPayments] = useState<WorkPayment[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const load = () => {
      setWorks(workforceService.getWorks());
      setApplications(workforceService.getApplications());
      setPayments(workforceService.getAllPayments());
      setAuditLogs(workforceService.getAuditLogs().slice(0, 5));
    };
    load();
    const unsub = workforceService.subscribe(load);
    return unsub;
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const todayWorks = works.filter(w => w.workDate === todayStr && w.status !== 'cancelled');
  const upcomingWorks = works.filter(w => w.workDate > todayStr && w.status !== 'cancelled');
  const activeWorks = works.filter(w => w.status === 'available');
  const fullWorks = works.filter(w => w.status === 'full');
  const pendingApps = applications.filter(a => a.status === 'pending');
  const unpaidPayments = payments.filter(p => p.status === 'unpaid');

  // Under-staffed Works that need attention
  const understaffedWorks = works.filter(w => 
    (w.status === 'available' || w.status === 'draft') && 
    w.totalFilled < w.totalRequired
  );

  return (
    <PageContainer maxWidth="2xl">
      {/* Top Greeting & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-text-strong tracking-tight">
            Owner Command Center
          </h2>
          <p className="text-xs text-text-muted mt-0.5">
            Real-time workforce staffing, event coverage, and payment operations
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate('/owner/works/new')}
          icon={<Plus className="w-5 h-5" />}
          className="shadow-subtle"
        >
          Add New Work
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-8">
        <Card
          variant="interactive"
          padding="sm"
          onClick={() => navigate('/owner/works')}
          className="border-l-4 border-l-teal-600"
        >
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Today's Works</span>
          <div className="text-2xl font-black text-text-strong mt-1">{todayWorks.length}</div>
        </Card>

        <Card
          variant="interactive"
          padding="sm"
          onClick={() => navigate('/owner/works')}
          className="border-l-4 border-l-blue-600"
        >
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Upcoming</span>
          <div className="text-2xl font-black text-text-strong mt-1">{upcomingWorks.length}</div>
        </Card>

        <Card
          variant="interactive"
          padding="sm"
          onClick={() => navigate('/owner/works')}
          className="border-l-4 border-l-emerald-600"
        >
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Available</span>
          <div className="text-2xl font-black text-text-strong mt-1">{activeWorks.length}</div>
        </Card>

        <Card
          variant="interactive"
          padding="sm"
          onClick={() => navigate('/owner/works')}
          className="border-l-4 border-l-amber-600"
        >
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Full Works</span>
          <div className="text-2xl font-black text-text-strong mt-1">{fullWorks.length}</div>
        </Card>

        <Card
          variant="interactive"
          padding="sm"
          onClick={() => navigate('/owner/applications')}
          className="border-l-4 border-l-purple-600"
        >
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Pending Apps</span>
          <div className="text-2xl font-black text-purple-700 mt-1">{pendingApps.length}</div>
        </Card>

        <Card
          variant="interactive"
          padding="sm"
          onClick={() => navigate('/owner/payments')}
          className="border-l-4 border-l-red-600"
        >
          <span className="text-[11px] font-bold text-text-muted uppercase tracking-wider">Unpaid</span>
          <div className="text-2xl font-black text-danger mt-1">{unpaidPayments.length}</div>
        </Card>
      </div>

      {/* Main 2-Column Section: Today/Upcoming on Left, Attention/Activity on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Works List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Works */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-strong uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                <span>Today's Works ({todayWorks.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => navigate('/owner/works')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View All Works</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayWorks.length === 0 ? (
              <Card padding="md" className="text-center py-8">
                <p className="text-xs text-text-muted">No catering events scheduled for today.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {todayWorks.map((work) => (
                  <Card
                    key={work.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => navigate(`/owner/works/${work.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="text-sm font-bold text-text-strong">{work.name}</h4>
                        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {work.reportingTime}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            {work.sitePlace}
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={work.status} />
                    </div>

                    <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
                      <span className="text-text-muted">
                        Site Captain: <strong className="text-text-strong">{work.mainSiteCaptainName || 'Unassigned'}</strong>
                      </span>
                      <span className="font-semibold text-primary">
                        Staffing: {work.totalFilled} / {work.totalRequired}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Works Preview */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-text-strong uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-primary" />
                <span>Upcoming Scheduled Works</span>
              </h3>
            </div>

            {upcomingWorks.length === 0 ? (
              <Card padding="md" className="text-center py-8">
                <p className="text-xs text-text-muted">No upcoming Works. Click "Add New Work" to create one.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {upcomingWorks.slice(0, 3).map((work) => (
                  <Card
                    key={work.id}
                    variant="interactive"
                    padding="md"
                    onClick={() => navigate(`/owner/works/${work.id}`)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-text-strong">{work.name}</h4>
                        <p className="text-xs text-text-muted mt-0.5">{work.workDate} at {work.reportingTime}</p>
                      </div>
                      <StatusBadge status={work.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="text-text-muted">{work.sitePlace}</span>
                      <span className="font-semibold text-primary">
                        {work.totalFilled} / {work.totalRequired} filled
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Attention & Recent Activity */}
        <div className="space-y-6">
          {/* Pending Applications Callout */}
          {pendingApps.length > 0 && (
            <Card padding="md" className="bg-purple-50/60 border border-purple-200 shadow-subtle">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-full shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-purple-900 uppercase tracking-wider">
                    {pendingApps.length} Worker Application{pendingApps.length > 1 ? 's' : ''} Pending
                  </h4>
                  <p className="text-xs text-purple-700 mt-1">
                    New workers are waiting for your approval to receive official Boy IDs.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/owner/applications')}
                    className="mt-3 bg-purple-700 hover:bg-purple-800"
                  >
                    Review Applications
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Staffing Attention */}
          <Card padding="md" className="shadow-subtle">
            <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span>Staffing Attention</span>
            </h4>

            {understaffedWorks.length === 0 ? (
              <p className="text-xs text-text-muted py-2">All active Works are currently fully staffed.</p>
            ) : (
              <div className="divide-y divide-border">
                {understaffedWorks.slice(0, 4).map((w) => (
                  <div
                    key={w.id}
                    onClick={() => navigate(`/owner/works/${w.id}/staffing`)}
                    className="py-2.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-text-strong truncate">{w.name}</p>
                      <p className="text-[11px] text-text-muted">{w.workDate}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-warning shrink-0">
                      {w.totalRequired - w.totalFilled} needed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Audit Activity */}
          <Card padding="md" className="shadow-subtle">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-text-strong uppercase tracking-wider">
                Recent Activity
              </h4>
              <button
                type="button"
                onClick={() => navigate('/owner/audit')}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Audit
              </button>
            </div>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-text-muted py-2">No activity recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.id} className="text-xs border-b border-border/60 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-text-strong">{log.actorNameSnapshot}</span>
                      <span className="text-[10px] text-text-muted">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-text-muted mt-0.5 capitalize">
                      {log.actionType.replace(/_/g, ' ')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
