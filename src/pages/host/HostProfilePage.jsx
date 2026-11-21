import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import { Copy, Camera } from 'lucide-react';
import HostShell from '@/components/shell/HostShell';
import { useToast } from '@/hooks/use-toast';
import { getHostMe, updateHostMe, uploadEventMedia } from '@/lib/apiClient';

const cleanHandle = (v) => v.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 40);

const HostProfilePage = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ display_name: '', handle: '', tagline: '', photo_url: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [handleError, setHandleError] = useState('');

  useEffect(() => {
    getHostMe()
      .then((me) => setForm({
        display_name: me.display_name || me.name || '',
        handle: me.handle || '',
        tagline: me.tagline || '',
        photo_url: me.photo_url || '',
      }))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const publicUrl = form.handle ? `${window.location.origin}/h/${form.handle}` : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      toast({ title: 'Link copied' });
    } catch {
      toast({ title: 'Copy failed', description: publicUrl, variant: 'destructive' });
    }
  };

  const pickPhoto = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadEventMedia(file);
      await updateHostMe({ photo_url: url });
      setForm((f) => ({ ...f, photo_url: url }));
      toast({ title: 'Photo updated' });
    } catch (e) {
      toast({ title: 'Upload failed', description: e.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setHandleError('');
    if (form.handle && form.handle.length < 3) { setHandleError('Use at least 3 characters'); return; }
    setSaving(true);
    try {
      const updated = await updateHostMe({ display_name: form.display_name.trim() || null, handle: form.handle || null, tagline: form.tagline.trim() || null });
      setForm((f) => ({ ...f, handle: updated.handle || f.handle }));
      toast({ title: 'Profile saved' });
    } catch (err) {
      if (/taken/i.test(err.message)) setHandleError('Handle taken');
      else toast({ title: 'Could not save', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <HostShell title="Your host profile">
      <Helmet><title>Host profile | Mucho Gusto Host</title></Helmet>
      <div className="mg-page">
        {loading ? (
          <div className="h-80 animate-pulse rounded-2xl bg-accent" />
        ) : error ? (
          <div className="mg-card p-8 text-center"><p role="alert" className="text-sm text-destructive">{error}</p></div>
        ) : (
          <form onSubmit={save} className="mg-card space-y-5 p-5" noValidate>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-accent">
                {form.photo_url ? <img src={form.photo_url} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center font-display text-2xl text-muted-foreground">{(form.display_name || '?')[0]}</div>}
              </div>
              <label className="mg-btn-ghost cursor-pointer">
                <Camera className="h-4 w-4" />{uploading ? 'Uploading' : 'Change photo'}
                <input type="file" accept="image/*" className="sr-only" disabled={uploading} onChange={(e) => { pickPhoto(e.target.files?.[0]); e.target.value = ''; }} />
              </label>
            </div>

            <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">Name guests see</span>
              <input className="mg-input" value={form.display_name} onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))} /></label>

            <div className="space-y-1.5">
              <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">Handle</span>
                <input className="mg-input" value={form.handle} onChange={(e) => { setHandleError(''); setForm((f) => ({ ...f, handle: cleanHandle(e.target.value) })); }} placeholder="yourname" autoCapitalize="none" autoCorrect="off" /></label>
              {handleError && <p role="alert" className="text-xs text-destructive">{handleError}</p>}
              {publicUrl ? (
                <div className="flex items-center justify-between gap-2 rounded-xl border border-border px-3 py-2 text-sm">
                  <span className="truncate text-muted-foreground">{publicUrl}</span>
                  <button type="button" onClick={copy} className="flex shrink-0 items-center gap-1 text-primary"><Copy className="h-3.5 w-3.5" />Copy</button>
                </div>
              ) : <p className="text-xs text-muted-foreground">Letters, numbers and underscores. This becomes your public page.</p>}
            </div>

            <label className="block space-y-1.5"><span className="text-sm text-muted-foreground">Tagline</span>
              <textarea rows={2} className="mg-input" value={form.tagline} onChange={(e) => setForm((f) => ({ ...f, tagline: e.target.value.slice(0, 160) }))} placeholder="Rooftops, good music, a short list." /></label>

            <button type="submit" className="mg-btn w-full" disabled={saving}>{saving ? 'Saving' : 'Save profile'}</button>
            <Link to="/admin-dashboard" className="block text-center text-sm text-muted-foreground hover:text-foreground">Members, messages and legacy admin tools</Link>
          </form>
        )}
      </div>
    </HostShell>
  );
};

export default HostProfilePage;
