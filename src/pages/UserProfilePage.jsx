import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ArrowLeft, User, MapPin, Calendar, Phone,
  Mail, MessageSquare, Send, EyeOff, Pencil, X, Camera, Check,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BlurToggleButton from '@/components/BlurToggleButton';
import { useAuth } from '@/contexts/AuthContext';
import { getBlurStatus } from '@/contexts/AuthContext';
import { getUser, getConversation, sendMessage, setUserBlur, adminUpdateUser, adminUploadUserPhoto } from '@/lib/apiClient';

const FIELDS = [
  { key: 'name',       label: 'Name',       type: 'text',   placeholder: 'Full name' },
  { key: 'instagram',  label: 'Instagram',  type: 'text',   placeholder: '@handle' },
  { key: 'phone',      label: 'Phone',      type: 'tel',    placeholder: '+1 555 000 0000' },
  { key: 'email',      label: 'Email',      type: 'email',  placeholder: 'email@example.com' },
  { key: 'city',       label: 'City',       type: 'text',   placeholder: 'City' },
  { key: 'age_range',  label: 'Age Range',  type: 'text',   placeholder: 'e.g. 25–34' },
  { key: 'bio',        label: 'Bio',        type: 'textarea', placeholder: 'Short bio...' },
  { key: 'hobbies',    label: 'Hobbies',    type: 'textarea', placeholder: 'Hobbies & interests...' },
];

