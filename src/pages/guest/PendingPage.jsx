import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Navigate, useNavigate } from 'react-router-dom';
import { Hourglass } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n.jsx';
import { redeemInvite } from '@/lib/apiClient';

// Invite-only waiting room. A pending (or declined) member sees the same thing: she is on the list.
const PendingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { userProfile, refreshProfile, logoutUser } = useAuth();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const approved = userProfile?.access_status === 'approved';

  const redeem = async (c) => {
    const clean = (c || code).trim();
    if (!clean) return;
    setBusy(true);
    setError('');
    try {
      await redeemInvite(clean);
      try { localStorage.removeItem('mg_invite'); } catch { /* storage unavailable */ }
      await refreshProfile();
    } catch {
      setError(t('pend.bad'));
    } finally {
      setBusy(false);
    }
  };

  // A code saved from a join link (e.g. before Google sign-in) is redeemed automatically.
  useEffect(() => {
    let saved = null;
    try { saved = localStorage.getItem('mg_invite'); } catch { /* storage unavailable */ }
    if (saved && !approved) redeem(saved);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Check quietly every 20s so approval shows up without a refresh.
  useEffect(() => {
    if (approved) return undefined;
    const id = setInterval(() => { refreshProfile?.(); }, 20000);
    return () => clearInterval(id);
  }, [approved, refreshProfile]);

  if (approved) return <Navigate to={userProfile?.location_consent ? '/tonight' : '/welcome'} replace />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <Helmet><title>Mucho Gusto Xo</title></Helmet>
      <div className="w-full max-w-md space-y-6 text-center">
        <p className="font-display text-lg text-primary">Mucho Gusto</p>
        <Hourglass className="mx-auto h-10 w-10 text-primary" />
        <h1 className="text-3xl">{t('pend.title')}</h1>
        <p className="text-sm text-muted-foreground">{t('pend.sub')}</p>

        <div className="mg-card space-y-3 p-5 text-left">
          <p className="text-sm">{t('pend.code_title')}</p>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
            placeholder={t('inv.code_ph')}
            autoCapitalize="characters"
            className="mg-input text-center font-display tracking-widest"
          />
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <button onClick={() => redeem()} disabled={busy || !code.trim()} className="mg-btn w-full">{t('pend.code_btn')}</button>
        </div>

        <div className="flex justify-center gap-3">
          <button onClick={() => refreshProfile()} className="mg-btn-ghost !px-5 !py-2 text-sm">{t('pend.check')}</button>
          <button onClick={() => { logoutUser(); navigate('/'); }} className="text-sm text-muted-foreground hover:text-foreground">{t('pend.out')}</button>
        </div>
      </div>
    </div>
  );
};

export default PendingPage;
