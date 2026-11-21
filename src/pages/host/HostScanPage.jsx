import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useParams } from 'react-router-dom';
import jsQR from 'jsqr';
import { ArrowLeft, Camera, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { hostCheckin } from '@/lib/apiClient';

const REASONS = {
  not_on_list: 'Not on the list for this event',
  waitlist: 'On the waitlist, not confirmed',
  expired: 'Pass expired. Ask her to reopen it',
  unknown: 'Pass not recognised',
};

// Door scanner: camera QR decode (jsQR works on iOS too), with a typed-code fallback.
const HostScanPage = () => {
  const { id } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const busyRef = useRef(false);
  const lastRef = useRef('');
  const [camOn, setCamOn] = useState(false);
  const [camError, setCamError] = useState('');
  const [result, setResult] = useState(null);
  const [manual, setManual] = useState('');
  const [count, setCount] = useState(0);

  const submit = useCallback(async (scan) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      const r = await hostCheckin({ event_id: id, scan });
      setResult(r);
      if (r.ok && !r.already) setCount((c) => c + 1);
      if (navigator.vibrate) navigator.vibrate(r.ok ? 60 : [80, 60, 80]);
    } catch (e) {
      setResult({ ok: false, reason: 'error', message: e.message });
    } finally {
      setTimeout(() => { busyRef.current = false; lastRef.current = ''; }, 1800);
    }
  }, [id]);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamOn(false);
  }, []);

  const start = async () => {
    setCamError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      const v = videoRef.current;
      v.srcObject = stream;
      await v.play();
      setCamOn(true);
    } catch {
      setCamError('Camera unavailable. Type the member code instead.');
    }
  };

  useEffect(() => {
    if (!camOn) return undefined;
    let raf;
    const tick = () => {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (v && c && v.readyState === v.HAVE_ENOUGH_DATA) {
        const w = 480;
        const h = Math.round((v.videoHeight / v.videoWidth) * w) || 360;
        c.width = w; c.height = h;
        const ctx = c.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(v, 0, 0, w, h);
        const img = ctx.getImageData(0, 0, w, h);
        const hit = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
        if (hit?.data && hit.data !== lastRef.current && !busyRef.current) {
          lastRef.current = hit.data;
          submit(hit.data);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [camOn, submit]);

  useEffect(() => stop, [stop]);

  const typed = (e) => {
    e.preventDefault();
    if (manual.trim()) { submit(manual.trim()); setManual(''); }
  };

  return (
    <HostShell title="Door check-in">
      <Helmet><title>Door check-in | Mucho Gusto Host</title></Helmet>
      <div className="mx-auto max-w-md space-y-5 px-4 pb-28 pt-6">
        <Link to={`/host/events/${id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Guest board</Link>

        <div className="mg-card overflow-hidden">
          <div className="relative aspect-[4/3] bg-black">
            <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
            <canvas ref={canvasRef} className="hidden" />
            {!camOn && (
              <button onClick={start} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/90">
                <Camera className="h-8 w-8" /><span className="text-sm">Start scanning</span>
              </button>
            )}
            {camOn && <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-white/60" />}
          </div>
          {camError && <p role="alert" className="px-4 py-3 text-sm text-destructive">{camError}</p>}
        </div>

        {result && (
          <div className={`mg-card flex items-center gap-4 p-4 ${result.ok ? 'border-primary/50' : 'border-destructive/50'}`} role="status">
            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-accent">
              {result.photo_url && <img src={result.photo_url} alt="" className="h-full w-full object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              {result.name && <p className="truncate font-medium">{result.name}</p>}
              <p className={`flex items-center gap-1.5 text-sm ${result.ok ? 'text-primary' : 'text-destructive'}`}>
                {result.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {result.ok ? (result.already ? 'Already checked in' : 'Welcome in') : (result.message || REASONS[result.reason] || 'Cannot check in')}
              </p>
              {result.ok && result.verified && <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><ShieldCheck className="h-3 w-3" />Verified</p>}
            </div>
          </div>
        )}

        <form onSubmit={typed} className="flex gap-2">
          <input value={manual} onChange={(e) => setManual(e.target.value.toUpperCase())} placeholder="Member code, e.g. MG-AB12CD34" className="mg-input flex-1 font-display tracking-wider" autoCapitalize="characters" />
          <button className="mg-btn" disabled={!manual.trim()}>Check in</button>
        </form>
        <p className="text-center text-xs text-muted-foreground">{count} checked in this session</p>
      </div>
    </HostShell>
  );
};

export default HostScanPage;
