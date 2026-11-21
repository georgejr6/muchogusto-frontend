import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, Plus, Pencil, Trash2, ImagePlus } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription,
  AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { getEvents, getCities, createEvent, updateEvent, deleteEvent, uploadEventMedia } from '@/lib/apiClient';

const EMPTY = {
  name: '', date: '', time: '', location: '', city_id: '', capacity: '', audience: 'women',
  dress_code: '', description: '', visibility: 'invite_only', requires_consent: false, media: [],
};

const toDateInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
};

const goingCount = (e) => (e.rsvps || []).filter((r) => r.status === 'accepted' || r.status === 'interested').length;

const Field = ({ label, children, hint }) => (
  <label className="block space-y-1.5">
    <span className="text-sm text-muted-foreground">{label}</span>
    {children}
    {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
  </label>
);

const EventForm = ({ initial, cities, onClose, onSaved }) => {
  const { toast } = useToast();
  const editing = !!initial?.id;
  const [form, setForm] = useState(() => (initial
    ? {
        ...EMPTY,
        ...initial,
        date: toDateInput(initial.date),
        city_id: initial.city_id || '',
        capacity: initial.capacity ?? '',
        dress_code: initial.dress_code || '',
        description: initial.description || '',
        time: initial.time || '',
        media: Array.isArray(initial.media) ? initial.media : [],
      }
    : { ...EMPTY, city_id: cities[0]?.id || '' }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadEventMedia(file);
      setForm((f) => ({ ...f, media: [...f.media, url] }));
    } catch (e) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Give the event a name';
    if (!form.date) errs.date = 'Pick a date';
    if (!form.location.trim()) errs.location = 'Add the venue';
    if (!form.city_id) errs.city_id = 'Choose a city';
    if (form.capacity !== '' && (!Number.isInteger(Number(form.capacity)) || Number(form.capacity) < 1)) errs.capacity = 'Use a whole number above 0';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const payload = {
      name: form.name.trim(),
      date: form.date,
      time: form.time || null,
      location: form.location.trim(),
      description: form.description.trim() || null,
      visibility: form.visibility,
      media: form.media,
      city_id: form.city_id,
      capacity: form.capacity === '' ? null : Number(form.capacity),
      audience: form.audience,
      dress_code: form.dress_code.trim() || null,
    };
    if (!editing) payload.requires_consent = form.requires_consent;

    setSaving(true);
    try {
      if (editing) await updateEvent(initial.id, payload);
      else await createEvent(payload);
      toast({ title: editing ? 'Event updated' : 'Event created' });
      onSaved();
    } catch (err) {
      toast({ title: 'Could not save the event', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const err = (k) => errors[k] && <span role="alert" className="block text-xs text-destructive">{errors[k]}</span>;

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label="Event name"><input className="mg-input" value={form.name} onChange={set('name')} />{err('name')}</Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Date"><input type="date" className="mg-input" value={form.date} onChange={set('date')} />{err('date')}</Field>
        <Field label="Doors open"><input type="time" className="mg-input" value={form.time} onChange={set('time')} /></Field>
      </div>
      <Field label="Venue"><input className="mg-input" value={form.location} onChange={set('location')} placeholder="Rooftop, El Poblado" />{err('location')}</Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="City">
          <select className="mg-input" value={form.city_id} onChange={set('city_id')}>
            <option value="">Select a city</option>
            {cities.map((c) => <option key={c.id} value={c.id} disabled={c.is_active === false && c.id !== form.city_id}>{c.name}{c.is_active === false ? ' (paused)' : ''}</option>)}
          </select>
          {err('city_id')}
        </Field>
        <Field label="Capacity" hint="Leave empty for no limit">
          <input type="number" min="1" inputMode="numeric" className="mg-input" value={form.capacity} onChange={set('capacity')} />
          {err('capacity')}
        </Field>
      </div>
      <div>
        <span className="text-sm text-muted-foreground">Guest list</span>
        <div className="mt-1.5 inline-flex rounded-full border border-border p-1">
          {[['women', 'Women only'], ['mixed', 'Mixed']].map(([k, label]) => (
            <button
              type="button"
              key={k}
              aria-pressed={form.audience === k}
              onClick={() => setForm((f) => ({ ...f, audience: k }))}
              className={`rounded-full px-4 py-1.5 text-sm ${form.audience === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {form.audience === 'women' && <p className="mt-1 text-xs text-muted-foreground">Only verified members can accept.</p>}
      </div>
      <Field label="Dress code"><input className="mg-input" value={form.dress_code} onChange={set('dress_code')} placeholder="All black" /></Field>
      <Field label="Description"><textarea rows={3} className="mg-input" value={form.description} onChange={set('description')} /></Field>
      <Field label="Visibility">
        <select className="mg-input" value={form.visibility} onChange={set('visibility')}>
          <option value="public">Public: listed and shareable</option>
          <option value="invite_only">Invite only: link works, not listed</option>
          <option value="private">Private: invited guests only</option>
        </select>
      </Field>
      {!editing && (
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" checked={form.requires_consent} onChange={set('requires_consent')} className="h-4 w-4 accent-[hsl(var(--primary))]" />
          Guests complete a consent form before confirming
        </label>
      )}
      <div>
        <span className="text-sm text-muted-foreground">Cover photos</span>
        <div className="mt-1.5 flex flex-wrap gap-2">
          {form.media.map((m, i) => (
            <div key={m} className="relative h-20 w-20 overflow-hidden rounded-xl border border-border">
              <img src={m} alt="" className="h-full w-full object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => setForm((f) => ({ ...f, media: f.media.filter((_, j) => j !== i) }))} className="absolute right-1 top-1 rounded-full bg-background/80 px-1.5 text-xs">×</button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:border-primary/50">
            <ImagePlus className="h-5 w-5" />{uploading ? 'Uploading' : 'Add'}
            <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
          </label>
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" className="mg-btn-ghost flex-1" onClick={onClose}>Cancel</button>
        <button type="submit" className="mg-btn flex-1" disabled={saving || uploading}>{saving ? 'Saving' : editing ? 'Save changes' : 'Create event'}</button>
      </div>
    </form>
  );
};

const HostEventsPage = () => {
  const { toast } = useToast();
  const [events, setEvents] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('upcoming');
  const [editor, setEditor] = useState(null); // null | {} (new) | event
  const [toDelete, setToDelete] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [ev, ci] = await Promise.all([getEvents(), getCities({ all: true })]);
      setEvents(Array.isArray(ev) ? ev : []);
      setCities(Array.isArray(ci) ? ci : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const cityName = useMemo(() => Object.fromEntries(cities.map((c) => [c.id, c.name])), [cities]);

  const shown = useMemo(() => {
    const cutoff = Date.now() - 86400000;
    const list = events.filter((e) => (tab === 'upcoming' ? new Date(e.date).getTime() >= cutoff : new Date(e.date).getTime() < cutoff));
    list.sort((a, b) => (tab === 'upcoming' ? new Date(a.date) - new Date(b.date) : new Date(b.date) - new Date(a.date)));
    return list;
  }, [events, tab]);

  const confirmDelete = async () => {
    const ev = toDelete;
    setToDelete(null);
    try {
      await deleteEvent(ev.id);
      setEvents((cur) => cur.filter((e) => e.id !== ev.id));
      toast({ title: 'Event deleted' });
    } catch (e) {
      toast({ title: 'Could not delete', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <HostShell title="Events">
      <Helmet><title>Events | Mucho Gusto Host</title></Helmet>
      <div className="mg-page-wide">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="inline-flex rounded-full border border-border p-1" role="tablist">
            {[['upcoming', 'Upcoming'], ['past', 'Past']].map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-5 py-1.5 text-sm ${tab === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{label}</button>
            ))}
          </div>
          <button className="mg-btn" onClick={() => setEditor({})}><Plus className="h-4 w-4" />New event</button>
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">{[0, 1].map((i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-accent" />)}</div>
        ) : error ? (
          <div className="mg-card p-8 text-center">
            <p role="alert" className="text-sm text-destructive">{error}</p>
            <button className="mg-btn-ghost mt-4" onClick={() => { setLoading(true); load(); }}>Try again</button>
          </div>
        ) : shown.length === 0 ? (
          <div className="mg-card p-10 text-center">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-primary/60" />
            <p className="text-lg">{tab === 'upcoming' ? 'Nothing on the calendar.' : 'No past events yet.'}</p>
            {tab === 'upcoming' && <button className="mg-btn mt-4" onClick={() => setEditor({})}>Plan your first event</button>}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {shown.map((e) => {
              const going = goingCount(e);
              const pct = e.capacity ? Math.min(100, Math.round((going / e.capacity) * 100)) : 0;
              return (
                <div key={e.id} className="mg-card mg-card-hover flex flex-col gap-3 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/host/events/${e.id}`} className="block truncate font-display text-xl hover:text-primary">{e.name}</Link>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {new Date(e.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}{e.time ? ` · ${e.time}` : ''}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button aria-label={`Edit ${e.name}`} onClick={() => setEditor(e)} className="rounded-full p-2 text-muted-foreground hover:bg-accent"><Pencil className="h-4 w-4" /></button>
                      <button aria-label={`Delete ${e.name}`} onClick={() => setToDelete(e)} className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {cityName[e.city_id] && <span className="mg-chip"><MapPin className="h-3 w-3" />{cityName[e.city_id]}</span>}
                    <span className="mg-chip">{e.audience === 'mixed' ? 'Mixed' : 'Women only'}</span>
                    {e.location && <span className="mg-chip truncate">{e.location}</span>}
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                      <span>{going} going</span>
                      <span>{e.capacity ? `${e.capacity} spots` : 'No limit'}</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-accent" role="progressbar" aria-valuenow={going} aria-valuemax={e.capacity || undefined}>
                      <div className="h-full rounded-full bg-primary" style={{ width: `${e.capacity ? pct : going ? 100 : 0}%` }} />
                    </div>
                  </div>
                  <Link to={`/host/events/${e.id}`} className="text-sm text-primary hover:underline">Open guest board</Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={!!editor} onOpenChange={(o) => { if (!o) setEditor(null); }}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editor?.id ? 'Edit event' : 'New event'}</DialogTitle>
            <DialogDescription>Where, when, and who it is for.</DialogDescription>
          </DialogHeader>
          {editor && (
            <EventForm
              key={editor.id || 'new'}
              initial={editor.id ? editor : null}
              cities={cities}
              onClose={() => setEditor(null)}
              onSaved={() => { setEditor(null); setLoading(true); load(); }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => { if (!o) setToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>This removes the event and all of its invitations. It cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </HostShell>
  );
};

export default HostEventsPage;
