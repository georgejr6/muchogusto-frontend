import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarPlus, Check, Clock, MapPin, MoreHorizontal, Navigation, Shirt, Users, X } from 'lucide-react';
import GuestShell from '@/components/shell/GuestShell';
import { HostAvatar } from '@/components/InviteCard';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n.jsx';
import { blockHost, getMyInvitations, reportTarget, respondToInvitation } from '@/lib/apiClient';
import { downloadIcs, fmtDay, mapsUrl, normStatus } from '@/lib/guestUtils';

const InviteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useTranslation();

  const [inv, setInv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [confirmPass, setConfirmPass] = useState(false);
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getMyInvitations()
      .then((rows) => setInv(rows.find((r) => r.id === id) || null))
      .catch((e) => setError(e.message || t('id.err')))
      .finally(() => setLoading(false));
  }, [id]);

  const respond = async (status) => {
    setBusy(true);
    setMessage('');
    try {
      const updated = await respondToInvitation(id, status);
      const next = normStatus(updated.status);
      setInv((p) => ({ ...p, status: updated.status }));
      setConfirmPass(false);
      setMessage(
        next === 'waitlist' ? t('id.waitlisted')
          : next === 'accepted' ? t('id.going')
          : next === 'maybe' ? t('id.maybe_set')
          : t('id.passed')
      );
    } catch (e) {
      if (e.message === 'verification_required') {
        toast({ title: t('id.need_verify') });
        navigate('/verify');
      } else if (e.message === 'consent_required') {
        navigate(`/consent/${id}`);
      } else {
        toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
      }
    } finally {
      setBusy(false);
    }
  };

  const doBlock = async () => {
    setMenu(false);
    try {
      await blockHost(inv.host_id);
      toast({ title: t('id.blocked') });
      navigate('/invites');
    } catch (e) {
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    }
  };

  const sendReport = async () => {
    if (!reason.trim()) return;
    try {
      await reportTarget({ admin_id: inv.host_id, reason: reason.trim() });
      setReporting(false);
      setReason('');
      toast({ title: t('id.reported') });
    } catch (e) {
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    }
  };

  const status = inv ? normStatus(inv.status) : null;

  return (
    <GuestShell>
      <Helmet><title>{inv?.event_name || t('inv.title')} | Mucho Gusto Xo</title></Helmet>
      <div className="mg-page space-y-5">
        <div className="flex items-center justify-between">
          <Link to="/invites" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />{t('id.back')}
          </Link>
          {inv?.host_id && (
            <div className="relative">
              <button onClick={() => setMenu((m) => !m)} aria-label="More" className="rounded-full p-2 text-muted-foreground hover:bg-accent">
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {menu && (
                <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-xl border border-border bg-popover shadow-lg">
                  <button onClick={() => { setMenu(false); setReporting(true); }} className="block w-full px-4 py-3 text-left text-sm hover:bg-accent">{t('id.report')}</button>
                  <button onClick={doBlock} className="block w-full px-4 py-3 text-left text-sm text-destructive hover:bg-accent">{t('id.block')}</button>
                </div>
              )}
            </div>
          )}
        </div>

        {loading ? (
          <div className="mg-card h-80 animate-pulse" />
        ) : error || !inv ? (
          <div className="mg-card p-8 text-center text-sm text-muted-foreground">{error || t('id.not_found')}</div>
        ) : (
          <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="mg-card overflow-hidden">
            <div className="space-y-4 border-b border-border p-6">
              <div className="flex items-center gap-3">
                <HostAvatar src={inv.host_photo} name={inv.host_name} size="h-12 w-12" />
                <div className="min-w-0">
                  {inv.host_handle ? (
                    <Link to={`/h/${inv.host_handle}`} className="block truncate font-medium hover:text-primary">{inv.host_name}</Link>
                  ) : (
                    <p className="truncate font-medium">{inv.host_name || 'Mucho Gusto'}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{t('id.saved')}</p>
                </div>
              </div>
              {inv.host_note && (
                <blockquote className="font-display text-xl italic leading-snug text-primary">“{inv.host_note}”</blockquote>
              )}
            </div>

            <div className="space-y-4 p-6">
              <h1 className="text-3xl">{inv.event_name}</h1>
              <ul className="space-y-2.5 text-[15px]">
                <li className="flex items-start gap-3"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{fmtDay(inv.event_date, language)}{inv.event_time ? ` · ${inv.event_time}` : ''}</span></li>
                {inv.event_location && (
                  <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{inv.event_location}</span></li>
                )}
                {inv.dress_code && (
                  <li className="flex items-start gap-3"><Shirt className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{t('ton.dress')}: {inv.dress_code}</span></li>
                )}
                {inv.capacity && (
                  <li className="flex items-start gap-3"><Users className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{t('id.capacity')}</span></li>
                )}
              </ul>
              {inv.event_description && <p className="text-sm leading-relaxed text-muted-foreground">{inv.event_description}</p>}
            </div>

            <div className="space-y-3 border-t border-border p-5">
              {message && <p className="rounded-xl bg-accent/60 px-4 py-3 text-sm" role="status">{message}</p>}

              {confirmPass ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">{t('id.pass_confirm')}</p>
                  <div className="flex gap-2">
                    <button disabled={busy} onClick={() => respond('declined')} className="mg-btn flex-1">{t('id.pass_yes')}</button>
                    <button disabled={busy} onClick={() => setConfirmPass(false)} className="mg-btn-ghost flex-1">{t('id.cancel')}</button>
                  </div>
                </div>
              ) : status === 'pending' || status === 'maybe' || !message ? (
                <div className="space-y-2">
                  {status !== 'pending' && !message && (
                    <p className="text-xs text-muted-foreground">{t('id.change')}</p>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    <button disabled={busy} onClick={() => respond('accepted')} className="mg-btn !px-2">
                      <Check className="h-4 w-4" />{t('id.accept')}
                    </button>
                    <button disabled={busy} onClick={() => respond('maybe')} className="mg-btn-ghost !px-2">{t('id.maybe')}</button>
                    <button disabled={busy} onClick={() => setConfirmPass(true)} className="mg-btn-ghost !px-2">
                      <X className="h-4 w-4" />{t('id.pass')}
                    </button>
                  </div>
                </div>
              ) : null}

              {(status === 'accepted') && (
                <div className="flex gap-2">
                  <button onClick={() => downloadIcs(inv)} className="mg-btn-ghost flex-1 !px-3 !py-2.5"><CalendarPlus className="h-4 w-4" />{t('ton.cal')}</button>
                  <a href={mapsUrl(inv.event_location)} target="_blank" rel="noopener noreferrer" className="mg-btn-ghost flex-1 !px-3 !py-2.5"><Navigation className="h-4 w-4" />{t('ton.dir')}</a>
                </div>
              )}
            </div>
          </motion.article>
        )}

        {reporting && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4 sm:items-center" role="dialog" aria-modal="true">
            <div className="mg-card w-full max-w-md space-y-3 bg-card p-5">
              <h2 className="text-lg">{t('id.report_prompt')}</h2>
              <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} maxLength={2000} className="mg-input" />
              <div className="flex gap-2">
                <button onClick={sendReport} disabled={!reason.trim()} className="mg-btn flex-1">{t('id.report_send')}</button>
                <button onClick={() => setReporting(false)} className="mg-btn-ghost flex-1">{t('id.cancel')}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </GuestShell>
  );
};

export default InviteDetailPage;
