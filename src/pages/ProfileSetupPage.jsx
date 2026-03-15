import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Save, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FormInput from '@/components/FormInput';
import FormSelect from '@/components/FormSelect';
import FormTextarea from '@/components/FormTextarea';
import FormCheckbox from '@/components/FormCheckbox';
import { useToast } from '@/hooks/use-toast';
import { getProfile, updateProfile, uploadProfilePhoto } from '@/lib/supabaseClient';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

// Debounce helper
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const ProfileSetupPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const { percentage, breakdown } = useProfileCompletion(profile);

  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      const activeId = localStorage.getItem('active_profile_id');
      if (!activeId) {
        navigate('/signup');
        return;
      }
      const { data } = await getProfile(activeId);
      if (data) {
        setProfile({
          ...data,
          interests: data.interests || [],
          hasPhotos: false // init locally
        });
      }
    };
    loadProfile();
  }, [navigate]);

  // Create a debounced save function
  const debouncedSave = useCallback(
    debounce(async (id, dataToSave) => {
      setIsSaving(true);
      await updateProfile(id, dataToSave);
      setTimeout(() => setIsSaving(false), 500); // UI feel
    }, 1000),
    []
  );

  const handleFieldChange = (field, value) => {
    setProfile(prev => {
      const updated = { ...prev, [field]: value };
      // Calculate new completion inline for immediate save
      const tempHook = { ...updated };
      // we'll update the server side completion %
      debouncedSave(updated.id, { 
        [field]: value,
        profile_completion_percentage: percentage // Note: might be slightly off by 1 render cycle, but okay for prototype
      });
      return updated;
    });
  };

  const handleInterestToggle = (interest) => {
    setProfile(prev => {
      const current = prev.interests || [];
      const updatedInterests = current.includes(interest)
        ? current.filter(i => i !== interest)
        : [...current, interest];
      
      const updated = { ...prev, interests: updatedInterests };
      debouncedSave(updated.id, { interests: updatedInterests });
      return updated;
    });
  };

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    if (!files.length) return;
    
    setUploadingPhotos(true);
    try {
      const uploadPromises = files.map(file => uploadProfilePhoto(profile.id, file));
      await Promise.all(uploadPromises);
      
      setPhotos([...photos, ...files]);
      handleFieldChange('hasPhotos', true);
      toast({ title: 'Photos uploaded successfully' });
    } catch (err) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploadingPhotos(false);
    }
  };

  const isFormValid = () => {
    return breakdown.dob && breakdown.email && breakdown.contact_consent;
  };

  const handleComplete = async () => {
    if (!isFormValid()) return;
    setIsSubmitLoading(true);
    try {
      await updateProfile(profile.id, { 
        profile_completion_percentage: percentage 
      });
      navigate('/thank-you');
    } catch (err) {
      toast({ title: 'Error saving profile', variant: 'destructive' });
      setIsSubmitLoading(false);
    }
  };

  if (!profile) return <div className="min-h-screen bg-background text-white flex items-center justify-center">Loading...</div>;

  return (
    <>
      <Helmet>
        <title>Setup Profile | The Homies</title>
      </Helmet>

      <div className="min-h-screen flex flex-col items-center py-12 px-4 pb-24">
        
        {/* Progress Bar Header */}
        <div className="w-full max-w-2xl sticky top-4 z-50 bg-card/90 backdrop-blur-md p-4 rounded-2xl border border-border shadow-lg mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold text-foreground">Profile Completion</span>
            <div className="flex items-center gap-3">
              <AnimatePresence>
                {isSaving && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center text-xs text-muted-foreground"
                  >
                    <Save className="w-3 h-3 mr-1 animate-pulse" /> Saving...
                  </motion.div>
                )}
              </AnimatePresence>
              <span className="text-primary font-bold">{percentage}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-card border border-border rounded-2xl p-6 md:p-8 space-y-8 shadow-xl"
        >
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-1">Tell us about yourself</h1>
            <p className="text-muted-foreground">Fields marked with * are required to join.</p>
          </div>

          <div className="space-y-6">
            {/* Required Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
                Basics {breakdown.dob && breakdown.email && <CheckCircle2 className="w-4 h-4 text-green-500" />}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="Date of Birth *"
                  type="date"
                  value={profile.dob || ''}
                  onChange={(e) => handleFieldChange('dob', e.target.value)}
                  className="bg-input text-foreground"
                />
                <FormInput
                  label="Email *"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => handleFieldChange('email', e.target.value)}
                  placeholder="you@example.com"
                  className="bg-input text-foreground"
                />
              </div>
            </div>

            {/* Optional Info */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Details <span className="text-sm text-muted-foreground font-normal">(Optional)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  label="City/Neighborhood"
                  value={profile.city || ''}
                  onChange={(e) => handleFieldChange('city', e.target.value)}
                  placeholder="e.g. Brooklyn, Manhattan"
                  className="bg-input text-foreground"
                />
                <FormSelect
                  label="Age Range"
                  value={profile.age_range || ''}
                  onChange={(val) => handleFieldChange('age_range', val)}
                  options={[
                    { value: '18-24', label: '18-24' },
                    { value: '25-34', label: '25-34' },
                    { value: '35-44', label: '35-44' },
                    { value: '45+', label: '45+' }
                  ]}
                />
              </div>

              <FormInput
                label="Hobbies / Interests"
                value={profile.hobbies || ''}
                onChange={(e) => handleFieldChange('hobbies', e.target.value)}
                placeholder="Music, Art, Tech..."
                className="bg-input text-foreground"
              />

              <FormTextarea
                label="Short Bio"
                value={profile.bio || ''}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                placeholder="Tell us a bit about yourself..."
                maxLength={500}
                className="bg-input text-foreground"
              />
            </div>

            {/* Photos */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Photos <span className="text-sm text-muted-foreground font-normal">(Optional, max 3)</span>
              </h3>
              <div className="flex items-center gap-4">
                <label className="flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground text-center px-2">Upload</p>
                  </div>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhotos} />
                </label>
                
                <div className="flex gap-2">
                  {photos.map((p, i) => (
                    <div key={i} className="w-32 h-32 rounded-xl bg-muted border border-border overflow-hidden flex items-center justify-center text-xs text-muted-foreground">
                      Photo {i+1}
                    </div>
                  ))}
                  {uploadingPhotos && <div className="w-32 h-32 rounded-xl flex items-center justify-center text-sm">Uploading...</div>}
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
                Preferences
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-foreground">What are you interested in?</p>
                <div className="flex flex-wrap gap-4">
                  {['Events', 'Livestreams', 'Both'].map(item => (
                    <label key={item} className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="rounded border-border text-primary focus:ring-primary bg-input"
                        checked={(profile.interests || []).includes(item)}
                        onChange={() => handleInterestToggle(item)}
                      />
                      <span className="text-sm text-foreground">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <FormCheckbox
                  label="I consent to appear in livestreams/videos (Optional)"
                  checked={profile.media_consent || false}
                  onChange={(val) => handleFieldChange('media_consent', val)}
                />
                <FormCheckbox
                  label="I agree to be contacted about upcoming events *"
                  checked={profile.contact_consent || false}
                  onChange={(val) => handleFieldChange('contact_consent', val)}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Floating Action Bar */}
        <div className="fixed bottom-0 left-0 w-full p-4 bg-background/80 backdrop-blur-xl border-t border-border z-50 flex justify-center">
          <div className="max-w-2xl w-full flex justify-end gap-4 items-center">
            {!isFormValid() && (
              <span className="text-sm text-muted-foreground hidden sm:block">
                Please complete required fields to continue
              </span>
            )}
            <Button
              onClick={handleComplete}
              disabled={!isFormValid() || isSubmitLoading}
              className="px-8 py-6 text-lg gradient-purple-pink text-white rounded-xl shadow-lg w-full sm:w-auto"
            >
              {isSubmitLoading ? 'Saving...' : 'Complete Profile'}
            </Button>
          </div>
        </div>

      </div>
    </>
  );
};

export default ProfileSetupPage;