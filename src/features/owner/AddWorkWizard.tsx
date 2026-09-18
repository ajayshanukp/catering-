import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { workforceService } from '../../services/workforceService';
import { UserProfile } from '../../types';
import { PageContainer } from '../../components/layout/PageContainer';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Save, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

export const AddWorkWizard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Details
  const [name, setName] = useState('');
  const [workDate, setWorkDate] = useState('');
  const [reportingTime, setReportingTime] = useState('');
  const [sitePlace, setSitePlace] = useState('');
  const [pax, setPax] = useState<number>(250);
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');

  // Step 2: Staffing & Captain
  const [mainSiteCaptainId, setMainSiteCaptainId] = useState('');
  const [aRequired, setARequired] = useState<number>(2);
  const [bRequired, setBRequired] = useState<number>(4);
  const [cRequired, setCRequired] = useState<number>(6);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Captains list
  const captains = workforceService.getUsers().filter(u => u.role === 'captain' && u.accountStatus === 'active');
  const selectedCaptain = captains.find(c => c.uid === mainSiteCaptainId);

  const totalRequired = Number(aRequired || 0) + Number(bRequired || 0) + Number(cRequired || 0);

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Work Name is required';
    if (!workDate) errs.workDate = 'Work Date is required';
    if (!reportingTime) errs.reportingTime = 'Reporting Time is required';
    if (!sitePlace.trim()) errs.sitePlace = 'Site/Place details are required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    if (!mainSiteCaptainId) errs.captain = 'A primary Site Captain must be selected';
    if (totalRequired <= 0) errs.staffing = 'Total required workers must be greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) setStep(1);
    else if (step === 3) setStep(2);
    else navigate('/owner/works');
  };

  const handleSave = async (confirmNow: boolean) => {
    if (!profile) return;
    setIsLoading(true);

    try {
      const created = workforceService.createWork({
        name: name.trim(),
        workDate,
        reportingTime,
        sitePlace: sitePlace.trim(),
        description: description.trim(),
        instructions: instructions.trim(),
        pax: Number(pax) || 0,
        status: confirmNow ? 'available' : 'draft',
        mainSiteCaptainId,
        mainSiteCaptainName: selectedCaptain ? selectedCaptain.fullName : 'Unassigned',
        mainSiteCaptainOfficialId: selectedCaptain ? selectedCaptain.currentOfficialId : '',
        aRequired: Number(aRequired) || 0,
        bRequired: Number(bRequired) || 0,
        cRequired: Number(cRequired) || 0,
      }, profile, confirmNow);

      navigate(`/owner/works/${created.id}`);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to create Work' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="lg">
      <div className="mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-strong mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <h2 className="text-xl font-bold text-text-strong">Add New Work</h2>
        <p className="text-xs text-text-muted mt-0.5">Schedule catering event, define category quotas, and assign Site Captain</p>
      </div>

      {/* Progress Steps Header */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {[
          { num: 1, label: '1. Event Details' },
          { num: 2, label: '2. Staffing & Captain' },
          { num: 3, label: '3. Review & Save' },
        ].map((s) => (
          <div
            key={s.num}
            className={`p-3 rounded-control border text-center transition-all ${
              step === s.num
                ? 'bg-primary text-white font-bold border-primary shadow-subtle'
                : step > s.num
                ? 'bg-teal-50 text-primary border-teal-200 font-semibold'
                : 'bg-white text-slate-400 border-border'
            }`}
          >
            <span className="text-xs">{s.label}</span>
          </div>
        ))}
      </div>

      <Card padding="lg" className="shadow-subtle mb-20 sm:mb-8">
        {/* Step 1: Details */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-text-strong uppercase tracking-wider border-b border-border pb-2">
              Event & Venue Information
            </h3>

            <Input
              label="Work Name / Title"
              placeholder="e.g. Royal Wedding Reception — Palace Grounds"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              requiredIndicator
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Work Date"
                type="date"
                value={workDate}
                onChange={(e) => setWorkDate(e.target.value)}
                error={errors.workDate}
                requiredIndicator
              />

              <Input
                label="Reporting Time"
                type="time"
                value={reportingTime}
                onChange={(e) => setReportingTime(e.target.value)}
                error={errors.reportingTime}
                requiredIndicator
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Site / Place Details"
                  placeholder="e.g. Gayatri Vihar, Gate 4, Bellary Road"
                  value={sitePlace}
                  onChange={(e) => setSitePlace(e.target.value)}
                  error={errors.sitePlace}
                  requiredIndicator
                />
              </div>

              <div>
                <Input
                  label="Guest Count (Pax)"
                  type="number"
                  min={1}
                  value={pax}
                  onChange={(e) => setPax(Number(e.target.value))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1.5">
                Event Description
              </label>
              <textarea
                rows={3}
                placeholder="Details of the function, meal style, and scope..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-control text-sm text-text-strong placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1.5">
                Staff Instructions & Dress Code
              </label>
              <textarea
                rows={3}
                placeholder="Uniform requirements (e.g. white shirt, black pants, black shoes), grooming, entry gate..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-control text-sm text-text-strong placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Step 2: Staffing & Captain */}
        {step === 2 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-text-strong uppercase tracking-wider border-b border-border pb-2">
              Site Leadership & Worker Quotas
            </h3>

            {/* Site Captain Selection */}
            <div>
              <label className="block text-xs font-semibold text-text-strong uppercase tracking-wider mb-1.5">
                Primary Site Captain <span className="text-danger">*</span>
              </label>
              <select
                value={mainSiteCaptainId}
                onChange={(e) => setMainSiteCaptainId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white border border-border rounded-control text-sm text-text-strong focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              >
                <option value="">Select active Captain...</option>
                {captains.map((c) => (
                  <option key={c.uid} value={c.uid}>
                    {c.fullName} ({c.currentOfficialId}) — {c.exactPlace}
                  </option>
                ))}
              </select>
              {errors.captain && <p className="mt-1 text-xs text-danger font-medium">{errors.captain}</p>}
            </div>

            {/* Category Requirements */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-text-strong uppercase tracking-wider">
                Category Quotas (Private to Management)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-border rounded-control text-center">
                  <span className="text-xs font-bold text-text-strong block mb-1">Category A</span>
                  <p className="text-[11px] text-text-muted mb-3">Senior experienced staff</p>
                  <input
                    type="number"
                    min={0}
                    value={aRequired}
                    onChange={(e) => setARequired(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 text-center py-2 bg-white border border-border rounded-control text-lg font-bold text-text-strong focus:outline-none focus:ring-2 focus:ring-primary mx-auto block"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-border rounded-control text-center">
                  <span className="text-xs font-bold text-text-strong block mb-1">Category B</span>
                  <p className="text-[11px] text-text-muted mb-3">Intermediate workers</p>
                  <input
                    type="number"
                    min={0}
                    value={bRequired}
                    onChange={(e) => setBRequired(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 text-center py-2 bg-white border border-border rounded-control text-lg font-bold text-text-strong focus:outline-none focus:ring-2 focus:ring-primary mx-auto block"
                  />
                </div>

                <div className="p-4 bg-slate-50 border border-border rounded-control text-center">
                  <span className="text-xs font-bold text-text-strong block mb-1">Category C</span>
                  <p className="text-[11px] text-text-muted mb-3">Standard / entry workers</p>
                  <input
                    type="number"
                    min={0}
                    value={cRequired}
                    onChange={(e) => setCRequired(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-24 text-center py-2 bg-white border border-border rounded-control text-lg font-bold text-text-strong focus:outline-none focus:ring-2 focus:ring-primary mx-auto block"
                  />
                </div>
              </div>

              {errors.staffing && <p className="text-xs text-danger font-medium">{errors.staffing}</p>}

              {/* Total Summary */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-control flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-teal-900 uppercase tracking-wider block">
                    Total Required Workers
                  </span>
                  <span className="text-xs text-teal-700">Calculated automatically as A + B + C</span>
                </div>
                <div className="text-2xl font-black text-primary">
                  {totalRequired}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-text-strong uppercase tracking-wider border-b border-border pb-2">
              Review Work Specification
            </h3>

            <div className="bg-slate-50 border border-border rounded-control p-5 space-y-4 text-xs">
              <div>
                <span className="text-text-muted block text-[11px] uppercase tracking-wider">Event Name</span>
                <span className="text-base font-bold text-text-strong">{name}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-text-muted block text-[11px]">Work Date</span>
                  <span className="font-semibold text-text-strong">{workDate}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Reporting Time</span>
                  <span className="font-semibold text-text-strong">{reportingTime}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Guest Pax</span>
                  <span className="font-semibold text-text-strong">{pax}</span>
                </div>
                <div>
                  <span className="text-text-muted block text-[11px]">Site Captain</span>
                  <span className="font-semibold text-primary">{selectedCaptain?.fullName}</span>
                </div>
              </div>

              <div>
                <span className="text-text-muted block text-[11px]">Site / Place</span>
                <span className="font-medium text-text-strong">{sitePlace}</span>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between">
                <span className="text-text-muted">Required Staffing Breakdown:</span>
                <span className="font-bold text-text-strong">
                  Cat A: {aRequired} | Cat B: {bRequired} | Cat C: {cRequired} (Total: {totalRequired})
                </span>
              </div>
            </div>

            {errors.form && (
              <div className="p-3 bg-danger-light border border-danger-border rounded-control flex items-center gap-2 text-xs text-danger">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-control text-xs text-blue-800 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Save Draft:</strong> Saves the Work privately for management. Not visible to workers.
                <br />
                <strong>Save & Confirm:</strong> Immediately publishes this Work to "Available Works" for active Boys to claim.
              </span>
            </div>
          </div>
        )}

        {/* Action Button Bar */}
        <div className="hidden sm:flex items-center justify-between pt-6 mt-6 border-t border-border">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleBack}
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Continue
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                isLoading={isLoading}
                onClick={() => handleSave(false)}
                icon={<Save className="w-4 h-4" />}
              >
                Save Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="md"
                isLoading={isLoading}
                onClick={() => handleSave(true)}
                icon={<Check className="w-4 h-4" />}
              >
                Save & Confirm Work
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Sticky Bar */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-border sm:hidden z-40 pb-safe flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleBack}
            className="w-1/3"
          >
            {step === 1 ? 'Cancel' : 'Back'}
          </Button>

          {step < 3 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleNext}
              className="w-2/3"
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Next Step
            </Button>
          ) : (
            <div className="flex w-2/3 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={isLoading}
                onClick={() => handleSave(false)}
                className="w-1/2 text-xs"
              >
                Draft
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                isLoading={isLoading}
                onClick={() => handleSave(true)}
                className="w-1/2 text-xs"
              >
                Confirm
              </Button>
            </div>
          )}
        </div>
      </Card>
    </PageContainer>
  );
};
