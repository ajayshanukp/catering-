import React, { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { workforceService } from '../../../services/workforceService';
import { Work, WorkMember, WorkAttendance, AttendanceStatus } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { Check, Clock, UserCheck, AlertCircle } from 'lucide-react';

interface WorkAttendanceTabProps {
  work: Work;
}

export const WorkAttendanceTab: React.FC<WorkAttendanceTabProps> = ({ work }) => {
  const { profile } = useAuth();
  const [members, setMembers] = useState<WorkMember[]>([]);
  const [attendance, setAttendance] = useState<WorkAttendance[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadData = () => {
    const mems = workforceService.getWorkMembers(work.id).filter(m => m.membershipStatus === 'active');
    const atts = workforceService.getWorkAttendance(work.id);
    setMembers(mems);
    setAttendance(atts);
  };

  useEffect(() => {
    loadData();
    const unsub = workforceService.subscribe(loadData);
    return unsub;
  }, [work.id]);

  const handleToggleAttendance = (boyId: string, currentStatus: AttendanceStatus) => {
    if (!profile) return;
    const nextStatus: AttendanceStatus = currentStatus === 'present' ? 'unmarked' : 'present';
    setUpdatingId(boyId);
    try {
      workforceService.setAttendance(work.id, boyId, nextStatus, profile);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const presentCount = attendance.filter(a => a.status === 'present').length;
  const totalAssigned = members.length;

  return (
    <div className="space-y-6">
      {/* Attendance Summary Header */}
      <Card padding="md" className="bg-teal-50/60 border border-teal-200 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-teal-950 uppercase tracking-wider flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-primary" />
            <span>Attendance Roster</span>
          </h3>
          <p className="text-xs text-teal-800 mt-0.5">
            Mark workers Present upon arrival at the venue. Boys cannot mark their own attendance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] font-semibold text-teal-800 uppercase block">Present Staff</span>
            <span className="text-2xl font-black text-primary">
              {presentCount} / {totalAssigned}
            </span>
          </div>
        </div>
      </Card>

      {/* Workers Roster */}
      {members.length === 0 ? (
        <Card padding="lg" className="text-center py-10">
          <p className="text-sm text-text-muted">No staff members have been assigned to this Work yet.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {members.map((m) => {
            const att = attendance.find(a => a.boyId === m.userId);
            const status: AttendanceStatus = att?.status || 'unmarked';
            const isPresent = status === 'present';
            const isUpdating = updatingId === m.userId;

            return (
              <Card
                key={m.id}
                padding="sm"
                className={`flex items-center justify-between gap-3 transition-all ${
                  isPresent ? 'border-success-border bg-emerald-50/20' : 'bg-surface'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                    isPresent ? 'bg-emerald-100 text-success' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {m.snapshotName.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-text-strong truncate">{m.snapshotName}</h4>
                      <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-slate-100 text-slate-600">
                        {m.snapshotBoyId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-text-muted mt-0.5">
                      <span>Category {m.snapshotCategory}</span>
                      {att?.markedAt && (
                        <span>• Marked {new Date(att.markedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant={isPresent ? 'primary' : 'outline'}
                  size="sm"
                  isLoading={isUpdating}
                  onClick={() => handleToggleAttendance(m.userId, status)}
                  className={`min-w-[100px] text-xs font-bold ${
                    isPresent ? 'bg-success hover:bg-emerald-700' : ''
                  }`}
                  icon={isPresent ? <Check className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                >
                  {isPresent ? 'Present' : 'Mark Present'}
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
