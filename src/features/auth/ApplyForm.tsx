import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { workforceService } from '../../services/workforceService';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Camera, Send, AlertCircle } from 'lucide-react';

export const ApplyForm: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [dob, setDob] = useState(profile?.DOB || '');
  const [exactPlace, setExactPlace] = useState(profile?.exactPlace || '');
  const [postOffice, setPostOffice] = useState(profile?.postOffice || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup || '');
  const [photoUrl, setPhotoUrl] = useState(profile?.photoUrl || '');
  const [photoName, setPhotoName] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, photo: 'File size must be under 5MB' }));
        return;
      }
      setPhotoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoUrl(reader.result as string);
        setErrors(prev => {
          const rest = { ...prev };
          delete rest.photo;
          return rest;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Full Name is required';
    if (!dob) errs.dob = 'Date of Birth is required';
    if (!exactPlace.trim()) errs.exactPlace = 'Exact Place/Town is required';
    if (!postOffice.trim()) errs.postOffice = 'Post Office is required';
    if (!district.trim()) errs.district = 'District is required';
    if (!bloodGroup.trim()) errs.bloodGroup = 'Blood Group is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!profile) return;

    setIsLoading(true);
    try {
      workforceService.submitApplication({
        userId: profile.uid,
        fullName: fullName.trim(),
        mobileNumber: profile.mobileNumber,
        photoUrl,
        DOB: dob,
        exactPlace: exactPlace.trim(),
        postOffice: postOffice.trim(),
        district: district.trim(),
        bloodGroup: bloodGroup.trim(),
      });

      refreshProfile();
      navigate('/status', { replace: true });
    } catch (err: any) {
      setErrors({ form: err.message || 'Submission failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-background py-6 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-text-strong tracking-tight">Worker Registration</h2>
          <p className="text-sm text-text-muted mt-1">
            Complete your profile to apply as an event catering worker. Applications are reviewed and approved by management.
          </p>
        </div>

        <Card padding="lg" className="shadow-elevated mb-20 sm:mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Photo Uploader First (per PDF) */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-border rounded-control">
              <div className="relative w-20 h-20 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0">
                {photoUrl ? (
                  <img src={photoUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <label className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1">
                  Profile Photo
                </label>
                <p className="text-xs text-text-muted mb-2">
                  Clear facial photo for your official identity badge. Max 5MB.
                </p>
                <label className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-border rounded-control text-xs font-semibold text-text-strong hover:bg-slate-50 cursor-pointer shadow-subtle">
                  <Camera className="w-3.5 h-3.5 text-primary" />
                  <span>{photoName ? 'Change Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {errors.photo && <p className="text-xs text-danger mt-1">{errors.photo}</p>}
              </div>
            </div>

            {/* Read-Only Mobile Number from Authentication */}
            <div>
              <label className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1.5">
                Registered Mobile (Read-Only)
              </label>
              <input
                type="text"
                value={profile?.mobileNumber || ''}
                readOnly
                disabled
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-border rounded-control text-sm font-semibold text-slate-600 select-none cursor-not-allowed"
              />
            </div>

            {/* Personal Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Legal Name"
                placeholder="e.g. Ramesh Chandra"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                error={errors.fullName}
                requiredIndicator
              />

              <Input
                label="Date of Birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                error={errors.dob}
                requiredIndicator
              />
            </div>

            {/* Location Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="Exact Place / Town"
                placeholder="e.g. Indiranagar"
                value={exactPlace}
                onChange={(e) => setExactPlace(e.target.value)}
                error={errors.exactPlace}
                requiredIndicator
              />

              <Input
                label="Post Office"
                placeholder="e.g. HAL 2nd Stage"
                value={postOffice}
                onChange={(e) => setPostOffice(e.target.value)}
                error={errors.postOffice}
                requiredIndicator
              />

              <Input
                label="District"
                placeholder="e.g. Bengaluru Urban"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                error={errors.district}
                requiredIndicator
              />
            </div>

            {/* Blood Group */}
            <div>
              <label className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1.5">
                Blood Group <span className="text-danger">*</span>
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
              {errors.bloodGroup && <p className="mt-1 text-xs text-danger font-medium">{errors.bloodGroup}</p>}
            </div>

            {errors.form && (
              <div className="p-3 rounded-control bg-danger-light border border-danger-border flex items-center gap-2 text-xs text-danger font-medium">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            {/* Desktop Action */}
            <div className="hidden sm:flex justify-end pt-4 border-t border-border">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isLoading}
                loadingText="Submitting..."
                icon={<Send className="w-4 h-4" />}
              >
                Submit Application
              </Button>
            </div>
          </form>

          {/* Sticky Mobile Action Bar */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-border sm:hidden z-40 pb-safe">
            <Button
              type="button"
              onClick={handleSubmit}
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              loadingText="Submitting..."
              icon={<Send className="w-4 h-4" />}
            >
              Submit Application
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};
