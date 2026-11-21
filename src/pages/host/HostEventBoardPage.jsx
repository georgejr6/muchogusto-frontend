import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BellRing, Check, ScanLine, UserPlus } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { useToast } from '@/hooks/use-toast';
import { getEventBoard, hostCheckin, nudgeInvitation } from '@/lib/apiClient';

const Avatar = ({ person }) => (
  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-accent">
    {person.photo_url ? (
      <img src={person.photo_url} alt="" className="h-full w-full object-cover" />
    ) : (
      <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">{(person.name || '?')[0]}</div>
    )}
  </div>
);

const Section = ({ title, count, empty, children }) => (
  <section className="mg-card p-4">
    <h2 className="mb-3 flex items-center justify-between text-lg">
      {title}
      <span className="mg-chip">{count}</span>
    </h2>
    {count === 0 ? <p className="text-sm text-muted-foreground">{empty}</p> : <ul className="space-y-3">{children}</ul>}
  </section>
);

const HostEventBoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nudged, setNudged] = useState({});

  const load = useCallback(async () => {
    setError('');
    try {
      setBoard(await getEventBoard(id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { setLoading(true); load(); }, [load]);

  const nudge = async (invitationId) => {
    try {
      await nudgeInvitation(invitationId);
      setNudged((n) => ({ ...n, [invitationId]: true }));
      toast({ title: 'Reminder sent' });
    } catch (e) {
      if (/already/i.test(e.message)) {
        setNudged((n) => ({ ...n, [invitationId]: true }));
        toast({ title: 'Already reminded' });
      } else {
        toast({ title: 'Could not send', description: e.message, variant: 'destructive' });
      }
    }
  };

  const tick = async (invitationId) => {
    try {
      await hostCheckin({ event_id: id, invitation_id: invitationId });
      load();
    } catch (e) {
      toast({ title: 'Could not check in', description: e.message, variant: 'destructive' });
    }
  };

  const inviteMore = () => {
    try { localStorage.setItem('mg_host_event', id); } catch { /* storage unavailable */ }
    navigate('/host');
  };

  const ev = board?.event;
  const going = board?.accepted?.length ?? 0;
  const pct = ev?.capacity ? Math.min(100, Math.round((going / ev.capacity) * 100)) : 0;

  const Row = ({ p, children }) => (
    <li className="flex items-center gap-3">
      <Avatar person={p} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{p.name || 'Guest'}</p>
        {p.instagram && <p className="truncate text-xs text-muted-foreground">@{p.instagram}</p>}
        {p.host_note && <p className="truncate text-xs text-muted-foreground">Your note: {p.host_note}</p>}
      </div>
      {children}
    </li>
  );

  return (
    <HostShell title={ev?.name || 'Guest board'}>
      <Helmet><title>Guest board | Mucho Gusto Host</title></Helmet>
      <div className="mg-page-wide">
        <Link to="/host/events" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />All events</Link>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-accent" />)}</div>
        ) : error ? (
          <div className="mg-card p-8 text-center">
            <p role="alert" className="text-sm text-destructive">{error}</p>
            <button className="mg-btn-ghost mt-4" onClick={() => { setLoading(true); load(); }}>Try again</button>
          </div>
        ) : (
          <>
            <div className="mg-card mb-5 flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="min-w-[200px] flex-1">
                <p className="mg-eyebrow">{ev.city_name || 'Event'} · {new Date(ev.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', timeZone: 'UTC' })}</p>
                <p className="mt-1 text-sm text-muted-foreground">{going} going{ev.capacity ? ` of ${ev.capacity}` : ''}{board.checked_in_count ? ` · ${board.checked_in_count} arrived` : ''}</p>
                {ev.capacity && (
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-accent" role="progressbar" aria-valuenow={going} aria-valuemax={ev.capacity}>
                    <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link to={`/host/events/${id}/scan`} className="mg-btn-ghost"><ScanLine className="h-4 w-4" />Door check-in</Link>
                <button className="mg-btn" onClick={inviteMore}><UserPlus className="h-4 w-4" />Invite more</button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Section title="Going" count={board.accepted.length} empty="Nobody has confirmed yet.">
                {board.accepted.map((p) => (
                  <Row key={p.invitation_id} p={p}>
                    {p.checked_in_at ? (
                      <span className="mg-chip"><Check className="h-3 w-3" />Arrived</span>
                    ) : (
                      <button className="mg-btn-ghost px-3 py-1.5 text-xs" onClick={() => tick(p.invitation_id)}>Check in</button>
                    )}
                  </Row>
                ))}
              </Section>
              <Section title="Maybe" count={board.maybe.length} empty="No maybes. We hold their spot a little longer.">
                {board.maybe.map((p) => <Row key={p.invitation_id} p={p} />)}
              </Section>
              <Section title="Waiting to reply" count={board.pending.length} empty="Everyone you invited has replied.">
                {board.pending.map((p) => (
                  <Row key={p.invitation_id} p={p}>
                    <button
                      className="mg-btn-ghost px-3 py-1.5 text-xs"
                      disabled={nudged[p.invitation_id]}
                      onClick={() => nudge(p.invitation_id)}
                    >
                      <BellRing className="h-3.5 w-3.5" />{nudged[p.invitation_id] ? 'Reminded' : 'Gentle reminder'}
                    </button>
                  </Row>
                ))}
              </Section>
              <Section title="Waitlist" count={board.waitlist.length} empty="No waitlist. Spots are still open.">
                {board.waitlist.map((p) => <Row key={p.invitation_id} p={p} />)}
              </Section>
            </div>
          </>
        )}
      </div>
    </HostShell>
  );
};

export default HostEventBoardPage;
