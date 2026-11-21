import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useMotionValue, useTransform } from 'framer-motion';
import { Check, X, Bookmark, Users, ShieldCheck, Circle, CheckCircle2 } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { getEvents, getHostPool, hostSwipe, getShortlist, getEventBoard, getHostMe } from '@/lib/apiClient';

const STORE_KEY = 'mg_host_event';
const SUGGESTED = [
  'Saved you a spot. Wear something you love.',
  'Small table, good music. It would be lovely to have you there.',
  'Hope you can make it. Happy to answer any questions.',
];

const readStored = () => { try { return localStorage.getItem(STORE_KEY); } catch { return null; } };
const writeStored = (v) => { try { localStorage.setItem(STORE_KEY, v); } catch { /* storage unavailable */ } };

const chipsFor = (m) =>
  [m.hobbies, m.interests]
    .filter(Boolean)
    .flatMap((s) => String(s).split(/[,;]/))
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 6);

const initials = (name) => (name || 'G').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// Shown when she has chosen to blur her photo (server sends no photo) or has none.
const SoftAvatar = ({ name, className = '' }) => (
  <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br from-accent to-card ${className}`} aria-hidden="true">
    <span className="font-display text-6xl text-primary/70 blur-[1px]">{initials(name)}</span>
  </div>
);

const GuestCard = ({ member, active, onDecide }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const inviteOpacity = useTransform(x, [20, 120], [0, 1]);
  const skipOpacity = useTransform(x, [-120, -20], [1, 0]);
  const saveOpacity = useTransform(y, [-120, -20], [1, 0]);

  const onDragEnd = (_e, info) => {
    if (info.offset.x > 110) onDecide('invite');
    else if (info.offset.x < -110) onDecide('skip');
    else if (info.offset.y < -110) onDecide('shortlist');
  };

  const chips = chipsFor(member);

  return (
    <motion.div
      className="absolute inset-0 touch-none select-none"
      style={{ x, y, rotate }}
      drag={active}
      dragSnapToOrigin
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      initial={{ scale: active ? 1 : 0.95, opacity: 0 }}
      animate={{ scale: active ? 1 : 0.95, opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.15 } }}
    >
      <div className="mg-card relative h-full w-full overflow-hidden">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.name ? `${member.name}` : 'Guest'}
            draggable={false}
            className={`h-full w-full object-cover ${member.blurred ? 'blur-2xl scale-110' : ''}`}
          />
        ) : (
          <SoftAvatar name={member.name} />
        )}
        <div className="absolute inset-x-0 bottom-0 space-y-2 bg-gradient-to-t from-background via-background/80 to-transparent p-5 pt-16">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl">{member.name || 'Guest'}{member.age ? `, ${member.age}` : ''}</h2>
            {member.verified_at && <span className="mg-verified"><ShieldCheck className="h-3 w-3" />Verified</span>}
          </div>
          {member.bio && <p className="line-clamp-3 text-sm text-foreground/90">{member.bio}</p>}
          {chips.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c) => <span key={c} className="mg-chip">{c}</span>)}
            </div>
          )}
        </div>
        {active && (
          <>
            <motion.span style={{ opacity: inviteOpacity }} className="absolute left-5 top-5 rounded-full border border-primary px-3 py-1 text-sm font-semibold text-primary">Invite</motion.span>
            <motion.span style={{ opacity: skipOpacity }} className="absolute right-5 top-5 rounded-full border border-border bg-background/70 px-3 py-1 text-sm font-semibold text-muted-foreground">Not this time</motion.span>
            <motion.span style={{ opacity: saveOpacity }} className="absolute left-1/2 top-5 -translate-x-1/2 rounded-full border border-border bg-background/70 px-3 py-1 text-sm font-semibold text-foreground">Keep in list</motion.span>
          </>
        )}
      </div>
    </motion.div>
  );
};

const HostDeckPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [eventId, setEventId] = useState(readStored() || '');
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState('');
  const [allEvents, setAllEvents] = useState([]);
  const [hostHandle, setHostHandle] = useState(null); // null = unknown

  const [deck, setDeck] = useState([]);
  const [loadingDeck, setLoadingDeck] = useState(false);
  const [deckError, setDeckError] = useState('');
  const [exhausted, setExhausted] = useState(false);

  const [tab, setTab] = useState('pool');
  const [saved, setSaved] = useState([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  const [going, setGoing] = useState(null);
  const [noteFor, setNoteFor] = useState(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const seen = useRef(new Set());
  const poolReq = useRef(0);
  const inflight = useRef(false);
  const goingReq = useRef(0);

  const event = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);

  // Upcoming events only.
  useEffect(() => {
    getHostMe().then((h) => setHostHandle(h?.handle || '')).catch(() => setHostHandle(null));
    getEvents()
      .then((list) => {
        setAllEvents(Array.isArray(list) ? list : []);
        const upcoming = (Array.isArray(list) ? list : []).filter((e) => new Date(e.date) >= new Date(Date.now() - 86400000));
        upcoming.sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(upcoming);
        setEventId((cur) => (upcoming.some((e) => e.id === cur) ? cur : upcoming[0]?.id || ''));
      })
      .catch((e) => setEventsError(e.message))
      .finally(() => setLoadingEvents(false));
  }, []);

  const refreshGoing = useCallback((id) => {
    const token = ++goingReq.current;
    getEventBoard(id)
      .then((b) => { if (token === goingReq.current) setGoing(b.accepted?.length ?? 0); })
      .catch(() => { if (token === goingReq.current) setGoing(null); });
  }, []);

  const loadPool = useCallback(async (id, reset) => {
    if (!id) return;
    // A reset (event switch / retry) replaces any in-flight fetch; a prefetch never overlaps another.
    if (!reset && inflight.current) return;
    const token = ++poolReq.current;
    inflight.current = true;
    if (reset) { setLoadingDeck(true); seen.current = new Set(); }
    setDeckError('');
    try {
      const batch = await getHostPool(id, 20);
      if (token !== poolReq.current) return; // stale: the host switched events meanwhile
      const fresh = (Array.isArray(batch) ? batch : []).filter((m) => !seen.current.has(m.id));
      fresh.forEach((m) => seen.current.add(m.id));
      setExhausted(fresh.length === 0);
      setDeck((cur) => (reset ? fresh : [...cur, ...fresh]));
    } catch (e) {
      if (token === poolReq.current) setDeckError(e.message);
    } finally {
      if (token === poolReq.current) { inflight.current = false; setLoadingDeck(false); }
    }
  }, []);

  useEffect(() => {
    if (!eventId) return;
    writeStored(eventId);
    setDeck([]);
    setTab('pool');
    loadPool(eventId, true);
    refreshGoing(eventId);
  }, [eventId, loadPool, refreshGoing]);

  useEffect(() => {
    if (tab !== 'saved' || !eventId) return;
    setLoadingSaved(true);
    getShortlist(eventId).then((r) => setSaved(Array.isArray(r) ? r : [])).catch((e) => toast({ title: 'Could not load saved guests', description: e.message, variant: 'destructive' })).finally(() => setLoadingSaved(false));
  }, [tab, eventId, toast]);

  // Prefetch when the stack runs low.
  useEffect(() => {
    if (deck.length > 0 && deck.length <= 3 && !exhausted) loadPool(eventId, false);
  }, [deck.length, exhausted, eventId, loadPool]);

  const top = deck[0];

  const decide = useCallback(async (action, member, noteText) => {
    if (!member || !eventId) return;
    setBusy(true);
    setDeck((cur) => cur.filter((m) => m.id !== member.id));
    setSaved((cur) => cur.filter((m) => m.id !== member.id));
    try {
      await hostSwipe({ event_id: eventId, user_id: member.id, action, note: noteText || undefined });
      if (action === 'invite') { toast({ title: `Invitation sent to ${member.name || 'guest'}` }); }
      if (action === 'shortlist') toast({ title: 'Kept in your list' });
    } catch (e) {
      setDeck((cur) => [member, ...cur]);
      toast({ title: 'That did not go through', description: e.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  }, [eventId, toast]);

  const request = useCallback((action, member) => {
    if (!member || busy) return;
    if (action === 'invite') { setNote(''); setNoteFor(member); } else decide(action, member);
  }, [busy, decide]);

  // Keyboard: arrows on desktop.
  useEffect(() => {
    const onKey = (e) => {
      if (noteFor || tab !== 'pool' || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
      if (e.key === 'ArrowRight') request('invite', top);
      else if (e.key === 'ArrowLeft') request('skip', top);
      else if (e.key === 'ArrowUp') { e.preventDefault(); request('shortlist', top); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [noteFor, tab, top, request]);

  const sendInvite = async () => {
    const m = noteFor;
    setNoteFor(null);
    await decide('invite', m, note.trim().slice(0, 280));
    if (eventId) refreshGoing(eventId);
  };

  const cityName = event?.city_name || 'this city';

  const steps = [
    { label: 'Finish your profile', to: '/host/profile', done: hostHandle === null ? true : !!hostHandle },
    { label: 'Create an event', to: '/host/events', done: allEvents.length > 0 },
    { label: 'Open your city', to: '/host/cities', done: allEvents.some((e) => !!e.city_id) },
    { label: 'Invite your first guests', to: '/host', done: allEvents.some((e) => (e.rsvps?.length || 0) > 0) },
  ];
  const showChecklist = !loadingEvents && !eventsError && !steps.every((x) => x.done);

  return (
    <HostShell title="Guest pool">
      <Helmet><title>Guest pool | Mucho Gusto Host</title></Helmet>
      <div className="mg-page-wide pt-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {loadingEvents ? (
            <div className="h-11 w-64 animate-pulse rounded-xl bg-accent" />
          ) : events.length === 0 ? null : (
            <select
              aria-label="Event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              className="mg-input max-w-xs"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} · {new Date(e.date).toLocaleDateString(undefined, { timeZone: 'UTC' })}
                </option>
              ))}
            </select>
          )}
          {event && (
            <span className="mg-chip"><Users className="h-3.5 w-3.5" />
              {going ?? '–'}{event.capacity ? ` of ${event.capacity}` : ''} going
            </span>
          )}
        </div>

        {showChecklist && (
          <div className="mg-card mb-5 space-y-2 p-5">
            <p className="mg-eyebrow">Get set up</p>
            <ol className="space-y-1.5">
              {steps.map((st, i) => (
                <li key={st.label}>
                  <Link to={st.to} className={`flex items-center gap-2 text-sm ${st.done ? 'text-muted-foreground line-through' : 'text-foreground hover:text-primary'}`}>
                    {st.done ? <CheckCircle2 className="h-4 w-4 text-[hsl(var(--mg-ok))]" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                    {i + 1}. {st.label}
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        )}

        {eventsError && <p role="alert" className="text-sm text-destructive">{eventsError}</p>}

        {!loadingEvents && events.length === 0 && !eventsError && (
          <div className="mg-card p-10 text-center">
            <p className="text-lg">No upcoming events yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">Create an event first, then build its guest list here.</p>
            <Link to="/host/events" className="mg-btn mt-5">Create an event</Link>
          </div>
        )}

        {event && (
          <>
            <div className="mb-4 inline-flex rounded-full border border-border p-1" role="tablist">
              {[['pool', 'Pool'], ['saved', 'Kept']].map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`rounded-full px-5 py-1.5 text-sm ${tab === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === 'pool' && (
              <div className="mx-auto max-w-sm">
                {loadingDeck ? (
                  <div className="aspect-[3/4] animate-pulse rounded-2xl bg-accent" />
                ) : deckError && deck.length === 0 ? (
                  <div className="mg-card p-8 text-center">
                    <p role="alert" className="text-sm text-destructive">{deckError}</p>
                    <button className="mg-btn-ghost mt-4" onClick={() => loadPool(eventId, true)}>Try again</button>
                  </div>
                ) : deck.length === 0 ? (
                  <div className="mg-card p-8 text-center">
                    <p className="text-lg">You have reached everyone for this event.</p>
                    <p className="mt-1 text-sm text-muted-foreground">New guests in {cityName} will appear here as they join. Or open another city.</p>
                    <Link to="/host/cities" className="mg-btn-ghost mt-4">Open another city</Link>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-[3/4] w-full">
                      <AnimatePresence>
                        {deck.slice(0, 2).reverse().map((m) => (
                          <GuestCard key={m.id} member={m} active={m.id === top.id} onDecide={(a) => request(a, m)} />
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="mt-5 flex items-center justify-center gap-4">
                      <button aria-label="Not this time" disabled={busy} onClick={() => request('skip', top)} className="flex h-14 w-14 items-center justify-center rounded-full border border-border text-muted-foreground hover:bg-accent"><X className="h-6 w-6" /></button>
                      <button aria-label="Keep in list" disabled={busy} onClick={() => request('shortlist', top)} className="flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground hover:bg-accent"><Bookmark className="h-5 w-5" /></button>
                      <button aria-label="Invite" disabled={busy} onClick={() => request('invite', top)} className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground hover:brightness-105"><Check className="h-6 w-6" /></button>
                    </div>
                    <p className="mt-3 hidden text-center text-xs text-muted-foreground md:block">Arrow keys: ← not this time · ↑ keep in list · → invite</p>
                  </>
                )}
              </div>
            )}

            {tab === 'saved' && (
              <div>
                {loadingSaved ? (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-accent" />)}</div>
                ) : saved.length === 0 ? (
                  <div className="mg-card p-8 text-center text-sm text-muted-foreground">Nobody in your list yet. Use the bookmark on the pool to keep someone for later.</div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {saved.map((m) => (
                      <div key={m.id} className="mg-card overflow-hidden">
                        <div className="aspect-[3/4] bg-accent">
                          {m.photo_url ? <img src={m.photo_url} alt={m.name || 'Guest'} className={`h-full w-full object-cover ${m.blurred ? 'blur-xl scale-110' : ''}`} /> : <SoftAvatar name={m.name} />}
                        </div>
                        <div className="space-y-2 p-3">
                          <p className="truncate font-medium">{m.name || 'Guest'}</p>
                          <button className="mg-btn w-full py-2" onClick={() => { setNote(''); setNoteFor(m); }}>Invite</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Sheet open={!!noteFor} onOpenChange={(o) => { if (!o) setNoteFor(null); }}>
        <SheetContent side="bottom" className="mx-auto max-w-lg rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>Invite {noteFor?.name || 'guest'}</SheetTitle>
            <SheetDescription>Add a personal line. It arrives with her invitation, in your name.</SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              {SUGGESTED.map((s) => (
                <button key={s} type="button" onClick={() => setNote(s)} className="mg-chip hover:border-primary/50">{s}</button>
              ))}
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 280))}
              rows={3}
              placeholder="Optional note"
              aria-label="Personal note"
              className="mg-input"
            />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{note.length}/280</span>
            </div>
            <div className="flex gap-3">
              <button className="mg-btn-ghost flex-1" onClick={() => setNoteFor(null)}>Cancel</button>
              <button className="mg-btn flex-1" disabled={busy} onClick={sendInvite}>Send invitation</button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </HostShell>
  );
};

export default HostDeckPage;
