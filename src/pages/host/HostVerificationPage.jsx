import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Check, X } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { useToast } from '@/hooks/use-toast';
import { getPendingVerifications, reviewVerification, fetchVerificationSelfie, getReports } from '@/lib/apiClient';

const Selfie = ({ attemptId }) => {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    let revoked = false;
    let objectUrl = null;
    const node = ref.current;
    const load = () => {
      fetchVerificationSelfie(attemptId)
        .then((u) => { if (revoked) URL.revokeObjectURL(u); else { objectUrl = u; setUrl(u); } })
        .catch(() => setFailed(true));
    };
    // Lazy: only fetch once scrolled into view.
    if (typeof IntersectionObserver === 'undefined') { load(); return () => { revoked = true; if (objectUrl) URL.revokeObjectURL(objectUrl); }; }
    const io = new IntersectionObserver((entries) => { if (entries[0].isIntersecting) { io.disconnect(); load(); } });
    if (node) io.observe(node);
    return () => { revoked = true; io.disconnect(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [attemptId]);

  return (
    <div ref={ref} className="aspect-[3/4] overflow-hidden rounded-xl bg-accent">
      {url ? <img src={url} alt="Live selfie" className="h-full w-full object-cover" />
        : <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">{failed ? 'Selfie unavailable' : 'Loading selfie'}</div>}
    </div>
  );
};

const HostVerificationPage = () => {
  const { toast } = useToast();
  const [tab, setTab] = useState('queue');
  const [queue, setQueue] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [q, r] = await Promise.all([getPendingVerifications(), getReports().catch(() => [])]);
      setQueue(Array.isArray(q) ? q : []);
      setReports(Array.isArray(r) ? r : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decide = async (item, approve) => {
    setBusyId(item.attempt_id);
    const prev = queue;
    setQueue((cur) => cur.filter((x) => x.attempt_id !== item.attempt_id));
    try {
      await reviewVerification(item.attempt_id, approve);
      toast({ title: approve ? `${item.name || 'Guest'} is verified` : 'Verification declined' });
    } catch (e) {
      setQueue(prev);
      toast({ title: 'Could not save your decision', description: e.message, variant: 'destructive' });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <HostShell title="Verification">
      <Helmet><title>Verification | Mucho Gusto Host</title></Helmet>
      <div className="mg-page-wide">
        <div className="mb-5 inline-flex rounded-full border border-border p-1" role="tablist">
          {[['queue', `Review queue${queue.length ? ` (${queue.length})` : ''}`], ['reports', 'Reports']].map(([k, label]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`rounded-full px-5 py-1.5 text-sm ${tab === k ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>{label}</button>
          ))}
        </div>

        {loading ? (
          <div className="grid gap-4 md:grid-cols-2">{[0, 1].map((i) => <div key={i} className="h-64 animate-pulse rounded-2xl bg-accent" />)}</div>
        ) : error ? (
          <div className="mg-card p-8 text-center">
            <p role="alert" className="text-sm text-destructive">{error}</p>
            <button className="mg-btn-ghost mt-4" onClick={() => { setLoading(true); load(); }}>Try again</button>
          </div>
        ) : tab === 'queue' ? (
          <>
            <p className="mb-4 text-sm text-muted-foreground">Confirm the selfie matches her photos and that she is a woman. Selfies are deleted as soon as you decide.</p>
            {queue.length === 0 ? (
              <div className="mg-card p-10 text-center text-muted-foreground">Nobody is waiting for review.</div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {queue.map((item) => (
                  <div key={item.attempt_id} className="mg-card space-y-4 p-4">
                    <div className={item.method === 'stripe_confirm' ? '' : 'grid grid-cols-2 gap-3'}>
                      {item.method !== 'stripe_confirm' && (
                        <div>
                          <p className="mb-1 text-xs text-muted-foreground">Live selfie</p>
                          <Selfie attemptId={item.attempt_id} />
                        </div>
                      )}
                      <div className={item.method === 'stripe_confirm' ? 'max-w-[10rem]' : ''}>
                        <p className="mb-1 text-xs text-muted-foreground">Profile photo</p>
                        <div className="aspect-[3/4] overflow-hidden rounded-xl bg-accent">
                          {item.photo_url ? <img src={item.photo_url} alt="Profile" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No photo</div>}
                        </div>
                      </div>
                    </div>
                    {item.method === 'stripe_confirm' && (
                      <p className="rounded-xl bg-accent/60 p-3 text-xs text-muted-foreground">ID + selfie matched by our provider — confirm she is a woman and the photos match.</p>
                    )}
                    <div>
                      <p className="font-medium">{item.name || 'Guest'}</p>
                      {item.instagram && <p className="text-xs text-muted-foreground">@{item.instagram}</p>}
                      <p className="text-xs text-muted-foreground">Submitted {new Date(item.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex gap-3">
                      <button className="mg-btn-ghost flex-1" disabled={busyId === item.attempt_id} onClick={() => decide(item, false)}><X className="h-4 w-4" />Decline</button>
                      <button className="mg-btn flex-1" disabled={busyId === item.attempt_id} onClick={() => decide(item, true)}><Check className="h-4 w-4" />Verify</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : reports.length === 0 ? (
          <div className="mg-card p-10 text-center text-muted-foreground">No reports.</div>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="mg-card p-4">
                <p className="text-sm">{r.reason}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(r.created_at).toLocaleString()} · {r.target_admin_id ? 'About a host' : 'About a member'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </HostShell>
  );
};

export default HostVerificationPage;
