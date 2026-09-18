import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { User, Phone, MapPin, Calendar, Heart, Shield, Edit3, Settings } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  return (
    <PageContainer maxWidth="lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-strong">User Profile</h2>
          <p className="text-xs text-text-muted mt-0.5">Verified workforce credentials and personal details</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/settings')}
            icon={<Settings className="w-4 h-4" />}
          >
            Settings
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/profile/edit')}
            icon={<Edit3 className="w-4 h-4" />}
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Identity Badge */}
        <Card padding="lg" className="lg:col-span-1 shadow-subtle flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-primary/20 flex items-center justify-center overflow-hidden mb-4 shadow-subtle">
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt={profile.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-teal-100 text-primary flex items-center justify-center text-2xl font-bold">
                {profile.fullName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <h3 className="text-base font-bold text-text-strong">{profile.fullName}</h3>
          <p className="text-xs text-text-muted mt-0.5">{profile.mobileNumber}</p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
              Role: {profile.role}
            </span>
            <StatusBadge status={profile.accountStatus} />
          </div>

          <div className="w-full mt-6 pt-5 border-t border-border space-y-3 text-left text-xs">
            <div className="flex justify-between items-center">
              <span className="text-text-muted">Official ID:</span>
              <span className="font-mono font-bold text-text-strong px-2 py-0.5 bg-slate-100 rounded border border-border">
                {profile.currentOfficialId || 'PENDING'}
              </span>
            </div>

            {profile.role === 'boy' && (
              <div className="flex justify-between items-center">
                <span className="text-text-muted">Category:</span>
                <span className="font-bold text-primary px-2.5 py-0.5 bg-teal-50 rounded-full border border-teal-200">
                  Category {profile.currentCategory || 'C'}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="text-text-muted">Member Since:</span>
              <span className="text-slate-600">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>

        {/* Right Column: Detailed Sections */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card padding="md" className="shadow-subtle">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <User className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-strong">Personal Information</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted block mb-1">Full Legal Name</span>
                <span className="font-semibold text-text-strong text-sm">{profile.fullName}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Date of Birth</span>
                <span className="font-medium text-text-strong">{profile.DOB || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Blood Group</span>
                <span className="font-bold text-danger">{profile.bloodGroup || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Mobile Phone</span>
                <span className="font-medium text-text-strong">{profile.mobileNumber}</span>
              </div>
            </div>
          </Card>

          {/* Location Details */}
          <Card padding="md" className="shadow-subtle">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <MapPin className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-strong">Location & Address</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-text-muted block mb-1">Exact Place / Town</span>
                <span className="font-medium text-text-strong">{profile.exactPlace || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Post Office</span>
                <span className="font-medium text-text-strong">{profile.postOffice || 'Not recorded'}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">District</span>
                <span className="font-medium text-text-strong">{profile.district || 'Not recorded'}</span>
              </div>
            </div>
          </Card>

          {/* Account & Approvals */}
          <Card padding="md" className="shadow-subtle">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-border">
              <Shield className="w-4 h-4 text-primary" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-text-strong">Account Authorization</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-text-muted block mb-1">Approval Status</span>
                <span className="font-semibold text-text-strong capitalize">{profile.accountStatus}</span>
              </div>
              <div>
                <span className="text-text-muted block mb-1">Approved By</span>
                <span className="font-medium text-text-strong">{profile.approvedBy || 'System Admin'}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
};
