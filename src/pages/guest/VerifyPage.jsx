import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useSearchParams } from 'react-router-dom';
import { Camera, ShieldCheck, Hourglass, CheckCircle2, RotateCcw } from 'lucide-react';
import GuestShell from '@/components/shell/GuestShell';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n.jsx';
import { getVerificationStatus, refreshVerification, startIdentityVerification, uploadVerificationSelfie } from '@/lib/apiClient';

const VerifyPage = () => {
  const { t } = useTranslation();
  const { refreshProfile } = useAuth();
  const [params] = useSearchParams();
  const fileRef = useRef(null);

  const [info, setInfo] = useState(null);
  const [status, setStatus] = useState('unverified');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [consent, setConsent] = useState(false);

  const load = useCallback(async () => {
    try {
      let st = await getVerificationStatus();
      // Always re-check a Stripe session that is still pending (covers ?done=1 and an abandoned/returned flow).
      if (params.get('done') || (st.verification_status === 'pending' && st.provider === 'stripe_identity')) {
        const r = await refreshVerification().catch(() => null);
        if (r?.status) st = { ...st, verification_status: r.status };
      }
      setInfo(st);
      setStatus(st.verification_status || 'unverified');
      if (st.verification_status === 'verified') refreshProfile?.();
    } catch (e) {
      setError(e.message || t('ver.err'));
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => { load(); }, [load]);

  const needConsent = () => {
    if (consent) return false;
    setError(t('ver.consent_err'));
    return true;
  };

  const startStripe = async () => {
    if (needConsent()) return;
    setBusy('start'); setError('');
    try {
      const { url } = await startIdentityVerification(true);
      window.location.href = url;
    } catch (e) {
      setError(t('ver.err'));
      setBusy('');
    }
  };

  const onSelfie = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (needConsent()) { e.target.value = ''; return; }
    setBusy('selfie'); setError(''); setNote('');
    try {
      await uploadVerificationSelfie(file, true);
      setStatus('pending');
      setNote(t('ver.sent'));
    } catch (err) {
      setError(err.message || t('ver.err'));
    } finally {
      setBusy('');
      e.target.value = '';
    }
  };

  const stripe = !!info?.modes?.stripe;
  const banner = {
    pending: { icon: Hourglass, title: t('ver.status_pending'), sub: t('ver.status_pending_sub') },
    verified: { icon: CheckCircle2, title: t('ver.status_verified'), sub: t('ver.status_verified_sub') },
  }[status];

  return (
    <GuestShell>
      <Helmet><title>{t('ver.title')} | Mucho Gusto Xo</title></Helmet>
      <div className="mg-page space-y-6">
        <div className="space-y-3 text-center">
          <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
          <h1 className="text-3xl">{t('ver.title')}</h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{t('ver.sub')}</p>
        </div>

        {loading ? (
          <div className="mg-card h-40 animate-pulse" />
        ) : (
          <div className="mg-card space-y-4 p-6">
            {banner ? (
              <div className="space-y-2 text-center">
                <banner.icon className={`mx-auto h-8 w-8 ${status === 'verified' ? 'text-[hsl(var(--mg-ok))]' : 'text-primary'}`} />
                <h2 className="text-xl">{banner.title}</h2>
                <p className="text-sm text-muted-foreground">{banner.sub}</p>
                {note && <p className="text-xs text-muted-foreground">{note}</p>}
                {status === 'pending' && info?.provider === 'stripe_identity' && stripe && (
                  <>
                    <label className="mx-auto flex max-w-sm items-start gap-3 text-left text-xs text-muted-foreground">
                      <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setError(''); }} className="mt-0.5 h-4 w-4 accent-[hsl(var(--primary))]" />
                      <span>{t('ver.consent')}</span>
                    </label>
                    <button onClick={startStripe} disabled={!!busy} className="mg-btn-ghost">{t('ver.restart')}</button>
                  </>
                )}
              </div>
            ) : (
              <>
                {status === 'rejected' ? (
                  <div className="space-y-1 text-center">
                    <RotateCcw className="mx-auto h-7 w-7 text-primary" />
                    <h2 className="text-lg">{t('ver.status_rejected')}</h2>
                    <p className="text-sm text-muted-foreground">{t('ver.status_rejected_sub')}</p>
                  </div>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">{t('ver.status_unverified')}</p>
                )}

                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setError(''); }} className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]" />
                  <span>{t('ver.consent')}</span>
                </label>

                {stripe ? (
                  <button onClick={startStripe} disabled={!!busy} className="mg-btn w-full">
                    {busy === 'start' ? t('ver.checking') : status === 'rejected' ? t('ver.retry') : t('ver.start')}
                  </button>
                ) : (
                  <>
                    <p className="text-center text-xs text-muted-foreground">{t('ver.selfie_sub')}</p>
                    <input ref={fileRef} type="file" accept="image/*" capture="user" className="hidden" onChange={onSelfie} />
                    <button onClick={() => fileRef.current?.click()} disabled={!!busy} className="mg-btn w-full">
                      <Camera className="h-4 w-4" />
                      {busy === 'selfie' ? t('ver.uploading') : status === 'rejected' ? t('ver.retry') : t('ver.selfie')}
                    </button>
                  </>
                )}
              </>
            )}
            {error && <p className="text-center text-sm text-destructive" role="alert">{error}</p>}
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground">{t('ver.privacy')}</p>
      </div>
    </GuestShell>
  );
};

export default VerifyPage;
