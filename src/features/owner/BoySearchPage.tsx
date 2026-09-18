import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workforceService } from '../../services/workforceService';
import { UserProfile } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Search, UserCheck, ArrowRight, AlertCircle } from 'lucide-react';

export const BoySearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchId, setSearchId] = useState('');
  const [result, setResult] = useState<UserProfile | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    const found = workforceService.getUserByOfficialId(searchId.trim());
    setResult(found || null);
    setHasSearched(true);
  };

  return (
    <PageContainer maxWidth="md">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-text-strong">Exact Official ID Lookup</h2>
        <p className="text-xs sm:text-sm text-text-muted mt-1">
          Instantly verify worker credentials and access complete historical work/payment records
        </p>
      </div>

      <Card padding="lg" className="shadow-subtle mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-text-strong mb-1.5">
              Enter Official ID
            </label>
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. BOY-1001-C or CPT-101"
                value={searchId}
                onChange={(e) => {
                  setSearchId(e.target.value.toUpperCase());
                  setHasSearched(false);
                }}
                className="w-full pl-11 pr-4 py-3 bg-white border border-border rounded-control text-base font-mono font-bold text-text-strong tracking-wider focus:outline-none focus:ring-2 focus:ring-primary min-h-[48px]"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-text-muted mt-1.5">
              Enter the exact official identifier printed on the worker's badge or app profile.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            disabled={!searchId.trim()}
          >
            Search Worker Registry
          </Button>
        </form>
      </Card>

      {/* Result Card */}
      {hasSearched && (
        <div>
          {result ? (
            <Card
              variant="interactive"
              padding="md"
              onClick={() => {
                if (result.role === 'boy') navigate(`/owner/boys/${result.uid}`);
                else if (result.role === 'captain') navigate(`/owner/captains/${result.uid}`);
              }}
              className="border-l-4 border-l-primary shadow-elevated"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-full bg-teal-100 border border-teal-200 text-primary font-bold text-base flex items-center justify-center shrink-0">
                    {result.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-text-strong">{result.fullName}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mt-0.5">
                      <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.2 rounded">
                        {result.currentOfficialId}
                      </span>
                      {result.currentCategory && (
                        <span>• Category {result.currentCategory}</span>
                      )}
                      <span>• {result.exactPlace}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={result.accountStatus} size="sm" />
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            </Card>
          ) : (
            <Card padding="lg" className="text-center py-8 bg-slate-50 border border-border">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-text-strong">No User Found</h4>
              <p className="text-xs text-text-muted mt-1">
                No active or registered worker matched ID "{searchId}". Verify spelling and category suffix.
              </p>
            </Card>
          )}
        </div>
      )}
    </PageContainer>
  );
};
