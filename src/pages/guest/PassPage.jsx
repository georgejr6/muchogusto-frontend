import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck } from 'lucide-react';
import GuestShell from '@/components/shell/GuestShell';
import { useTranslation } from '@/lib/i18n.jsx';
import { getPass } from '@/lib/apiClient';

// Personal door pass. The QR holds a short-lived signed token, so a screenshot goes stale in minutes.
const PassPage = () => {
  const { t } = useTranslation();
  const [pass, setPass] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try { setPass(await getPass()); setError(''); }
    catch { setError(t('pass.err')); }
  }, [t]);

  useEffect(() => {
    load();
    const id = setInterval(load, 150000); // token lives 180s; refresh before it lapses
    const onVis = () => { if (document.visibilityState === 'visible') load(); };
    document.addEventListener('visibilitychange', onVis);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVis); };
  }, [load]);

  return (
    <GuestShell title={t('pass.title')}>
      <Helmet><title>{t('pass.title')} | Mucho Gusto Xo</title></Helmet>
      <div className="mx-auto max-w-sm px-4 pb-28 pt-8 text-center">
        <div className="mg-card space-y-5 p-6">
          {error ? (
            <div className="space-y-3 py-8">
              <p role="alert" className="text-sm text-destructive">{error}</p>
              <button onClick={load} className="mg-btn-ghost">OK</button>
            </div>
          ) : !pass ? (
            <div className="mx-auto h-56 w-56 animate-pulse rounded-2xl bg-accent" />
          ) : (
            <>
              <div className="mx-auto h-20 w-20 overflow-hidden rounded-full bg-accent">
                {pass.photo_url && <img src={pass.photo_url} alt="" className="h-full w-full object-cover" />}
              </div>
              <div>
                <h1 className="text-2xl">{pass.name || 'Guest'}</h1>
                {pass.verified && (
                  <span className="mg-chip mt-2"><ShieldCheck className="h-3 w-3" />{t('pass.verified')}</span>
                )}
              </div>
              <div className="mx-auto w-fit rounded-2xl bg-white p-4">
                <QRCodeSVG value={pass.qr} size={208} level="M" />
              </div>
              <div>
                <p className="mg-eyebrow">{t('pass.code')}</p>
                <p className="font-display text-xl tracking-widest">{pass.member_code}</p>
              </div>
            </>
          )}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">{t('pass.sub')}</p>
      </div>
    </GuestShell>
  );
};

export default PassPage;
