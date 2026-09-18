import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Camera, Save, X, Lock } from 'lucide-react';

export const EditProfilePage: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [dob, setDob] = useState(profile?.DOB || '');
  const [exactPlace, setExactPlace] = useState(profile?.exactPlace || '');
  const [postOffice, setPostOffice] = useState(profile?.postOffice || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || '');
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!profile) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrors({ fullName: 'Full Name is required' });
      return;
    }

    setIsLoading(true);
    try {
      workforceService.saveUserProfile({
        ...profile,
        fullName: fullName.trim(),
        DOB: dob,
        exactPlace: exactPlace.trim(),
        postOffice: postOffice.trim(),
        district: district.trim(),
        bloodGroup: bloodGroup.trim(),
        photoUrl,
        updatedAt: new Date().toISOString(),
      });

      refreshProfile();
      navigate('/profile');
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to update profile' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-text-strong">Edit Profile</h2>
        <p className="text-xs text-text-muted mt-0.5">Update personal details and location. Official ID & role are protected.</p>
      </div>

      <Card padding="lg" className="shadow-subtle mb-20 sm:mb-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Avatar Edit */}
          <div className="flex items-center gap-4 p-4 bg-slate-50 border border-border rounded-control">
            <div className="w-16 h-16 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
              {photoUrl ? (
                <img src={photoUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-6 h-6 text-slate-400" />
              )}
            </div>
            <div>
              <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-control text-xs font-semibold text-text-strong hover:bg-slate-50 cursor-pointer shadow-subtle">
                <Camera className="w-3.5 h-3.5 text-primary" />
                <span>Upload New Photo</span>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Locked Identity Fields notice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 bg-slate-100/70 border border-border rounded-control text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Mobile: <strong className="text-text-strong">{profile.mobileNumber}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Official ID: <strong className="text-text-strong">{profile.currentOfficialId || 'N/A'}</strong></span>
            </div>
          </div>

          {/* Editable Fields */}
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            error={errors.fullName}
            requiredIndicator
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date of Birth"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
            />

            <div>
              <label className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1.5">
                Blood Group
              </label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-control text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                <option value="">Select Blood Group</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Exact Place / Town"
              value={exactPlace}
              onChange={(e) => setExactPlace(e.target.value)}
            />
            <Input
              label="Post Office"
              value={postOffice}
              onChange={(e) => setPostOffice(e.target.value)}
            />
            <Input
              label="District"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            />
          </div>

          {errors.form && <p className="text-xs text-danger font-medium">{errors.form}</p>}

          {/* Desktop Footer Actions */}
          <div className="hidden sm:flex items-center justify-end gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              loadingText="Saving..."
              icon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>

        {/* Mobile Sticky Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-border sm:hidden z-40 pb-safe flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="md"
            fullWidth
            onClick={() => navigate('/profile')}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            variant="primary"
            size="md"
            fullWidth
            isLoading={isLoading}
            loadingText="Saving..."
            icon={<Save className="w-4 h-4" />}
          >
            Save
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
};
