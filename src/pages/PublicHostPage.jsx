import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { HostAvatar } from '@/components/InviteCard';
import { useTranslation } from '@/lib/i18n.jsx';
import { getPublicHost } from '@/lib/apiClient';
import { fmtDay } from '@/lib/guestUtils';

const PublicHostPage = () => {
  const { handle } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    getPublicHost(handle)
      .then(setData)
      .catch(() => setError(t('ph.not_found')))
      .finally(() => setLoading(false));
  }, [handle]);

  const host = data?.host;
  const name = host?.display_name || host?.name;

  return (
    <div className="min-h-screen">
      <Helmet><title>{name ? `${name} | Mucho Gusto Xo` : 'Mucho Gusto Xo'}</title></Helmet>
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
          <Link to="/" className="font-display text-lg text-primary">Mucho Gusto</Link>
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground">{t('auth.signin')}</Link>
        </div>
      </header>

      <main className="mg-page space-y-8">
        {loading ? (
          <div className="mg-card h-40 animate-pulse" aria-label={t('ph.loading')} />
        ) : error || !host ? (
          <p className="py-16 text-center text-sm text-muted-foreground">{error || t('ph.not_found')}</p>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 text-center">
              <HostAvatar src={host.photo_url} name={name} size="h-24 w-24" />
              <div>
                <p className="mg-eyebrow">{t('ph.hosted_by')}</p>
                <h1 className="text-3xl">{name}</h1>
              </div>
              {host.tagline && <p className="max-w-sm font-display text-lg italic text-primary/90">{host.tagline}</p>}
            </div>

            <section className="space-y-3">
              <p className="mg-eyebrow">{t('ph.upcoming')}</p>
              {data.events.length === 0 ? (
                <p className="mg-card p-6 text-center text-sm text-muted-foreground">{t('ph.none')}</p>
              ) : (
                data.events.map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => ev.share_token && navigate(`/e/${ev.share_token}`)}
                    className="mg-card mg-card-hover block w-full space-y-1 p-5 text-left"
                  >
                    <h2 className="text-xl">{ev.name}</h2>
                    <p className="text-sm text-primary">{fmtDay(ev.date, language)}{ev.time ? ` · ${ev.time}` : ''}</p>
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />{[ev.location, ev.city_name].filter(Boolean).join(' · ')}
                    </p>
                  </button>
                ))
              )}
            </section>

            <button onClick={() => navigate('/signup')} className="mg-btn w-full">
              {t('ph.join')}<ArrowRight className="h-4 w-4" />
            </button>
          </>
        )}
      </main>
    </div>
  );
};

export default PublicHostPage;
