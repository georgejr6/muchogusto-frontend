import React, { useEffect, useState } from 'react';
import { ExternalLink, MapPin } from 'lucide-react';
import { useTranslation } from '@/lib/i18n.jsx';
import { getAround } from '@/lib/apiClient';

const SOURCE = { eventbrite: 'Eventbrite', posh: 'Posh', instagram: 'Instagram', link: 'Web' };

const when = (e, lang) => {
  const d = new Date(e.starts_at);
  const loc = lang === 'es' ? 'es-CO' : 'en-US';
  const day = d.toLocaleDateString(loc, { weekday: 'short', month: 'short', day: 'numeric', timeZone: e.has_time ? undefined : 'UTC' });
  return e.has_time ? `${day} · ${d.toLocaleTimeString(loc, { hour: 'numeric', minute: '2-digit' })}` : day;
};

// Public listings in her city from other platforms. Every card opens the original page.
const AroundList = () => {
  const { t, language } = useTranslation();
  const [items, setItems] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => { getAround().then(setItems).catch(() => setFailed(true)); }, []);

  if (failed) return <div className="mg-card p-6 text-center text-sm text-muted-foreground">{t('ton.error')}</div>;
  if (!items) return <div className="mg-card h-48 animate-pulse" />;
  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">{t('ar.sub')}</p>
      {items.length === 0 ? (
        <div className="mg-card p-8 text-center text-sm text-muted-foreground">{t('ar.empty')}</div>
      ) : items.map((e) => (
        <a key={e.id} href={e.url} target="_blank" rel="noopener noreferrer nofollow" className="mg-card mg-card-hover flex gap-3 overflow-hidden p-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-accent">
            {e.image_url && <img src={e.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-xs text-primary">{when(e, language)}</p>
            <h3 className="line-clamp-2 text-base leading-snug">{e.title}</h3>
            {e.venue && <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="h-3 w-3 shrink-0" />{e.venue}</p>}
            <p className="flex items-center gap-1 text-[11px] text-muted-foreground">{t('ar.via')} {SOURCE[e.source] || 'Web'}<ExternalLink className="h-3 w-3" /></p>
          </div>
        </a>
      ))}
    </section>
  );
};

export default AroundList;
