
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import PhotoUpload from '@/components/PhotoUpload';
import FormInput from '@/components/FormInput';
import FormTextarea from '@/components/FormTextarea';
import FormSelect from '@/components/FormSelect';
import FormCheckbox from '@/components/FormCheckbox';
import UserBlurSettings from '@/components/UserBlurSettings';

function debounce(func, wait) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

const ProfileEditPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, updateProfileData } = useAuth();
  
  const [formData, setFormData] = useState({});
  const [photos, setPhotos] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const { percentage } = useProfileCompletion(formData);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        ...userProfile,
        interests: userProfile.interests || []
      });
      if (userProfile.hasPhotos) {
        setPhotos([new File([], "existing-photo.jpg", { type: "image/jpeg" })]);
      }
    }
  }, [userProfile]);

  const debouncedSave = useCallback(
    debounce((data) => {
      setIsSaving(true);
      updateProfileData(data).finally(() => setIsSaving(false));
    }, 1500),
    []
  );

  const handleFieldChange = (field, value) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      debouncedSave(next);
      return next;
    });
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => {
      const current = prev.interests || [];
      const updated = current.includes(interest)
        ? current.filter(i => i !== interest)
        : [...current, interest];
      const next = { ...prev, interests: updated };
      debouncedSave(next);
      return next;
    });
  };

  const handlePhotosChange = (newPhotos) => {
    setPhotos(newPhotos);
    handleFieldChange('hasPhotos', newPhotos.length > 0);
  };

  const handleBlurSettingsUpdate = (updates) => {
    setFormData(prev => {
      const next = { ...prev, ...updates };
      debouncedSave(next);
      return next;
    });
  };

  const handleSave = async () => {
    setIsSubmitLoading(true);
    try {
      // photos with size > 0 are newly selected files (dummy existing-photo has size 0)
      const newFile = photos.find(f => f instanceof File && f.size > 0);
      await updateProfileData({
        ...formData,
        ...(newFile ? { _newPhotoFile: newFile } : {}),
      });
      setShowSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      toast({ title: 'Failed to save profile. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  if (!userProfile) return null;

  const ageRangeOptions = [
    { value: '18-24', label: '18-24' },
    { value: '25-34', label: '25-34' },
    { value: '35-44', label: '35-44' },
    { value: '45+', label: '45+' }
  ];

  return (
    <>
      <Helmet>
        <title>Edit Your Mucho Gusto Xo Profile</title>
      </Helmet>

      <div className="min-h-screen bg-[#0f001a] pb-24">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-[rgba(15,0,26,0.85)] backdrop-blur-[12px] border-b border-[#D4AF37]/50 px-4 py-3 shadow-[0_4px_20px_rgba(212,175,55,0.1)]">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-1 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> Back
            </button>
            <div className="flex items-center gap-4">
              <AnimatePresence>
                {isSaving && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs luxury-text-accent flex items-center">
                    <Save className="w-3 h-3 mr-1 animate-pulse" /> Saving...
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="text-sm font-medium bg-[rgba(212,175,55,0.1)] px-3 py-1 rounded-full border border-[#D4AF37]/30">
                <span className="text-[#FFFDD0] mr-2">Completion:</span>
                <span className="text-[#D4AF37] font-bold">{percentage}%</span>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-8">
          <AnimatePresence>
            {showSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-[#D4AF37]/20 border border-[#D4AF37] rounded-xl p-4 mb-6 flex items-center justify-center gap-2 text-[#D4AF37] font-bold shadow-[0_0_20px_rgba(212,175,55,0.3)]"
              >
                <CheckCircle2 className="w-5 h-5" /> Profile Updated! Returning to dashboard...
              </motion.div>
            )}
          </AnimatePresence>

          <div className="luxury-card p-6 sm:p-8 space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-[#FFFDD0] mb-2 tracking-tight">Edit Profile</h1>
              <p className="luxury-text-accent text-sm">Keep your details up to date to get the best event matches.</p>
            </div>

            <div className="space-y-8">
              
              {/* Privacy Settings */}
              <div className="space-y-5">
                <UserBlurSettings user={formData} onUpdate={handleBlurSettingsUpdate} />
              </div>

              {/* Basics */}
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={formData.dob || ''}
                    onChange={e => handleFieldChange('dob', e.target.value)}
                    required
                  />
                  <FormInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email || ''}
                    onChange={e => handleFieldChange('email', e.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </div>
                <FormInput
                  label="Hobbies / Interests"
                  name="hobbies"
                  value={formData.hobbies || ''}
                  onChange={e => handleFieldChange('hobbies', e.target.value)}
                  placeholder="Music, Art, Tech..."
                  required
                />
                <FormTextarea
                  label="Short Bio"
                  name="bio"
                  value={formData.bio || ''}
                  onChange={e => handleFieldChange('bio', e.target.value)}
                  placeholder="Tell us a bit about yourself..."
                  required
                />
              </div>

              {/* Location & Demo */}
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2 flex items-center gap-2">
                  Details <span className="text-sm font-normal luxury-text-accent">(Optional)</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <FormInput
                    label="City / Neighborhood"
                    name="city"
                    value={formData.city || ''}
                    onChange={e => handleFieldChange('city', e.target.value)}
                    placeholder="Brooklyn, Manhattan"
                  />
                  <FormSelect
                    label="Age Range"
                    name="age_range"
                    value={formData.age_range || ''}
                    onChange={val => handleFieldChange('age_range', val)}
                    options={ageRangeOptions}
                  />
                </div>
              </div>

              {/* Photos */}
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2">
                  Photos <span className="text-red-400">*</span>
                </h3>
                <div className="bg-[rgba(15,0,26,0.5)] rounded-xl p-5 border border-[#D4AF37]/50 shadow-[inset_0_0_20px_rgba(212,175,55,0.05)]">
                  <PhotoUpload photos={photos} setPhotos={handlePhotosChange} error={null} />
                </div>
              </div>

              {/* Preferences */}
              <div className="space-y-5">
                <h3 className="text-xl font-semibold text-[#D4AF37] border-b border-[#D4AF37]/30 pb-2">Preferences & Consents</h3>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#FFFDD0]">What are you interested in?</label>
                  <div className="flex flex-wrap gap-4">
                    {['Events', 'Livestreams', 'Both'].map(item => (
                      <div key={item} className="flex items-center space-x-2 bg-[rgba(212,175,55,0.05)] border border-[#D4AF37]/30 px-4 py-2 rounded-lg hover:bg-[rgba(212,175,55,0.1)] transition-colors cursor-pointer">
                        <input
                          type="checkbox"
                          id={`int-${item}`}
                          checked={(formData.interests || []).includes(item)}
                          onChange={() => handleInterestToggle(item)}
                          className="w-4 h-4 rounded border-[#D4AF37] text-[#D4AF37] focus:ring-[#D4AF37] focus:ring-offset-0 bg-transparent accent-[#D4AF37] cursor-pointer"
                        />
                        <label htmlFor={`int-${item}`} className="text-sm cursor-pointer text-[#FFFDD0]">{item}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <FormCheckbox
                    name="media_consent"
                    label={<>Media Consent <span className="text-[#F1E5AC]/80 block text-xs mt-1">I consent to appear in background photos/videos. (Optional)</span></>}
                    checked={formData.media_consent || false}
                    onChange={val => handleFieldChange('media_consent', val)}
                  />
                  
                  <FormCheckbox
                    name="contact_consent"
                    label={<>Contact Consent <span className="text-[#F1E5AC]/80 block text-xs mt-1">I agree to be contacted via WhatsApp/Email about events.</span></>}
                    checked={formData.contact_consent || false}
                    onChange={val => handleFieldChange('contact_consent', val)}
                    required
                  />
                </div>
              </div>

            </div>

            <div className="pt-8 border-t border-[#D4AF37]/30 flex justify-end">
              <button 
                onClick={handleSave} 
                disabled={isSubmitLoading || !formData.contact_consent}
                className="luxury-button w-full sm:w-auto px-10 py-4 text-lg"
              >
                {isSubmitLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default ProfileEditPage;
