import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Crosshair, MapPin, Users } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { useToast } from '@/hooks/use-toast';
import { getCities, createCity, updateCity, getCityDemand } from '@/lib/apiClient';

const TIMEZONES = [
  'America/Bogota', 'America/New_York', 'America/Mexico_City', 'America/Los_Angeles', 'America/Chicago',
  'America/Sao_Paulo', 'America/Argentina/Buenos_Aires', 'America/Lima', 'Europe/Madrid', 'Europe/London',
];

const BLANK = { name: '', country: '', lat: '', lng: '', radius_km: '40', timezone: 'America/Bogota' };

const CityRow = ({ city, onChanged }) => {
  const { toast } = useToast();
  const [radius, setRadius] = useState(String(city.radius_km ?? 40));
  const [saving, setSaving] = useState(false);

  const patch = async (data, msg) => {
    setSaving(true);
    try {
      const updated = await updateCity(city.id, data);
      onChanged(updated);
      toast({ title: msg });
    } catch (e) {
      toast({ title: 'Could not update', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const saveRadius = () => {
    const n = Number(radius);
    if (!Number.isInteger(n) || n < 1 || n > 500) {
      toast({ title: 'Radius must be 1 to 500 km', variant: 'destructive' });
      return;
    }
    if (n !== city.radius_km) patch({ radius_km: n }, 'Radius updated');
  };

  return (
    <li className="mg-card flex flex-wrap items-center gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 font-display text-lg"><MapPin className="h-4 w-4 text-primary" />{city.name}</p>
        <p className="text-xs text-muted-foreground">{city.country || '—'} · {Number(city.lat).toFixed(2)}, {Number(city.lng).toFixed(2)}</p>
      </div>
      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        Radius
        <input
          type="number" min="1" max="500" inputMode="numeric"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
          onBlur={saveRadius}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          className="mg-input w-20 px-3 py-1.5"
          aria-label={`${city.name} radius in km`}
        />
        km
      </label>
      <button
        role="switch"
        aria-checked={city.is_active}
        aria-label={`${city.name} active`}
        disabled={saving}
        onClick={() => patch({ is_active: !city.is_active }, city.is_active ? 'City paused' : 'City open')}
        className={`relative h-7 w-12 rounded-full transition ${city.is_active ? 'bg-primary' : 'bg-accent'}`}
      >
        <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-background transition-all ${city.is_active ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </li>
  );
};

const HostCitiesPage = () => {
  const { toast } = useToast();
  const [cities, setCities] = useState([]);
  const [demand, setDemand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(BLANK);
  const [saving, setSaving] = useState(false);
  const [locating, setLocating] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [c, d] = await Promise.all([getCities({ all: true }), getCityDemand().catch(() => [])]);
      setCities(Array.isArray(c) ? c : []);
      setDemand(Array.isArray(d) ? d : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: 'Location is not available in this browser', variant: 'destructive' });
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm((f) => ({ ...f, lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) }));
        setLocating(false);
      },
      () => {
        toast({ title: 'Could not read your location', description: 'Enter the coordinates by hand.', variant: 'destructive' });
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const submit = async (e) => {
    e.preventDefault();
    const lat = Number(form.lat);
    const lng = Number(form.lng);
    const radius = Number(form.radius_km);
    if (!form.name.trim()) return toast({ title: 'Name the city', variant: 'destructive' });
    if (form.lat === '' || form.lng === '' || !Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      return toast({ title: 'Enter valid coordinates', description: 'Latitude -90 to 90, longitude -180 to 180.', variant: 'destructive' });
    }
    if (!Number.isInteger(radius) || radius < 1 || radius > 500) return toast({ title: 'Radius must be 1 to 500 km', variant: 'destructive' });

    setSaving(true);
    try {
      const city = await createCity({ name: form.name.trim(), country: form.country.trim() || null, lat, lng, radius_km: radius, timezone: form.timezone });
      toast({ title: `${city.name} is open`, description: 'Members already waiting nearby were placed in it.' });
      setForm(BLANK);
      load();
    } catch (err) {
      toast({ title: 'Could not open the city', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <HostShell title="Cities">
      <Helmet><title>Cities | Mucho Gusto Host</title></Helmet>
      <div className="mg-page-wide">
        {loading ? (
          <div className="space-y-3">{[0, 1].map((i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-accent" />)}</div>
        ) : error ? (
          <div className="mg-card p-8 text-center">
            <p role="alert" className="text-sm text-destructive">{error}</p>
            <button className="mg-btn-ghost mt-4" onClick={() => { setLoading(true); load(); }}>Try again</button>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            <div className="space-y-6">
              <section>
                <h2 className="mb-3 text-xl">Your cities</h2>
                {cities.length === 0 ? (
                  <div className="mg-card p-8 text-center text-sm text-muted-foreground">No cities yet. Open your first one.</div>
                ) : (
                  <ul className="space-y-3">
                    {cities.map((c) => (
                      <CityRow key={c.id} city={c} onChanged={(u) => setCities((cur) => cur.map((x) => (x.id === u.id ? { ...x, ...u } : x)))} />
                    ))}
                  </ul>
                )}
                <p className="mt-2 text-xs text-muted-foreground">Active cities appear to members. Members are placed in the nearest active city within its radius.</p>
              </section>

              <section>
                <h2 className="mb-3 text-xl">Where members are waiting</h2>
                {demand.length === 0 ? (
                  <div className="mg-card p-6 text-sm text-muted-foreground">Nobody is waiting outside your cities right now.</div>
                ) : (
                  <ul className="space-y-2">
                    {demand.map((d) => (
                      <li key={`${d.lat}-${d.lng}`} className="mg-card flex items-center justify-between gap-3 p-4">
                        <span className="flex items-center gap-2 text-sm"><Users className="h-4 w-4 text-primary" />{d.members} member{d.members === 1 ? '' : 's'} near {Number(d.lat).toFixed(1)}, {Number(d.lng).toFixed(1)}</span>
                        <button
                          className="mg-btn-ghost px-4 py-1.5 text-xs"
                          onClick={() => { setForm((f) => ({ ...f, lat: Number(d.lat).toFixed(2), lng: Number(d.lng).toFixed(2) })); window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }); }}
                        >
                          Open a city here
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>

            <form onSubmit={submit} className="mg-card h-fit space-y-4 p-5" noValidate>
              <h2 className="text-xl">Open a new city</h2>
              <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">City</span>
                <input className="mg-input" value={form.name} onChange={set('name')} placeholder="Cartagena" /></label>
              <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">Country</span>
                <input className="mg-input" value={form.country} onChange={set('country')} placeholder="Colombia" /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">Latitude</span>
                  <input className="mg-input" inputMode="decimal" value={form.lat} onChange={set('lat')} /></label>
                <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">Longitude</span>
                  <input className="mg-input" inputMode="decimal" value={form.lng} onChange={set('lng')} /></label>
              </div>
              <button type="button" className="mg-btn-ghost w-full" onClick={useMyLocation} disabled={locating}>
                <Crosshair className="h-4 w-4" />{locating ? 'Locating' : 'Use my current location'}
              </button>
              <div className="grid grid-cols-2 gap-3">
                <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">Radius (km)</span>
                  <input className="mg-input" type="number" min="1" max="500" inputMode="numeric" value={form.radius_km} onChange={set('radius_km')} /></label>
                <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">Timezone</span>
                  <select className="mg-input" value={form.timezone} onChange={set('timezone')}>
                    {TIMEZONES.map((z) => <option key={z} value={z}>{z.replace('_', ' ')}</option>)}
                  </select></label>
              </div>
              <button type="submit" className="mg-btn w-full" disabled={saving}>{saving ? 'Opening' : 'Open city'}</button>
            </form>
          </div>
        )}
      </div>
    </HostShell>
  );
};

export default HostCitiesPage;
