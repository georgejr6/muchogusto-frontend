import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Eye, EyeOff, Link2, RefreshCw } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { useToast } from '@/hooks/use-toast';
import { getCities, hideAround, importAround, listAroundAdmin, scanAround } from '@/lib/apiClient';

const SOURCE = { eventbrite: 'Eventbrite', posh: 'Posh', instagram: 'Instagram', link: 'Web' };

// Host view of everything gathered from other platforms. Hide what does not fit; add links we cannot read ourselves.
const HostAroundPage = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState([]);
  const [cityId, setCityId] = useState('');
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ url: '', title: '', starts_at: '', venue: '' });

  const load = useCallback(async () => {
    try { setItems(await listAroundAdmin(cityId)); }
    catch (e) { toast({ title: 'Could not load', description: e.message, variant: 'destructive' }); }
  }, [cityId, toast]);

  useEffect(() => { getCities().then((c) => { setCities(c); setCityId((v) => v || c[0]?.id || ''); }).catch(() => {}); }, []);
  useEffect(() => { load(); }, [load]);

  const scan = async () => {
    try {
      await scanAround();
      toast({ title: 'Checking now', description: 'New listings appear in about a minute. Members hear about them in one summary.' });
      setTimeout(load, 45000);
    } catch (e) { toast({ title: 'Could not start', description: e.message, variant: 'destructive' }); }
  };

  const add = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await importAround({
        url: form.url.trim(), city_id: cityId, title: form.title.trim() || undefined,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : undefined, venue: form.venue.trim() || undefined,
      });
      setForm({ url: '', title: '', starts_at: '', venue: '' });
      toast({ title: 'Added' });
      load();
    } catch (err) {
      toast({ title: 'Could not add', description: err.message, variant: 'destructive' });
    } finally { setBusy(false); }
  };

  const toggle = async (it) => {
    try { await hideAround(it.id, !it.hidden); setItems((l) => l.map((x) => (x.id === it.id ? { ...x, hidden: !it.hidden } : x))); }
    catch (err) { toast({ title: 'Could not save', description: err.message, variant: 'destructive' }); }
  };

  const day = (it) => new Date(it.starts_at).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', ...(it.has_time ? { hour: 'numeric', minute: '2-digit' } : { timeZone: 'UTC' }) });

  return (
    <HostShell title="Around town">
      <Helmet><title>Around town | Mucho Gusto Host</title></Helmet>
      <div className="mg-page-wide grid gap-5 md:grid-cols-[320px_1fr]">
        <div className="space-y-5">
          <div className="mg-card space-y-3 p-5">
            <label className="block space-y-1.5">
              <span className="text-sm text-muted-foreground">City</span>
              <select className="mg-input" value={cityId} onChange={(e) => setCityId(e.target.value)}>
                {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <button onClick={scan} className="mg-btn-ghost w-full"><RefreshCw className="h-4 w-4" />Check Eventbrite and Posh now</button>
            <p className="text-xs text-muted-foreground">We check every 6 hours. Members get one summary a day at most, never one per event.</p>
          </div>

          <form onSubmit={add} className="mg-card space-y-3 p-5">
            <h2 className="text-lg">Add a link</h2>
            <input className="mg-input" type="url" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="Eventbrite, Posh or Instagram link" />
            <input className="mg-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title (needed for Instagram)" maxLength={120} />
            <input className="mg-input" type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} />
            <input className="mg-input" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Venue (optional)" maxLength={120} />
            <button className="mg-btn w-full" disabled={busy || !cityId}><Link2 className="h-4 w-4" />Add to {cities.find((c) => c.id === cityId)?.name || 'city'}</button>
            <p className="text-xs text-muted-foreground">Instagram does not allow automatic reading, so type the title and date.</p>
          </form>
        </div>

        <div className="space-y-3">
          {items.length === 0 ? (
            <div className="mg-card p-8 text-center text-sm text-muted-foreground">Nothing gathered for this city yet.</div>
          ) : items.map((it) => (
            <div key={it.id} className={`mg-card flex items-center gap-3 p-3 ${it.hidden ? 'opacity-50' : ''}`}>
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-accent">
                {it.image_url && <img src={it.image_url} alt="" loading="lazy" referrerPolicy="no-referrer" className="h-full w-full object-cover" />}
              </div>
              <div className="min-w-0 flex-1">
                <a href={it.url} target="_blank" rel="noopener noreferrer" className="line-clamp-1 text-sm font-medium hover:text-primary">{it.title}</a>
                <p className="truncate text-xs text-muted-foreground">{day(it)} · {SOURCE[it.source] || 'Web'}{it.venue ? ` · ${it.venue}` : ''}</p>
              </div>
              <button className="mg-btn-ghost !px-3 !py-2" aria-label={it.hidden ? 'Show' : 'Hide'} onClick={() => toggle(it)}>
                {it.hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>
          ))}
        </div>
      </div>
    </HostShell>
  );
};

export default HostAroundPage;
