import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, EyeOff, MapPin, ShieldCheck, Hand, Ban } from 'lucide-react';
import { useTranslation } from '@/lib/i18n.jsx';
import { useAuth } from '@/contexts/AuthContext';
import { getCities, getPublicEvents } from '@/lib/apiClient';
import { fmtShort } from '@/lib/guestUtils';

const HomePage = () => {
  const navigate = useNavigate();
  const { t, language, setLanguage } = useTranslation();
  const { isUserAuthenticated, isAdminAuthenticated } = useAuth();

  const [cities, setCities] = useState([]);
  const [city, setCity] = useState('');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdminAuthenticated) navigate('/host', { replace: true });
    else if (isUserAuthenticated) navigate('/tonight', { replace: true });
  }, [isUserAuthenticated, isAdminAuthenticated, navigate]);

  useEffect(() => { getCities().then(setCities).catch(() => {}); }, []);

  useEffect(() => {
    setLoading(true);
    getPublicEvents(city || undefined)
      .then((d) => setEvents(Array.isArray(d) ? d : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [city]);

  const trust = [
    [ShieldCheck, t('land.trust_1')],
    [Hand, t('land.trust_2')],
    [EyeOff, t('land.trust_3')],
    [Ban, t('land.trust_4')],
  ];

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Mucho Gusto Xo</title>
        <meta name="description" content={t('land.sub')} />
      </Helmet>

      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <span className="font-display text-xl text-primary">Mucho Gusto Xo</span>
        <div className="flex items-center gap-4 text-sm">
          <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')} className="uppercase text-muted-foreground hover:text-foreground" aria-label="Language">
            {language === 'es' ? 'EN' : 'ES'}
          </button>
          <Link to="/login" className="text-muted-foreground hover:text-foreground">{t('auth.signin')}</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-4 pb-20 pt-8 sm:px-6">
        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl space-y-6 text-center">
          <p className="mg-eyebrow">{t('land.eyebrow')}</p>
          <h1 className="text-4xl leading-tight sm:text-5xl">{t('land.title')}</h1>
          <p className="text-base text-muted-foreground sm:text-lg">{t('land.sub')}</p>
          <div className="flex flex-col justify-center gap-3 pt-2 sm:flex-row">
            <button onClick={() => navigate('/signup')} className="mg-btn !px-8 !py-3.5 text-base">
              {t('land.join')}<ArrowRight className="h-4 w-4" />
            </button>
            <button onClick={() => navigate('/login')} className="mg-btn-ghost !px-8 !py-3.5 text-base">{t('land.login')}</button>
          </div>
        </motion.section>

        <section className="space-y-5">
          <div className="space-y-3 text-center">
            <h2 className="text-2xl">{t('land.on')}</h2>
            {cities.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2" role="group" aria-label={t('land.pick_city')}>
                {[{ slug: '', name: t('land.all') }, ...cities].map((c) => (
                  <button
                    key={c.slug || 'all'}
                    onClick={() => setCity(c.slug)}
                    aria-pressed={city === c.slug}
                    className={`rounded-full border px-4 py-1.5 text-sm transition ${city === c.slug ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:text-foreground'}`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="mg-card h-32 animate-pulse" />)}</div>
          ) : events.length === 0 ? (
            <p className="mg-card mx-auto max-w-xl p-8 text-center text-sm text-muted-foreground">{t('land.none')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {events.slice(0, 6).map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => (ev.share_token ? navigate(`/e/${ev.share_token}`) : navigate('/signup'))}
                  className="mg-card mg-card-hover space-y-2 p-5 text-left"
                >
                  <p className="text-xs text-primary">{fmtShort(ev.date, language)}{ev.time ? ` · ${ev.time}` : ''}</p>
                  <h3 className="text-lg">{ev.name}</h3>
                  {(ev.location || ev.city_name) && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />{[ev.location, ev.city_name].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  <span className="inline-flex items-center gap-1 pt-1 text-xs text-primary">{t('land.view')}<ArrowRight className="h-3 w-3" /></span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="mg-card mx-auto max-w-3xl space-y-5 p-6 sm:p-8">
          <h2 className="text-2xl">{t('land.trust_title')}</h2>
          <ul className="grid gap-4 sm:grid-cols-2">
            {trust.map(([Icon, text], i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span>{text}</span>
              </li>
            ))}
          </ul>
          <button onClick={() => navigate('/signup')} className="mg-btn">{t('land.join')}<ArrowRight className="h-4 w-4" /></button>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
