import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Check, Copy, MessageCircle, Send, Share2, X } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { useToast } from '@/hooks/use-toast';
import {
  approveAccessRequest, createInvite, declineAccessRequest, getCities, listAccessRequests, listInvites, revokeInvite,
} from '@/lib/apiClient';

const Avatar = ({ p }) => (
  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-accent">
    {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : (
      <div className="flex h-full w-full items-center justify-center text-muted-foreground">{(p.name || '?')[0]}</div>
    )}
  </div>
);

const HostAccessPage = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState('invite');
  const [cities, setCities] = useState([]);
  const [invites, setInvites] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ label: '', city_id: '', max_uses: 1, email: '' });
  const [busy, setBusy] = useState(false);
  const [fresh, setFresh] = useState(null); // the link just created

  const load = useCallback(async () => {
    try {
      const [i, r] = await Promise.all([listInvites(), listAccessRequests()]);
      setInvites(i);
      setRequests(r);
    } catch (e) {
      toast({ title: 'Could not load', description: e.message, variant: 'destructive' });
    }
  }, [toast]);

  useEffect(() => { load(); getCities().then(setCities).catch(() => {}); }, [load]);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await createInvite({
        label: form.label || undefined,
        city_id: form.city_id || undefined,
        max_uses: Number(form.max_uses) || 1,
        email: form.email.trim() || undefined,
      });
      setFresh(r);
      setForm((f) => ({ ...f, label: '', email: '' }));
      if (r.emailed) toast({ title: 'Invitation emailed' });
      load();
    } catch (err) {
      toast({ title: 'Could not create', description: err.message, variant: 'destructive' });
    } finally {
      setBusy(false);
    }
  };

  const copy = async (link) => {
    try { await navigator.clipboard.writeText(link); toast({ title: 'Link copied' }); }
    catch { toast({ title: 'Copy failed', description: link }); }
  };
  const share = async (link) => {
    const text = 'You are invited to Mucho Gusto, private invitations to events in your city.';
    if (navigator.share) { try { await navigator.share({ title: 'Mucho Gusto', text, url: link }); return; } catch { /* cancelled */ } }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${link}`)}`, '_blank', 'noopener');
  };

  const decide = async (id, approve) => {
    try {
      await (approve ? approveAccessRequest(id) : declineAccessRequest(id));
      setRequests((r) => r.filter((x) => x.id !== id));
      toast({ title: approve ? 'Approved. She has been notified.' : 'Removed from the list' });
    } catch (e) {
      toast({ title: 'Could not save', description: e.message, variant: 'destructive' });
    }
  };

  const remove = async (id) => {
    try { await revokeInvite(id); load(); } catch (e) { toast({ title: 'Could not revoke', description: e.message, variant: 'destructive' }); }
  };

  const Link2 = ({ link }) => (
    <div className="space-y-2">
      <p className="break-all rounded-xl bg-accent px-3 py-2 text-sm">{link}</p>
      <div className="flex flex-wrap gap-2">
        <button className="mg-btn-ghost !px-4 !py-2 text-xs" onClick={() => copy(link)}><Copy className="h-3.5 w-3.5" />Copy</button>
        <button className="mg-btn-ghost !px-4 !py-2 text-xs" onClick={() => share(link)}><Share2 className="h-3.5 w-3.5" />Share</button>
        <a className="mg-btn-ghost !px-4 !py-2 text-xs" target="_blank" rel="noreferrer noopener" href={`https://wa.me/?text=${encodeURIComponent(link)}`}><MessageCircle className="h-3.5 w-3.5" />WhatsApp</a>
      </div>
    </div>
  );

  const active = invites.filter((i) => !i.revoked_at && i.uses < i.max_uses && (!i.expires_at || new Date(i.expires_at) > new Date()));

  return (
    <HostShell title="Invite">
      <Helmet><title>Invite | Mucho Gusto Host</title></Helmet>
      <div className="mg-page-wide space-y-5">
        <div role="tablist" className="flex w-fit gap-1 rounded-full border border-border bg-card/60 p-1">
          {[['invite', 'Invite'], ['requests', `Requests${requests.length ? ` (${requests.length})` : ''}`]].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
              className={`rounded-full px-5 py-2 text-sm font-medium ${tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{label}</button>
          ))}
        </div>

        {tab === 'invite' ? (
          <div className="grid gap-5 md:grid-cols-2">
            <form onSubmit={create} className="mg-card space-y-4 p-5">
              <h2 className="text-lg">New invitation</h2>
              <label className="block space-y-1.5">
                <span className="text-sm text-muted-foreground">Who is it for? (only you see this)</span>
                <input className="mg-input" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="e.g. Rooftop crew" maxLength={80} />
              </label>
              <label className="block space-y-1.5">
                <span className="text-sm text-muted-foreground">Their email (optional, sends it for you)</span>
                <input type="email" className="mg-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="her@example.com" />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5">
                  <span className="text-sm text-muted-foreground">City</span>
                  <select className="mg-input" value={form.city_id} onChange={(e) => setForm({ ...form, city_id: e.target.value })}>
                    <option value="">Any</option>
                    {cities.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm text-muted-foreground">People it can admit</span>
                  <select className="mg-input" value={form.email ? 1 : form.max_uses} disabled={!!form.email} onChange={(e) => setForm({ ...form, max_uses: e.target.value })}>
                    {[1, 5, 10, 25, 100].map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </label>
              </div>
              <button className="mg-btn w-full" disabled={busy}><Send className="h-4 w-4" />{form.email ? 'Email invitation' : 'Create link'}</button>
              <p className="text-xs text-muted-foreground">Links last 14 days. Anyone who joins with one is approved straight away and added to your city.</p>
            </form>

            <div className="space-y-5">
              {fresh && (
                <div className="mg-card space-y-3 border-primary/40 p-5">
                  <h2 className="flex items-center gap-2 text-lg"><Check className="h-4 w-4 text-primary" />Ready to send</h2>
                  <Link2 link={fresh.link} />
                </div>
              )}
              <div className="mg-card space-y-3 p-5">
                <h2 className="text-lg">Active invitations <span className="mg-chip ml-2">{active.length}</span></h2>
                {active.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : (
                  <ul className="space-y-3">
                    {active.map((i) => (
                      <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                        <div className="min-w-0">
                          <p className="truncate">{i.label || i.email || i.code}</p>
                          <p className="text-xs text-muted-foreground">{i.uses}/{i.max_uses} used{i.city ? ` · ${i.city}` : ''}</p>
                        </div>
                        <div className="flex shrink-0 gap-1">
                          <button className="mg-btn-ghost !px-3 !py-1.5 text-xs" onClick={() => copy(i.link)}><Copy className="h-3.5 w-3.5" /></button>
                          <button className="mg-btn-ghost !px-3 !py-1.5 text-xs" aria-label="Revoke" onClick={() => remove(i.id)}><X className="h-3.5 w-3.5" /></button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {requests.length === 0 ? (
              <div className="mg-card p-8 text-center text-sm text-muted-foreground">No one is waiting. People who sign up without an invitation will show up here.</div>
            ) : requests.map((p) => (
              <div key={p.id} className="mg-card flex items-center gap-4 p-4">
                <Avatar p={p} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{p.name || 'New member'}</p>
                  <p className="truncate text-xs text-muted-foreground">{[p.instagram && `@${p.instagram}`, p.city].filter(Boolean).join(' · ') || 'No details yet'}</p>
                  {p.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.bio}</p>}
                </div>
                <div className="flex shrink-0 gap-2">
                  <button className="mg-btn-ghost !px-3 !py-2" aria-label="Decline" onClick={() => decide(p.id, false)}><X className="h-4 w-4" /></button>
                  <button className="mg-btn !px-4 !py-2" onClick={() => decide(p.id, true)}><Check className="h-4 w-4" />Let in</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </HostShell>
  );
};

export default HostAccessPage;
