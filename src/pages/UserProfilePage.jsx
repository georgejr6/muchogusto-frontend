import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import {
  ArrowLeft, User, MapPin, Calendar, Phone,
  Mail, MessageSquare, Trash2, Send, Clock, EyeOff,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import BlurToggleButton from '@/components/BlurToggleButton';
import { useAuth } from '@/contexts/AuthContext';
import { getBlurStatus } from '@/contexts/AuthContext';
import { getUser, getConversation, sendMessage, setUserBlur } from '@/lib/apiClient';

const UserProfilePage = () => {
  const { userid } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdminAuthenticated } = useAuth();

  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    Promise.all([
      getUser(userid),
      getConversation(userid),
    ])
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

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f001a] luxury-text-accent">
      Loading profile...
    </div>
  );
  if (!profile) return null;

  const isBlurred = profile.is_blurred || profile.user_blur_preference;

  return (
    <>
      <Helmet>
        <title>{isBlurred && !isAdminAuthenticated ? 'Anonymous User' : profile.name} | User Profile</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-[#0f001a] relative z-10">
        <Header />

        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">

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
                </div>
              )}
            </div>

            {!isAdminAuthenticated && isBlurred && (
              <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-lg p-4 flex items-center gap-3 text-[#F1E5AC]">
                <EyeOff className="w-5 h-5 text-[#D4AF37]" />
                <p className="text-sm">This profile is currently blurred and anonymized based on privacy settings.</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              <div className="lg:col-span-1 space-y-6">
                <div className="luxury-card overflow-hidden">
                  <div className="p-6 bg-gradient-to-b from-[rgba(212,175,55,0.1)] to-transparent border-b border-[#D4AF37]/20 flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-full bg-[rgba(15,0,26,0.9)] border-2 border-[#D4AF37] flex items-center justify-center mb-4 overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.3)] ${isBlurred && !isAdminAuthenticated ? 'blur-[12px]' : ''}`}>
                      {profile.photo_url ? (
                        <img src={profile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-[#D4AF37]" />
                      )}
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
                      <span>{profile.city || 'Location not provided'}</span>
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
              </div>

              {isAdminAuthenticated && (
                <div className="lg:col-span-2">
                  <div className="luxury-card h-[600px] flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-[#D4AF37]/30 bg-[rgba(15,0,26,0.95)] flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="font-bold text-[#FFFDD0]">Direct Message with {profile.name}</h3>
                    </div>

                    <div className="flex-1 p-6 overflow-y-auto bg-[#0f001a]/50 space-y-4">
                      {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2 opacity-50">
                          <MessageSquare className="w-12 h-12 text-[#D4AF37]" />
                          <p>Start a conversation with {profile.name}</p>
                        </div>
                      ) : (
                        messages.map(msg => {
                          const isAdmin = !!msg.from_admin_id;
                          return (
                            <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[70%] rounded-2xl p-4 ${
                                isAdmin
                                  ? 'bg-[#2D1B4E] border border-[#D4AF37]/50 text-[#FFFDD0] rounded-tr-none shadow-[0_0_15px_rgba(212,175,55,0.1)]'
                                  : 'bg-[rgba(255,255,255,0.1)] border border-white/10 text-[#FFFDD0] rounded-tl-none'
                              }`}>
                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                <p className={`text-[10px] mt-2 ${isAdmin ? 'text-[#D4AF37]/70 text-right' : 'text-muted-foreground'}`}>
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
                          onChange={(e) => setNewMessage(e.target.value)}
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
