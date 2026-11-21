import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, MapPin, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n.jsx';
import { getCities, shareLocation } from '@/lib/apiClient';
import { getPosition } from '@/lib/guestUtils';

const TOTAL = 3;

const Dots = ({ step, t }) => (
  <div className="flex items-center justify-center gap-2" aria-label={`${t('wel.step')} ${step + 1} ${t('wel.of')} ${TOTAL}`}>
    {Array.from({ length: TOTAL }, (_, i) => (
      <span key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border'}`} />
    ))}
  </div>
);

const WelcomePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, updateProfileData, refreshProfile } = useAuth();

  const [step, setStep] = useState(0);

  // step 0: location
  const [cities, setCities] = useState([]);
  const [locBusy, setLocBusy] = useState(false);
  const [locResult, setLocResult] = useState(null); // {matched, city} | {waitlist}
  const [denied, setDenied] = useState(false);

  // step 1: photo + bio
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(userProfile?.photo_url || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { getCities().then(setCities).catch(() => {}); }, []);
  useEffect(() => () => { if (preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

  const locate = async (coords) => {
    setLocBusy(true);
    try {
      const r = await shareLocation(coords.lat, coords.lng);
      setLocResult(r.matched ? { city: r.city } : { waitlist: true });
      await refreshProfile?.();
    } catch (e) {
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    } finally {
      setLocBusy(false);
    }
  };

  const shareArea = async () => {
    setLocBusy(true);
    try {
      const pos = await getPosition();
      await locate(pos);
    } catch {
      setDenied(true);
      setLocBusy(false);
    }
  };

  const onPhoto = (e) => {
    const f = e.target.files?.[0];
    if (!f || !f.type.startsWith('image/') || f.size > 5 * 1024 * 1024) return;
    setPhotoFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updates = {};
      if (photoFile) updates._newPhotoFile = photoFile;
      if (bio.trim() && bio.trim() !== (userProfile?.bio || '')) updates.bio = bio.trim();
      if (Object.keys(updates).length) await updateProfileData(updates);
      setStep(2);
    } catch (e) {
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const content = [
    // ── Step 1: where are you
    <div key="loc" className="space-y-5">
      <div className="space-y-2 text-center">
        <MapPin className="mx-auto h-9 w-9 text-primary" />
        <h1 className="text-3xl">{t('wel.loc_title')}</h1>
        <p className="text-sm text-muted-foreground">{t('wel.loc_sub')}</p>
      </div>

      {locResult?.city && (
        <p className="mg-card p-4 text-center" role="status">{t('wel.matched')} <span className="text-primary">{locResult.city.name}</span>.</p>
      )}
      {locResult?.waitlist && <p className="mg-card p-4 text-center text-sm" role="status">{t('wel.waitlist')}</p>}

      {!locResult && (
        <>
          <p className="text-center text-xs text-muted-foreground">{t('wel.loc_consent')}</p>
          {denied && <p className="text-center text-sm text-muted-foreground">{t('wel.denied')}</p>}
          {!denied && (
            <button onClick={shareArea} disabled={locBusy} className="mg-btn w-full">
              {locBusy ? t('wel.locating') : t('wel.share')}
            </button>
          )}
          {cities.length > 0 && (
            <div className="space-y-2">
              <p className="mg-eyebrow text-center">{t('wel.pick')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {cities.map((c) => (
                  <button key={c.id} disabled={locBusy} onClick={() => locate({ lat: c.lat, lng: c.lng })} className="mg-chip !px-4 !py-2 text-sm text-foreground hover:border-primary/50">
                    {c.name}
                  </button>
                ))}
                <button disabled={locBusy} onClick={() => setLocResult({ waitlist: true })} className="mg-chip !px-4 !py-2 text-sm">{t('wel.not_listed')}</button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="flex gap-2">
        {locResult ? (
          <button onClick={() => setStep(1)} className="mg-btn flex-1">{t('wel.next')}</button>
        ) : (
          <button onClick={() => setStep(1)} className="mg-btn-ghost flex-1">{t('wel.skip')}</button>
        )}
      </div>
    </div>,

    // ── Step 2: photo + bio
    <div key="photo" className="space-y-5">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl">{t('wel.photo_title')}</h1>
        <p className="text-sm text-muted-foreground">{t('wel.photo_sub')}</p>
      </div>
      <label className="mx-auto flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-dashed border-border bg-card/60 hover:border-primary/50">
        {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : (
          <span className="flex flex-col items-center gap-1 text-xs text-muted-foreground"><Camera className="h-6 w-6" />{t('wel.add_photo')}</span>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={onPhoto} />
      </label>
      {preview && <p className="text-center text-xs text-muted-foreground">{t('wel.change_photo')}</p>}
      <label className="block space-y-1.5">
        <span className="text-sm text-muted-foreground">{t('wel.bio')}</span>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} maxLength={240} placeholder={t('wel.bio_ph')} className="mg-input" />
      </label>
      <div className="flex gap-2">
        <button onClick={() => setStep(2)} className="mg-btn-ghost flex-1">{t('wel.skip')}</button>
        <button onClick={saveProfile} disabled={saving} className="mg-btn flex-1">{saving ? t('su.saving') : t('wel.save')}</button>
      </div>
    </div>,

    // ── Step 3: verify
    <div key="verify" className="space-y-5 text-center">
      <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
      <h1 className="text-3xl">{t('wel.verify_title')}</h1>
      <p className="text-sm text-muted-foreground">{t('wel.verify_sub')}</p>
      <div className="flex flex-col gap-2">
        <button onClick={() => navigate('/verify', { replace: true })} className="mg-btn w-full">{t('wel.verify_go')}</button>
        <button onClick={() => navigate('/tonight', { replace: true })} className="mg-btn-ghost w-full">{t('wel.later')}</button>
      </div>
    </div>,
  ];

  // Google sign-ups skip the signup form, so collect the 18+ / privacy consent here.
  const [consentOk, setConsentOk] = useState(false);
  const [consentSaving, setConsentSaving] = useState(false);
  if (userProfile && !userProfile.consent_at) {
    const saveConsent = async () => {
      setConsentSaving(true);
      try { await updateProfileData({ consent: true }); await refreshProfile(); }
      catch { toast({ title: 'Could not save. Please try again.', variant: 'destructive' }); }
      setConsentSaving(false);
    };
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mg-card w-full max-w-md space-y-5 p-6">
          <h1 className="text-2xl">Welcome</h1>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={consentOk} onChange={e => setConsentOk(e.target.checked)} className="mt-1" />
            <span>I am 18 or older and accept the <a href="/privacy" target="_blank" rel="noreferrer" className="text-primary underline">Privacy Policy</a>. / Soy mayor de 18 años y autorizo el tratamiento de mis datos según la Política de Privacidad.</span>
          </label>
          <button onClick={saveConsent} disabled={!consentOk || consentSaving} className="mg-btn w-full">Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col px-4 py-8">
      <Helmet><title>Mucho Gusto Xo</title></Helmet>
      <div className="mx-auto w-full max-w-md flex-1 space-y-8">
        <p className="text-center font-display text-lg text-primary">Mucho Gusto</p>
        <Dots step={step} t={t} />
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {content[step]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default WelcomePage;
