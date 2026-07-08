
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, LogIn, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/i18n.jsx';
import { useAuth } from '@/contexts/AuthContext';
import { getPublicEvents } from '@/lib/apiClient';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isUserAuthenticated, isAdminAuthenticated } = useAuth();

  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Logged-in visitors don't need the marketing landing — send them to their space.
  useEffect(() => {
    if (isAdminAuthenticated) navigate('/admin-dashboard', { replace: true });
    else if (isUserAuthenticated) navigate('/dashboard', { replace: true });
  }, [isUserAuthenticated, isAdminAuthenticated, navigate]);

  useEffect(() => {
    getPublicEvents()
      .then(data => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoadingEvents(false));
  }, []);

  const benefits = [t('home.get_1'), t('home.get_2'), t('home.get_3'), t('home.get_4')];

  return (
    <>
      <Helmet>
        <title>Mucho Gusto Xo — Medellín Nightlife Community</title>
        <meta name="description" content={t('home.tagline')} />
      </Helmet>

      <div className="min-h-screen flex flex-col relative z-10">
        <Header />

        <main className="flex-1 flex flex-col items-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-5xl space-y-12">

            {/* Hero */}
            <section className="text-center space-y-6 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D4AF37] border border-[#D4AF37]/40 rounded-full px-3 py-1">
                <MapPin className="w-3.5 h-3.5" /> {t('home.badge')}
              </span>
              <div className="inline-flex items-center justify-center gap-3 w-full">
                <Sparkles className="w-9 h-9 text-[#D4AF37]" />
                <h1 className="text-4xl sm:text-5xl font-bold text-[#FFFDD0] tracking-tight">Mucho Gusto Xo</h1>
              </div>
              <p className="text-lg sm:text-xl luxury-text-accent leading-relaxed">{t('home.tagline')}</p>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/signup')}
                  className="luxury-button py-4 px-8 text-lg flex items-center justify-center gap-2 group"
                >
                  {t('home.cta_join')}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="luxury-button-outline py-4 px-8 text-lg flex items-center justify-center gap-2"
                >
                  <LogIn className="w-5 h-5" />
                  {t('home.cta_login')}
                </button>
              </div>
              <p className="text-xs text-[#F1E5AC]/60">{t('home.access_note')}</p>
            </section>

            {/* What's on in Medellín — public events preview */}
            <section className="space-y-5">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-[#FFFDD0] flex items-center justify-center gap-2">
                  <Calendar className="w-6 h-6 text-[#D4AF37]" /> {t('home.whats_on')}
                </h2>
                <p className="text-sm luxury-text-accent">{t('home.whats_on_sub')}</p>
              </div>

              {loadingEvents ? (
                <div className="text-center py-10 luxury-text-accent">{t('home.loading')}</div>
              ) : events.length === 0 ? (
                <div className="luxury-card border-dashed p-10 text-center max-w-xl mx-auto">
                  <Calendar className="w-10 h-10 mx-auto mb-3 text-[#D4AF37]/40" />
                  <p className="luxury-text-accent">{t('home.no_events')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.slice(0, 6).map(ev => (
                    <button
                      key={ev.id}
                      onClick={() => ev.share_token ? navigate(`/e/${ev.share_token}`) : navigate('/signup')}
                      className="luxury-card p-5 text-left space-y-2 hover:border-[#D4AF37]/60 transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-[#FFFDD0] group-hover:text-[#D4AF37] transition-colors">{ev.name}</h3>
                        {ev.date && (
                          <span className="text-xs text-[#D4AF37]/70 whitespace-nowrap">
                            {new Date(ev.date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {ev.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" /> {ev.location}
                        </p>
                      )}
                      {ev.description && (
                        <p className="text-sm text-[#FFFDD0]/70 line-clamp-2">{ev.description}</p>
                      )}
                      <span className="text-xs text-[#D4AF37] inline-flex items-center gap-1 pt-1">
                        {t('home.view_event')} <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* What you sign up for */}
            <section className="luxury-card p-6 sm:p-8 max-w-3xl mx-auto space-y-5">
              <h2 className="text-xl sm:text-2xl font-bold text-[#FFFDD0]">{t('home.get_title')}</h2>
              <ul className="space-y-3">
                {benefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-[#FFFDD0]/90">
                    <CheckCircle2 className="w-5 h-5 text-[#D4AF37] flex-shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/signup')}
                className="luxury-button py-3.5 px-8 text-base flex items-center justify-center gap-2 group w-full sm:w-auto"
              >
                {t('home.cta_join')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </section>

          </div>
        </main>
      </div>
    </>
  );
};

export default HomePage;
