import React, { useState, useEffect } from 'react';
import { workforceService } from '../../services/workforceService';
import { AuditLog } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Shield, Clock, Search, ChevronDown, ChevronUp } from 'lucide-react';

export const AuditLogExplorer: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterAction, setFilterAction] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  useEffect(() => {
    setLogs(workforceService.getAuditLogs());
  }, []);

  const filteredLogs = logs.filter(l => {
    if (filterAction !== 'all' && !l.actionType.toLowerCase().includes(filterAction.toLowerCase())) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchActor = l.actorNameSnapshot.toLowerCase().includes(q);
      const matchAction = l.actionType.toLowerCase().includes(q);
      if (!matchActor && !matchAction) return false;
    }
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedLogId(expandedLogId === id ? null : id);
  };

  return (
    <PageContainer maxWidth="2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">System Audit Logs</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Immutable, append-only ledger of all operational actions and state mutations
          </p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search audit trail by actor or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-border rounded-control text-xs sm:text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[42px]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 rounded-control border border-border">
          {['all', 'application', 'work', 'boy', 'attendance', 'wage', 'payment'].map((act) => (
            <button
              key={act}
              type="button"
              onClick={() => setFilterAction(act)}
              className={`px-3 py-1 rounded-control text-xs font-semibold capitalize whitespace-nowrap transition-all ${
                filterAction === act
                  ? 'bg-white text-text-strong shadow-xs'
                  : 'text-text-muted hover:text-text-strong'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Entries */}
      <div className="space-y-3">
        {filteredLogs.map((log) => {
          const isExpanded = expandedLogId === log.id;
          return (
            <Card key={log.id} padding="sm" className="shadow-subtle">
              <div
                onClick={() => toggleExpand(log.id)}
                className="flex items-start justify-between gap-3 cursor-pointer select-none"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-text-strong uppercase tracking-wider">
                      {log.actionType.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono text-[10px] text-slate-400">ID: {log.id.slice(0, 14)}</span>
                  </div>

                  <p className="text-xs text-slate-600 mt-0.5">
                    Actor: <strong className="text-text-strong">{log.actorNameSnapshot}</strong> ({log.actorOfficialIdSnapshot})
                    {log.workId && <span className="ml-2 text-primary font-mono text-[11px]">• Work: {log.workId}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-text-muted shrink-0">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{new Date(log.createdAt).toLocaleString()}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </div>
              </div>

              {isExpanded && (log.oldValue || log.newValue || log.metadata) && (
                <div className="mt-3 pt-3 border-t border-border space-y-2 text-xs font-mono bg-slate-50 p-3 rounded-control text-slate-700">
                  {log.newValue && (
                    <div>
                      <strong className="text-emerald-700 block mb-0.5 font-bold uppercase text-[10px]">New State:</strong>
                      <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.newValue, null, 2)}</pre>
                    </div>
                  )}
                  {log.oldValue && (
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <strong className="text-slate-500 block mb-0.5 font-bold uppercase text-[10px]">Previous State:</strong>
                      <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap">{JSON.stringify(log.oldValue, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
};
