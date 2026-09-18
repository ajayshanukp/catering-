import React, { useState, useEffect } from 'react';
import { workforceService } from '../../../services/workforceService';
import { Work, AuditLog } from '../../../types';
import { Card } from '../../../components/ui/Card';
import { Clock, ShieldCheck, User } from 'lucide-react';

interface WorkHistoryTabProps {
  work: Work;
}

export const WorkHistoryTab: React.FC<WorkHistoryTabProps> = ({ work }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const all = workforceService.getAuditLogs().filter(l => l.workId === work.id);
    setLogs(all);
  }, [work.id]);

  const filteredLogs = logs.filter(l => {
    if (filter === 'all') return true;
    return l.actionType.toLowerCase().includes(filter.toLowerCase());
  });

  return (
    <div className="space-y-4">
      {/* Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {['all', 'work', 'boy', 'captain', 'attendance', 'wage', 'biller', 'payment'].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-control text-xs font-semibold capitalize whitespace-nowrap transition-all ${
              filter === f
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white hover:bg-slate-100 text-text-muted border border-border'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {filteredLogs.length === 0 ? (
        <Card padding="lg" className="text-center py-8">
          <p className="text-xs text-text-muted">No audit events match this filter.</p>
        </Card>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-white" />

              <Card padding="sm" className="shadow-subtle">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <span className="font-bold text-xs text-text-strong uppercase tracking-wider">
                      {log.actionType.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xs text-slate-600 mt-0.5">
                      By <strong className="text-text-strong">{log.actorNameSnapshot}</strong> ({log.actorOfficialIdSnapshot})
                    </p>
                  </div>
                  <span className="text-[10px] text-text-muted shrink-0 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.createdAt).toLocaleString()}
                  </span>
                </div>

                {(log.newValue || log.oldValue) && (
                  <div className="mt-2 pt-2 border-t border-border text-[11px] font-mono bg-slate-50 p-2 rounded text-slate-700 overflow-x-auto">
                    {log.newValue && <div>New: {JSON.stringify(log.newValue)}</div>}
                    {log.oldValue && <div className="text-slate-500">Old: {JSON.stringify(log.oldValue)}</div>}
                  </div>
                )}
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
