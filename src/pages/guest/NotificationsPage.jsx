import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Bell, BellRing } from 'lucide-react';
import GuestShell from '@/components/shell/GuestShell';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n.jsx';
import { getNotifications, getVapidKey, markNotificationsRead, updateNotificationPrefs } from '@/lib/apiClient';

const urlBase64ToUint8Array = (b64) => {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
};

const timeAgo = (iso, lang) => {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  const rtf = new Intl.RelativeTimeFormat(lang === 'es' ? 'es' : 'en', { numeric: 'auto' });
  if (mins < 60) return rtf.format(-Math.max(mins, 0), 'minute');
  if (mins < 1440) return rtf.format(-Math.round(mins / 60), 'hour');
  return rtf.format(-Math.round(mins / 1440), 'day');
};

const HOURS = Array.from({ length: 24 }, (_, h) => h);
const fmtHour = (h) => `${String(h).padStart(2, '0')}:00`;

const NotificationsPage = () => {
  const { t, language, setLanguage } = useTranslation();
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pushState, setPushState] = useState('idle'); // idle | on | denied | unsupported | unavailable | busy
  const [quiet, setQuiet] = useState({ start: userProfile?.notif_quiet_start ?? 22, end: userProfile?.notif_quiet_end ?? 9 });

  useEffect(() => {
    getNotifications()
      .then((rows) => {
        setItems(rows);
        if (rows.some((r) => !r.read_at)) markNotificationsRead().catch(() => {});
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) { setPushState('unsupported'); return; }
    if (Notification.permission === 'denied') { setPushState('denied'); return; }
    navigator.serviceWorker.getRegistration('/sw.js')
      .then((reg) => reg?.pushManager.getSubscription())
      .then((sub) => {
        if (sub) {
          setPushState('on');
          // Re-register with the server (covers a cleared subscription or another member using this browser).
          updateNotificationPrefs({ push_subscription: sub.toJSON() }).catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  const enablePush = async () => {
    setPushState('busy');
    try {
      const { key } = await getVapidKey();
      if (!key) { setPushState('unavailable'); return; }
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') { setPushState('denied'); return; }
      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ||
        (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));
      await updateNotificationPrefs({ push_subscription: sub.toJSON() });
      setPushState('on');
    } catch (e) {
      setPushState('idle');
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    }
  };

  const disablePush = async () => {
    setPushState('busy');
    try {
      const reg = await navigator.serviceWorker.getRegistration('/sw.js');
      const sub = await reg?.pushManager.getSubscription();
      await sub?.unsubscribe();
      await updateNotificationPrefs({ push_subscription: null });
      setPushState('idle');
    } catch (e) {
      setPushState('on');
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    }
  };

  const savePrefs = async (patch) => {
    try {
      await updateNotificationPrefs(patch);
      toast({ title: t('not.saved') });
    } catch (e) {
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    }
  };

  const onQuiet = (k, v) => {
    const next = { ...quiet, [k]: Number(v) };
    setQuiet(next);
    savePrefs({ quiet_start: next.start, quiet_end: next.end });
  };

  const onLang = (l) => {
    setLanguage(l);
    savePrefs({ lang: l });
  };

  const pushMsg = { unsupported: t('not.unsupported'), denied: t('not.denied'), unavailable: t('not.unavailable') }[pushState];

  return (
    <GuestShell title={t('not.title')}>
      <Helmet><title>{t('not.title')} | Mucho Gusto Xo</title></Helmet>
      <div className="mg-page space-y-6">
        <section className="mg-card space-y-3 p-5">
          <div className="flex items-start gap-3">
            <BellRing className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h2 className="text-lg">{t('not.enable_title')}</h2>
              <p className="text-sm text-muted-foreground">{t('not.enable_sub')}</p>
            </div>
          </div>
          {pushState === 'on' ? (
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[hsl(var(--mg-ok))]">{t('not.enabled')}</p>
              <button onClick={disablePush} className="text-xs text-muted-foreground underline">{t('notif.turn_off')}</button>
            </div>
          ) : pushMsg ? (
            <p className="text-sm text-muted-foreground">{pushMsg}</p>
          ) : (
            <button onClick={enablePush} disabled={pushState === 'busy'} className="mg-btn w-full">{t('not.enable')}</button>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <label className="space-y-1 text-xs text-muted-foreground">
              {t('not.quiet')} · {t('not.from')}
              <select className="mg-input !py-2" value={quiet.start} onChange={(e) => onQuiet('start', e.target.value)}>
                {HOURS.map((h) => <option key={h} value={h}>{fmtHour(h)}</option>)}
              </select>
            </label>
            <label className="space-y-1 text-xs text-muted-foreground">
              {t('not.to')}
              <select className="mg-input !py-2" value={quiet.end} onChange={(e) => onQuiet('end', e.target.value)}>
                {HOURS.map((h) => <option key={h} value={h}>{fmtHour(h)}</option>)}
              </select>
            </label>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">{t('not.lang')}</span>
            <div className="flex gap-1 rounded-full border border-border p-1">
              {['es', 'en'].map((l) => (
                <button key={l} onClick={() => onLang(l)} className={`rounded-full px-3 py-1 text-xs uppercase ${language === l ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{l}</button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="mg-card h-16 animate-pulse" />)}</div>
        ) : error ? (
          <p className="text-center text-sm text-muted-foreground">{t('ton.error')}</p>
        ) : items.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-3 h-8 w-8 text-primary/60" />
            {t('not.empty')}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((n) => (
              <li key={n.id}>
                <button
                  onClick={() => n.invitation_id && navigate(`/invites/${n.invitation_id}`)}
                  className={`mg-card w-full space-y-1 p-4 text-left ${n.invitation_id ? 'mg-card-hover' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{n.title}</p>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{timeAgo(n.created_at, language)}</span>
                  </div>
                  {n.body && <p className="text-sm text-muted-foreground">{n.body}</p>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </GuestShell>
  );
};

export default NotificationsPage;
