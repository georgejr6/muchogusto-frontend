import React, { useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarPlus, Navigation, MapPin, Shirt, ShieldCheck, Moon } from 'lucide-react';
import GuestShell from '@/components/shell/GuestShell';
import InviteCard, { HostAvatar } from '@/components/InviteCard';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n.jsx';
import useMyInvitations from '@/hooks/useMyInvitations';
import { getCities } from '@/lib/apiClient';
import { downloadIcs, eventStart, fmtDay, isPast, mapsUrl, normStatus } from '@/lib/guestUtils';

const TonightPage = () => {
  const { t, language } = useTranslation();
  const { userProfile } = useAuth();
  const { invites, loading, error, reload } = useMyInvitations();
  const [cityName, setCityName] = useState('');
  const navigate = useNavigate();

  // First visit without a shared location -> onboarding (once per session so "skip" sticks).
  useEffect(() => {
    if (!userProfile || userProfile.location_consent) return;
    try {
      if (sessionStorage.getItem('mg_onboarded')) return;
      sessionStorage.setItem('mg_onboarded', '1');
    } catch { /* storage unavailable */ }
    navigate('/welcome', { replace: true });
  }, [userProfile]);

  useEffect(() => {
    if (!userProfile?.city_id) return;
    getCities().then((cs) => setCityName(cs.find((c) => c.id === userProfile.city_id)?.name || '')).catch(() => {});
  }, [userProfile?.city_id]);

  const { next, fresh } = useMemo(() => {
    const upcoming = invites
      .filter((i) => normStatus(i.status) === 'accepted' && !isPast(i))
      .sort((a, b) => (eventStart(a) || 0) - (eventStart(b) || 0));
    const pending = invites.filter((i) => normStatus(i.status) === 'pending' && !isPast(i));
    return { next: upcoming[0], fresh: pending };
  }, [invites]);

  const firstName = (userProfile?.name || '').trim().split(' ')[0];
  const verified = userProfile?.verification_status === 'verified';

  return (
    <GuestShell>
      <Helmet><title>Mucho Gusto Xo</title></Helmet>
      <div className="mg-page space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl">{t('ton.hello')}{firstName ? `, ${firstName}` : ''}.</h1>
          {cityName && <span className="mg-chip"><MapPin className="h-3 w-3" />{cityName}</span>}
        </div>

        {!verified && userProfile && (
          <Link to="/verify" className="mg-card mg-card-hover flex items-center gap-3 p-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
            <span className="flex-1 text-sm">{t('ton.verify_banner')}</span>
            <span className="text-sm font-medium text-primary">{t('ton.verify_cta')}</span>
          </Link>
        )}

        {loading ? (
          <div className="mg-card h-48 animate-pulse" aria-label={t('ton.loading')} />
        ) : error ? (
          <div className="mg-card space-y-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">{t('ton.error')}</p>
            <button onClick={reload} className="mg-btn-ghost">{t('ton.retry')}</button>
          </div>
        ) : (
          <>
            {next ? (
              <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                <p className="mg-eyebrow">{t('ton.next')}</p>
                <div className="mg-card overflow-hidden">
                  <Link to={`/invites/${next.id}`} className="block space-y-3 p-5">
                    <h2 className="text-2xl">{next.event_name}</h2>
                    <p className="text-primary">
                      {fmtDay(next.event_date, language)}{next.event_time ? ` · ${next.event_time}` : ''}
                    </p>
                    <div className="space-y-1.5 text-sm text-muted-foreground">
                      {next.event_location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4" />{next.event_location}</p>}
                      {next.dress_code && <p className="flex items-center gap-2"><Shirt className="h-4 w-4" />{t('ton.dress')}: {next.dress_code}</p>}
                    </div>
                    {next.host_name && (
                      <div className="flex items-center gap-2 pt-1 text-sm text-muted-foreground">
                        <HostAvatar src={next.host_photo} name={next.host_name} size="h-7 w-7" />
                        {t('ton.hosted')} {next.host_name}
                      </div>
                    )}
                  </Link>
                  <div className="flex gap-2 border-t border-border p-3">
                    <button onClick={() => downloadIcs(next)} className="mg-btn-ghost flex-1 !px-3 !py-2.5">
                      <CalendarPlus className="h-4 w-4" />{t('ton.cal')}
                    </button>
                    <a href={mapsUrl(next.event_location)} target="_blank" rel="noopener noreferrer" className="mg-btn-ghost flex-1 !px-3 !py-2.5">
                      <Navigation className="h-4 w-4" />{t('ton.dir')}
                    </a>
                  </div>
                </div>
              </motion.section>
            ) : fresh.length === 0 ? (
              <div className="mg-card space-y-2 p-8 text-center">
                <Moon className="mx-auto h-8 w-8 text-primary/70" />
                <h2 className="text-xl">{t('ton.empty_title')}</h2>
                <p className="text-sm text-muted-foreground">{t('ton.empty_sub')}</p>
              </div>
            ) : null}

            {fresh.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="mg-eyebrow">{t('ton.new')}</p>
                  <Link to="/invites" className="text-xs text-muted-foreground hover:text-foreground">{t('ton.see_all')}</Link>
                </div>
                <div className="space-y-3">
                  {fresh.slice(0, 3).map((inv, i) => (
                    <motion.div key={inv.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <InviteCard inv={inv} />
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </GuestShell>
  );
};

export default TonightPage;
