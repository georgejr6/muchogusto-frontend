import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Edit2, Trash2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import RSVPTrackingModal from './RSVPTrackingModal';
import { useTranslation } from '@/lib/i18n.jsx';
import { getEvents, getEvent, getUsers, createEvent, updateEvent, deleteEvent } from '@/lib/apiClient';

const EventManagement = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('manage');
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    date: '',
    time: '',
    location: '',
    description: '',
    visibility: 'public',
    invitedUsers: [],
  });

  const [selectedEventForRSVP, setSelectedEventForRSVP] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsData, usersData] = await Promise.all([getEvents(), getUsers()]);
        setEvents(eventsData);
        setUsers(usersData);
      } catch (err) {
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

  const resetForm = () => setFormData({ id: '', name: '', date: '', time: '', location: '', description: '', visibility: 'public', invitedUsers: [] });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.time || !formData.location || !formData.description) {
      toast({ title: t('val.required'), variant: 'destructive' });
      return;
    }

    const isEdit = !!formData.id;
    try {
      let saved;
      if (isEdit) {
        saved = await updateEvent(formData.id, formData);
        setEvents(prev => prev.map(ev => ev.id === saved.id ? { ...ev, ...saved, invitedUsers: formData.invitedUsers } : ev));
      } else {
        saved = await createEvent(formData);
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

  if (loading) return <div className="text-center py-12 luxury-text-accent">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex border-b border-[#D4AF37]/30">
        <button
          onClick={() => setActiveTab('manage')}
          className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'manage' ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-[#FFFDD0]'}`}
        >
          {t('events.manage')}
          {activeTab === 'manage' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
        </button>
        <button
          onClick={() => { resetForm(); setActiveTab('create'); }}
          className={`px-6 py-3 font-semibold transition-colors relative ${activeTab === 'create' ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-[#FFFDD0]'}`}
        >
          {formData.id ? t('events.edit') : t('events.create')}
          {activeTab === 'create' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
        </button>
      </div>

      {/* CREATE / EDIT TAB */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className="luxury-card p-6 space-y-6 animate-in fade-in duration-300">
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

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#FFFDD0]">Visibility</label>
            <select name="visibility" value={formData.visibility} onChange={handleInputChange} className="luxury-input appearance-none bg-[rgba(15,0,26,0.9)]">
              <option value="public">Public — visible to everyone</option>
              <option value="members_only">Members Only — logged-in users</option>
              <option value="invited_only">Invited Only — invited users only</option>
            </select>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-[#FFFDD0]">{t('events.invite')} ({formData.invitedUsers.length} {t('events.selected')})</label>
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
                      className="w-4 h-4 rounded border-[#D4AF37] text-[#D4AF37] bg-transparent focus:ring-[#D4AF37] accent-[#D4AF37]"
                    />
                    <span className="text-[#FFFDD0] text-sm">@{user.instagram || 'unknown'} <span className="text-muted-foreground text-xs ml-2 blur-[4px]">{user.name}</span></span>
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

      {/* MANAGE TAB */}
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

                    <h3 className="text-xl font-bold text-[#FFFDD0] mb-3 pr-20">{event.name}</h3>
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

                    <button
                      onClick={async () => {
                        try { setSelectedEventForRSVP(await getEvent(event.id)); }
                        catch { setSelectedEventForRSVP(event); }
                      }}
                      className="luxury-button-outline w-full py-2 flex items-center justify-center gap-2"
                    >
                      <Eye className="w-4 h-4" /> {t('events.view_rsvps')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
