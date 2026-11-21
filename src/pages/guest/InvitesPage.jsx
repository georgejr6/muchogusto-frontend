import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import GuestShell from '@/components/shell/GuestShell';
import InviteCard from '@/components/InviteCard';
import { useTranslation } from '@/lib/i18n.jsx';
import useMyInvitations from '@/hooks/useMyInvitations';
import { eventStart, isPast, normStatus } from '@/lib/guestUtils';

const TABS = ['new', 'going', 'maybe', 'past'];

const InvitesPage = () => {
  const { t } = useTranslation();
  const { invites, loading, error, reload } = useMyInvitations();
  const [tab, setTab] = useState('new');

  const groups = useMemo(() => {
    const sorted = [...invites].sort((a, b) => (eventStart(a) || 0) - (eventStart(b) || 0));
    const g = { new: [], going: [], maybe: [], past: [] };
    sorted.forEach((i) => {
      const s = normStatus(i.status);
      if (isPast(i) || s === 'declined') g.past.push(i);
      else if (s === 'pending') g.new.push(i);
      else if (s === 'accepted' || s === 'waitlist') g.going.push(i);
      else if (s === 'maybe') g.maybe.push(i);
    });
    g.past.reverse();
    return g;
  }, [invites]);

  const list = groups[tab];

  return (
    <GuestShell title={t('inv.title')}>
      <Helmet><title>{t('inv.title')} | Mucho Gusto Xo</title></Helmet>
      <div className="mg-page space-y-5">
        <div role="tablist" className="flex gap-1 rounded-full border border-border bg-card/60 p-1">
          {TABS.map((k) => (
            <button
              key={k}
              role="tab"
              aria-selected={tab === k}
              onClick={() => setTab(k)}
              className={`flex-1 rounded-full px-2 py-2 text-xs font-medium transition ${tab === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              {t(`inv.tab_${k}`)}
              {groups[k].length > 0 && <span className="ml-1 opacity-70">{groups[k].length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="mg-card h-20 animate-pulse" />)}</div>
        ) : error ? (
          <div className="mg-card space-y-3 p-6 text-center">
            <p className="text-sm text-muted-foreground">{t('ton.error')}</p>
            <button onClick={reload} className="mg-btn-ghost">{t('ton.retry')}</button>
          </div>
        ) : list.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">{t('inv.empty')}</p>
        ) : (
          <div className="space-y-3">{list.map((inv) => <InviteCard key={inv.id} inv={inv} />)}</div>
        )}
      </div>
    </GuestShell>
  );
};

export default InvitesPage;
