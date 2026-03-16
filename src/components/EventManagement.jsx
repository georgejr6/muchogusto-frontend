import React, { useState, useEffect, useRef } from 'react';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Eye, Youtube, Image, X, Link, Mail, Send, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RSVPTrackingModal from './RSVPTrackingModal';
import { useTranslation } from '@/lib/i18n.jsx';
import {
  getEvents, getEvent, getUsers, createEvent, updateEvent, deleteEvent,
  uploadEventMedia, sendInvitationEmail,
} from '@/lib/apiClient';

const VISIBILITY_OPTIONS = [
  { value: 'public',      label: 'Public',      desc: 'Visible to everyone, shareable link enabled' },
  { value: 'invite_only', label: 'Invite Only',  desc: 'Invited members only, but they can share the link' },
  { value: 'private',     label: 'Private',      desc: 'Selected members only — no share link, no external invites' },
];

const REMINDER_OPTIONS = [
  { value: '',  label: 'No reminders' },
  { value: '1', label: 'Every day' },
  { value: '3', label: 'Every 3 days' },
  { value: '7', label: 'Every week' },
];

function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/);
  return match ? match[1] : null;
}

const emptyForm = {
  id: '',
  name: '',
  date: '',
  time: '',
  location: '',
  description: '',
  visibility: 'public',
  invitedUsers: [],
  media: [],
  reminder_frequency_days: '',
};

const EventManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('manage');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [selectedEventForRSVP, setSelectedEventForRSVP] = useState(null);
  const [youtubeInput, setYoutubeInput] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const imageInputRef = useRef(null);

  // Email tab state
  const [emailForm, setEmailForm] = useState({ subject: '', body: '', eventId: '', userIds: [] });
  const [emailSending, setEmailSending] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsData, usersData] = await Promise.all([getEvents(), getUsers()]);
        setEvents(eventsData);
        setUsers(usersData);
      } catch {
        toast({ title: 'Failed to load data', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSelect = (userId) => {
    setFormData(prev => ({
      ...prev,
      invitedUsers: prev.invitedUsers.includes(userId)
        ? prev.invitedUsers.filter(id => id !== userId)
        : [...prev.invitedUsers, userId],
    }));
  };

  const selectAllUsers = () => setFormData(prev => ({ ...prev, invitedUsers: users.map(u => u.id) }));
  const clearUserSelection = () => setFormData(prev => ({ ...prev, invitedUsers: [] }));
  const resetForm = () => setFormData(emptyForm);

  // ── Media helpers ────────────────────────────────────────────────────────────

  const addYouTube = () => {
    const videoId = extractYouTubeId(youtubeInput.trim());
    if (!videoId) {
      toast({ title: 'Invalid YouTube URL', variant: 'destructive' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      media: [...prev.media, { type: 'youtube', videoId, url: youtubeInput.trim() }],
    }));
    setYoutubeInput('');
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageUploading(true);
    try {
      const { url } = await uploadEventMedia(file);
      setFormData(prev => ({
        ...prev,
        media: [...prev.media, { type: 'image', url }],
      }));
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  const removeMedia = (idx) => {
    setFormData(prev => ({ ...prev, media: prev.media.filter((_, i) => i !== idx) }));
  };

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time || !formData.location || !formData.description) {
      toast({ title: t('val.required'), variant: 'destructive' });
      return;
    }

    const payload = {
      ...formData,
      reminder_frequency_days: formData.reminder_frequency_days ? parseInt(formData.reminder_frequency_days) : null,
    };

    const isEdit = !!formData.id;
    try {
      let saved;
      if (isEdit) {
        saved = await updateEvent(formData.id, payload);
        setEvents(prev => prev.map(ev => ev.id === saved.id ? { ...ev, ...saved, invitedUsers: formData.invitedUsers } : ev));
      } else {
        saved = await createEvent(payload);
        setEvents(prev => [saved, ...prev]);
      }
      toast({ title: isEdit ? t('events.updated_msg') : t('events.created_msg') });
      resetForm();
      setActiveTab('manage');
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const handleEdit = (event) => {
    setFormData({
      id: event.id,
      name: event.name,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
      time: event.time || '',
      location: event.location || '',
      description: event.description || '',
      visibility: event.visibility || 'public',
      invitedUsers: event.invitedUsers || [],
      media: event.media || [],
      reminder_frequency_days: event.reminder_frequency_days ? String(event.reminder_frequency_days) : '',
    });
    setActiveTab('create');
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('events.delete_confirm'))) return;
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(ev => ev.id !== id));
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  // ── Copy share link ──────────────────────────────────────────────────────────

  const copyShareLink = (shareToken) => {
    const url = `${window.location.origin}/e/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedToken(shareToken);
      setTimeout(() => setCopiedToken(null), 2000);
    });
  };

  // ── Email send ───────────────────────────────────────────────────────────────

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailForm.subject || !emailForm.body || emailForm.userIds.length === 0) {
      toast({ title: 'Subject, body, and at least one recipient are required', variant: 'destructive' });
      return;
    }
    setEmailSending(true);
    try {
      const result = await sendInvitationEmail({
        subject: emailForm.subject,
        body: emailForm.body,
        userIds: emailForm.userIds,
        eventId: emailForm.eventId || null,
      });
      toast({ title: `Sent ${result.sent} email(s)${result.failed > 0 ? ` (${result.failed} failed — no email on file)` : ''}` });
      setEmailForm({ subject: '', body: '', eventId: '', userIds: [] });
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setEmailSending(false);
    }
  };

  const toggleEmailUser = (userId) => {
    setEmailForm(prev => ({
      ...prev,
      userIds: prev.userIds.includes(userId)
        ? prev.userIds.filter(id => id !== userId)
        : [...prev.userIds, userId],
    }));
  };

  if (loading) return <div className="text-center py-12 luxury-text-accent">Loading...</div>;

  const tabs = [
    { id: 'manage', label: t('events.manage') },
    { id: 'create', label: formData.id ? t('events.edit') : t('events.create') },
    { id: 'email',  label: 'Send Email' },
  ];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-[#D4AF37]/30">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => { if (tab.id !== 'create') resetForm(); setActiveTab(tab.id); }}
            className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === tab.id ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-[#FFFDD0]'}`}
          >
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
          </button>
        ))}
      </div>

      {/* ── CREATE / EDIT TAB ────────────────────────────────────────────────── */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="luxury-card p-6 space-y-6 animate-in fade-in duration-300">

          {/* Basic fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#FFFDD0]">{t('events.name')}</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="luxury-input" placeholder={t('events.name_ph')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#FFFDD0]">{t('events.location')}</label>
              <input type="text" name="location" value={formData.location} onChange={handleInputChange} className="luxury-input" placeholder={t('events.location_ph')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#FFFDD0]">{t('events.date')}</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} className="luxury-input [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#FFFDD0]">{t('events.time')}</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="luxury-input [color-scheme:dark]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFDD0]">{t('events.desc')}</label>
            <textarea name="description" value={formData.description} onChange={handleInputChange} className="luxury-input min-h-[100px]" placeholder={t('events.desc_ph')} />
          </div>

          {/* Visibility */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFDD0]">Visibility</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {VISIBILITY_OPTIONS.map(opt => (
                <label key={opt.value} className={`flex flex-col gap-1 p-3 border rounded-lg cursor-pointer transition-colors
                  ${formData.visibility === opt.value
                    ? 'border-[#D4AF37] bg-[rgba(212,175,55,0.1)]'
                    : 'border-[#D4AF37]/30 hover:border-[#D4AF37]/60'}`}>
                  <span className="flex items-center gap-2">
                    <input
                      type="radio" name="visibility" value={opt.value}
                      checked={formData.visibility === opt.value}
                      onChange={handleInputChange}
                      className="accent-[#D4AF37]"
                    />
                    <span className="text-[#FFFDD0] font-medium text-sm">{opt.label}</span>
                  </span>
                  <span className="text-xs text-muted-foreground pl-5">{opt.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Reminder frequency */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFDD0]">RSVP Reminder Frequency</label>
            <select name="reminder_frequency_days" value={formData.reminder_frequency_days} onChange={handleInputChange}
              className="luxury-input appearance-none bg-[rgba(15,0,26,0.9)]">
              {REMINDER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <p className="text-xs text-muted-foreground">
              Reminders stop once the event ends. A recap / feedback email is sent automatically after.
            </p>
          </div>

          {/* Media */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#FFFDD0]">Media</label>

            {/* YouTube embed */}
            <div className="flex gap-2">
              <input
                type="text" value={youtubeInput} onChange={e => setYoutubeInput(e.target.value)}
                placeholder="Paste YouTube URL..."
                className="luxury-input flex-1"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addYouTube())}
              />
              <button type="button" onClick={addYouTube}
                className="luxury-button-outline px-4 py-2 flex items-center gap-2 whitespace-nowrap">
                <Youtube className="w-4 h-4" /> Add Video
              </button>
            </div>

            {/* Image upload */}
            <div>
              <input type="file" accept="image/*" ref={imageInputRef} onChange={handleImageUpload} className="hidden" />
              <button type="button" onClick={() => imageInputRef.current?.click()}
                disabled={imageUploading}
                className="luxury-button-outline px-4 py-2 flex items-center gap-2">
                <Image className="w-4 h-4" />
                {imageUploading ? 'Uploading...' : 'Upload Image'}
              </button>
            </div>

            {/* Media preview */}
            {formData.media.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
                {formData.media.map((item, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-[#D4AF37]/30 bg-[rgba(15,0,26,0.5)]">
                    {item.type === 'youtube' ? (
                      <div className="aspect-video flex flex-col items-center justify-center gap-1 p-2">
                        <Youtube className="w-8 h-8 text-red-500" />
                        <span className="text-xs text-muted-foreground text-center truncate w-full px-1">
                          {item.videoId}
                        </span>
                      </div>
                    ) : (
                      <img src={item.url} alt="" className="aspect-video w-full object-cover" />
                    )}
                    <button
                      type="button" onClick={() => removeMedia(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invited users */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#FFFDD0]">
                {t('events.invite')} ({formData.invitedUsers.length} {t('events.selected')})
              </label>
              <div className="space-x-2">
                <button type="button" onClick={selectAllUsers} className="text-xs text-[#D4AF37] hover:underline">{t('events.select_all')}</button>
                <span className="text-muted-foreground">|</span>
                <button type="button" onClick={clearUserSelection} className="text-xs text-muted-foreground hover:text-[#FFFDD0]">{t('events.clear')}</button>
              </div>
            </div>
            <div className="border border-[#D4AF37]/30 rounded-lg max-h-48 overflow-y-auto bg-[rgba(15,0,26,0.5)] p-2">
              {users.length === 0 ? (
                <p className="text-muted-foreground text-sm p-2">{t('events.no_users')}</p>
              ) : (
                users.map(user => (
                  <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-[rgba(212,175,55,0.1)] rounded cursor-pointer transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.invitedUsers.includes(user.id)}
                      onChange={() => handleUserSelect(user.id)}
                      className="w-4 h-4 rounded border-[#D4AF37] accent-[#D4AF37]"
                    />
                    <span className="text-[#FFFDD0] text-sm">
                      @{user.instagram || 'unknown'}
                      <span className="text-muted-foreground text-xs ml-2 blur-[4px]">{user.name}</span>
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>

          <button type="submit" className="luxury-button w-full md:w-auto px-8 py-3">
            {formData.id ? t('events.save') : t('events.btn_create')}
          </button>
        </form>
      )}

      {/* ── MANAGE TAB ───────────────────────────────────────────────────────── */}
      {activeTab === 'manage' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {events.length === 0 ? (
            <div className="luxury-card p-12 text-center text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{t('events.no_events')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {events.sort((a, b) => new Date(b.date) - new Date(a.date)).map(event => {
                const rsvps = event.rsvps || [];
                const interested = rsvps.filter(r => r.status === 'interested').length;
                const totalInvited = (event.invitedUsers || []).length;
                const visLabel = VISIBILITY_OPTIONS.find(v => v.value === event.visibility)?.label || event.visibility;

                return (
                  <div key={event.id} className="luxury-card p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(event)} className="p-2 bg-[rgba(15,0,26,0.8)] border border-[#D4AF37]/50 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0f001a] transition-all" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(event.id)} className="p-2 bg-[rgba(15,0,26,0.8)] border border-red-500/50 rounded-lg text-red-400 hover:bg-red-500 hover:text-white transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-start gap-2 mb-1 pr-20">
                      <h3 className="text-xl font-bold text-[#FFFDD0] flex-1">{event.name}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap
                        ${event.visibility === 'public' ? 'border-green-500/40 text-green-400' :
                          event.visibility === 'invite_only' ? 'border-[#D4AF37]/40 text-[#D4AF37]' :
                          'border-red-500/40 text-red-400'}`}>
                        {visLabel}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm luxury-text-accent">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        <span>{new Date(event.date).toLocaleDateString()} at {event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#D4AF37]" />
                        <span>{totalInvited} {t('events.invited')} • {interested} {t('events.going')}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={async () => {
                          try { setSelectedEventForRSVP(await getEvent(event.id)); }
                          catch { setSelectedEventForRSVP(event); }
                        }}
                        className="luxury-button-outline flex-1 py-2 flex items-center justify-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" /> {t('events.view_rsvps')}
                      </button>

                      {event.share_token && (
                        <button
                          onClick={() => copyShareLink(event.share_token)}
                          className="px-3 py-2 border border-[#D4AF37]/40 rounded-lg text-[#D4AF37] hover:bg-[rgba(212,175,55,0.1)] transition-colors flex items-center gap-1 text-sm"
                          title="Copy share link"
                        >
                          {copiedToken === event.share_token ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── EMAIL TAB ────────────────────────────────────────────────────────── */}
      {activeTab === 'email' && (
        <form onSubmit={handleSendEmail} className="luxury-card p-6 space-y-6 animate-in fade-in duration-300">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#FFFDD0]">Send Email Invitation</h3>
            <p className="text-sm text-muted-foreground">Compose and send a custom email to selected members via Resend.</p>
          </div>

          {/* Link to event (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFDD0]">Link to Event <span className="text-muted-foreground font-normal">(optional)</span></label>
            <select
              value={emailForm.eventId}
              onChange={e => setEmailForm(prev => ({ ...prev, eventId: e.target.value }))}
              className="luxury-input appearance-none bg-[rgba(15,0,26,0.9)]"
            >
              <option value="">— No event —</option>
              {events.map(ev => (
                <option key={ev.id} value={ev.id}>{ev.name} — {new Date(ev.date).toLocaleDateString()}</option>
              ))}
            </select>
            {emailForm.eventId && (() => {
              const ev = events.find(e => e.id === emailForm.eventId);
              return ev?.share_token ? (
                <p className="text-xs text-[#D4AF37]">A "View Event" button will be included in the email.</p>
              ) : null;
            })()}
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFDD0]">Subject</label>
            <input
              type="text" value={emailForm.subject}
              onChange={e => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
              className="luxury-input" placeholder="You're invited to something special..."
            />
          </div>

          {/* Body */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFDD0]">Message</label>
            <textarea
              value={emailForm.body}
              onChange={e => setEmailForm(prev => ({ ...prev, body: e.target.value }))}
              className="luxury-input min-h-[160px]"
              placeholder="Write your invitation message here..."
            />
          </div>

          {/* Recipients */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#FFFDD0]">
                Recipients ({emailForm.userIds.length} selected)
              </label>
              <div className="space-x-2">
                <button type="button" onClick={() => setEmailForm(prev => ({ ...prev, userIds: users.map(u => u.id) }))}
                  className="text-xs text-[#D4AF37] hover:underline">Select All</button>
                <span className="text-muted-foreground">|</span>
                <button type="button" onClick={() => setEmailForm(prev => ({ ...prev, userIds: [] }))}
                  className="text-xs text-muted-foreground hover:text-[#FFFDD0]">Clear</button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Only members with an email address on file will receive the email.</p>
            <div className="border border-[#D4AF37]/30 rounded-lg max-h-48 overflow-y-auto bg-[rgba(15,0,26,0.5)] p-2">
              {users.map(user => (
                <label key={user.id} className="flex items-center space-x-3 p-2 hover:bg-[rgba(212,175,55,0.1)] rounded cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={emailForm.userIds.includes(user.id)}
                    onChange={() => toggleEmailUser(user.id)}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <span className="text-[#FFFDD0] text-sm">
                    @{user.instagram || 'unknown'}
                    <span className="text-muted-foreground text-xs ml-2 blur-[4px]">{user.name}</span>
                    {user.email && <span className="text-green-400 text-xs ml-2">✓ email</span>}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={emailSending} className="luxury-button w-full md:w-auto px-8 py-3 flex items-center gap-2">
            <Send className="w-4 h-4" />
            {emailSending ? 'Sending...' : `Send to ${emailForm.userIds.length} recipient${emailForm.userIds.length !== 1 ? 's' : ''}`}
          </button>
        </form>
      )}

      {selectedEventForRSVP && (
        <RSVPTrackingModal
          event={selectedEventForRSVP}
          onClose={() => setSelectedEventForRSVP(null)}
        />
      )}
    </div>
  );
};

export default EventManagement;