const UserProfilePage = () => {
  const { userid } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdminAuthenticated } = useAuth();
  const photoInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    Promise.all([getUser(userid), getConversation(userid)])
      .then(([user, msgs]) => {
        setProfile(user);
        setMessages(msgs);
      })
      .catch(() => {
        toast({ title: 'User not found', variant: 'destructive' });
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [userid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startEdit = () => {
    setEditForm({
      name: profile.name || '',
      instagram: profile.instagram || '',
      phone: profile.phone || '',
      email: profile.email || '',
      city: profile.city || '',
      age_range: profile.age_range || '',
      bio: profile.bio || '',
      hobbies: profile.hobbies || '',
    });
    setEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await adminUpdateUser(userid, editForm);
      setProfile(updated);
      setEditing(false);
      toast({ title: 'Profile updated' });
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(true);
    try {
      const { user } = await adminUploadUserPhoto(userid, file);
      setProfile(user);
      toast({ title: 'Photo updated' });
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleBlurToggle = async (userId, newStatus) => {
    try {
      await setUserBlur(userId, newStatus);
      setProfile(prev => ({ ...prev, is_blurred: newStatus }));
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !profile) return;
    try {
      const msg = await sendMessage(profile.id, newMessage.trim());
      setMessages(prev => [...prev, msg]);
      setNewMessage('');
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f001a] luxury-text-accent">
      Loading profile...
    </div>
  );
  if (!profile) return null;

  const isBlurred = getBlurStatus(profile);

  return (
    <>
      <Helmet>
        <title>{isBlurred && !isAdminAuthenticated ? 'Anonymous User' : (profile.name || 'User')} | Profile</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-[#0f001a] relative z-10">
        <Header />

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">

            {/* Top bar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              {isAdminAuthenticated && (
                <div className="flex gap-2 items-center">
                  <BlurToggleButton
                    userId={profile.id}
                    isBlurred={!!profile.is_blurred}
                    onToggle={handleBlurToggle}
                    isAdmin={true}
                    adminStatus={profile.is_blurred}
                  />
                  {editing ? (
                    <button
                      onClick={() => setEditing(false)}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors"
                    >
                      <X className="w-4 h-4" /> Cancel
                    </button>
                  ) : (
                    <button
                      onClick={startEdit}
                      className="luxury-button flex items-center gap-1.5 px-4 py-2 text-sm"
                    >
                      <Pencil className="w-4 h-4" /> Edit Profile
                    </button>
                  )}
                </div>
              )}
            </div>

            {!isAdminAuthenticated && isBlurred && (
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4 flex items-center gap-3 text-[#F1E5AC]">
                <EyeOff className="w-5 h-5 text-[#D4AF37]" />
                <p className="text-sm">This profile is anonymized based on privacy settings.</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Left: Profile card / Edit form */}
              <div className="lg:col-span-1 space-y-6">
                {editing ? (
                  <div className="luxury-card p-6">
                    <h2 className="text-lg font-bold text-[#FFFDD0] mb-5">Edit Profile</h2>

                    {/* Photo upload */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-[rgba(15,0,26,0.9)] border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center">
                          {profile.photo_url
                            ? <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                            : <User className="w-12 h-12 text-[#D4AF37]" />
                          }
                        </div>
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center hover:bg-[#F1E5AC] transition-colors disabled:opacity-50"
                        >
                          {uploadingPhoto ? (
                            <span className="text-[#0f001a] text-[10px] font-bold">...</span>
                          ) : (
                            <Camera className="w-4 h-4 text-[#0f001a]" />
                          )}
                        </button>
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePhotoChange}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">Click camera to change photo</p>
                    </div>

                    <form onSubmit={handleSave} className="space-y-4">
                      {FIELDS.map(f => (
                        <div key={f.key}>
                          <label className="text-xs text-muted-foreground uppercase tracking-wider block mb-1">{f.label}</label>
                          {f.type === 'textarea' ? (
                            <textarea
                              rows={3}
                              placeholder={f.placeholder}
                              value={editForm[f.key] || ''}
                              onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                              className="luxury-input w-full resize-none"
                            />
                          ) : (
                            <input
                              type={f.type}
                              placeholder={f.placeholder}
                              value={editForm[f.key] || ''}
                              onChange={e => setEditForm(p => ({ ...p, [f.key]: e.target.value }))}
                              className="luxury-input w-full"
                            />
                          )}
                        </div>
                      ))}
                      <button
                        type="submit"
                        disabled={saving}
                        className="luxury-button w-full flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="luxury-card overflow-hidden">
                    <div className="p-6 bg-gradient-to-b from-[rgba(212,175,55,0.1)] to-transparent border-b border-[#D4AF37]/20 flex flex-col items-center text-center">
                      <div className={`w-24 h-24 rounded-full bg-[rgba(15,0,26,0.9)] border-2 border-[#D4AF37] flex items-center justify-center mb-4 overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.3)] ${isBlurred && !isAdminAuthenticated ? 'blur-[12px]' : ''}`}>
                        {profile.photo_url
                          ? <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                          : <User className="w-12 h-12 text-[#D4AF37]" />
                        }
                      </div>
                      <h1 className={`text-2xl font-bold text-[#FFFDD0] ${isBlurred && !isAdminAuthenticated ? 'blur-md select-none' : ''}`}>
                        {profile.name || 'Anonymous User'}
                      </h1>
                      <p className={`text-[#D4AF37] font-mono mt-1 ${isBlurred && !isAdminAuthenticated ? 'blur-md select-none' : ''}`}>
                        @{profile.instagram || 'hidden'}
                      </p>
                    </div>

                    <div className={`p-6 space-y-4 ${isBlurred && !isAdminAuthenticated ? 'blur-md select-none' : ''}`}>
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Info</h3>
                      <div className="flex items-center gap-3 text-sm text-[#FFFDD0]">
                        <Phone className="w-4 h-4 text-[#D4AF37]" />
                        <span>{profile.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#FFFDD0]">
                        <Mail className="w-4 h-4 text-[#D4AF37]" />
                        <span>{profile.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#FFFDD0]">
                        <MapPin className="w-4 h-4 text-[#D4AF37]" />
                        <span>{profile.city || 'Not provided'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#FFFDD0]">
                        <Calendar className="w-4 h-4 text-[#D4AF37]" />
                        <span>Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>

                      {(profile.bio || profile.hobbies || profile.age_range) && (
                        <>
                          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider pt-2">About</h3>
                          {profile.bio && (
                            <div>
                              <span className="text-xs text-[#D4AF37] block mb-1">Bio</span>
                              <p className="text-sm luxury-text-accent leading-relaxed">{profile.bio}</p>
                            </div>
                          )}
                          {profile.hobbies && (
                            <div>
                              <span className="text-xs text-[#D4AF37] block mb-1">Hobbies</span>
                              <p className="text-sm luxury-text-accent">{profile.hobbies}</p>
                            </div>
                          )}
                          {profile.age_range && (
                            <div>
                              <span className="text-xs text-[#D4AF37] block mb-1">Age Range</span>
                              <p className="text-sm luxury-text-accent">{profile.age_range}</p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right: Chat (admin only) */}
              {isAdminAuthenticated && (
                <div className="lg:col-span-2">
                  <div className="luxury-card h-[600px] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[#D4AF37]/30 bg-[rgba(15,0,26,0.95)] flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="font-bold text-[#FFFDD0]">Message {profile.name || 'User'}</h3>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto bg-[#0f001a]/50 space-y-4">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                          <MessageSquare className="w-12 h-12 text-[#D4AF37]" />
                          <p>Start a conversation with {profile.name || 'this user'}</p>
                        </div>
                      ) : (
                        messages.map(msg => {
                          const isAdmin = !!msg.from_admin_id;
                          return (
                            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-2xl p-4 ${
                                isAdmin
                                  ? 'bg-[#2D1B4E] border border-[#D4AF37]/50 text-[#FFFDD0] rounded-tr-none shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                  : 'bg-[rgba(212,175,55,0.12)] border border-[#D4AF37]/20 text-[#FFFDD0] rounded-tl-none'
                              }`}>
                                {!isAdmin && <p className="text-[10px] text-[#D4AF37]/70 mb-1 font-medium uppercase tracking-wider">Member</p>}
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <p className={`text-[10px] mt-2 text-right ${isAdmin ? 'text-[#D4AF37]/70' : 'text-muted-foreground'}`}>
                                  {formatTime(msg.created_at)}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 bg-[rgba(15,0,26,0.95)] border-t border-[#D4AF37]/30">
                      <form onSubmit={handleSendMessage} className="flex gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          placeholder="Type your message..."
                          className="luxury-input flex-1 bg-[rgba(0,0,0,0.2)]"
                        />
                        <button
                          type="submit"
                          disabled={!newMessage.trim()}
                          className="luxury-button px-6 flex items-center justify-center disabled:opacity-50"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfilePage;
