import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, Calendar, MapPin, Clock, Users, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import RSVPCard from '@/components/RSVPCard';
import Header from '@/components/Header';
import { getEvent, setUserBlur } from '@/lib/apiClient';

const EventPage = () => {
  const { eventname } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdminAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvent(eventname)
      .then(setEvent)
      .catch(() => {
        toast({ title: 'Event not found', variant: 'destructive' });
        navigate('/');
      })
      .finally(() => setLoading(false));
  }, [eventname]);

  const handleBlurToggle = async (userId, newStatus) => {
    try {
      await setUserBlur(userId, newStatus);
      setEvent(prev => ({
        ...prev,
        rsvps: prev.rsvps.map(r =>
          r.userId === userId ? { ...r, user: { ...r.user, is_blurred: newStatus, admin_blur_status: newStatus } } : r
        ),
      }));
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f001a] luxury-text-accent">
      Loading event...
    </div>
  );
  if (!event) return null;

  const rsvps = event.rsvps || [];
  const interested = rsvps.filter(r => r.status === 'interested').length;
  const notInterested = rsvps.filter(r => r.status === 'not_interested').length;
  const totalInvited = (event.invitedUsers || []).length;
  const pending = totalInvited - (interested + notInterested);

  const interestedPct = totalInvited > 0 ? Math.round((interested / totalInvited) * 100) : 0;
  const notInterestedPct = totalInvited > 0 ? Math.round((notInterested / totalInvited) * 100) : 0;
  const pendingPct = totalInvited > 0 ? Math.round((pending / totalInvited) * 100) : 0;

  const attendees = rsvps.filter(r => r.status === 'interested').map(r => ({
    ...r.user,
    rsvpStatus: r.status,
    rsvpDate: r.date,
  }));

  return (
    <>
      <Helmet>
        <title>{event.name} | Event Details</title>
      </Helmet>

      <div className="min-h-screen flex flex-col bg-[#0f001a] relative z-10">
        <Header />

        <div className="flex-1 p-4 md:p-8 w-full">
          <div className="max-w-5xl mx-auto space-y-6">

            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              {isAdminAuthenticated && (
                <button
                  onClick={() => navigate('/admin-dashboard')}
                  className="text-sm text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  Manage Event <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Info */}
              <div className="lg:col-span-2 space-y-6">
                <div className="luxury-card overflow-hidden">
                  <div className="h-48 bg-gradient-to-r from-[#2D1B4E] to-[rgba(212,175,55,0.3)] border-b border-[#D4AF37]/30 flex items-center justify-center">
                    <Calendar className="w-16 h-16 text-[#D4AF37]/50" />
                  </div>

                  <div className="p-8">
                    <h1 className="text-3xl font-bold text-[#FFFDD0] mb-6">{event.name}</h1>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="flex items-center gap-3 text-sm luxury-text-accent">
                        <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-lg">
                          <Calendar className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <span>{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm luxury-text-accent">
                        <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-lg">
                          <Clock className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm luxury-text-accent sm:col-span-2">
                        <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-lg">
                          <MapPin className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-[#D4AF37] mb-2">About Event</h3>
                      <p className="text-[#FFFDD0] leading-relaxed whitespace-pre-wrap">{event.description}</p>
                    </div>
                  </div>
                </div>

                {/* Attendee List */}
                <div className="luxury-card p-6">
                  <h3 className="text-xl font-bold text-[#FFFDD0] mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-[#D4AF37]" />
                    Confirmed Attendees ({attendees.length})
                  </h3>

                  {attendees.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground bg-[rgba(15,0,26,0.5)] rounded-lg border border-dashed border-[#D4AF37]/30">
                      No confirmed attendees yet.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {attendees.map(user => (
                        <RSVPCard
                          key={user.id}
                          user={user}
                          rsvpStatus={user.rsvpStatus}
                          rsvpDate={user.rsvpDate}
                          isAdmin={isAdminAuthenticated}
                          onBlurToggle={handleBlurToggle}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* RSVP Stats */}
              <div className="lg:col-span-1 space-y-6">
                <div className="luxury-card p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-[#FFFDD0] mb-6">RSVP Statistics</h3>

                  <div className="space-y-6">
                    <div className="flex justify-between items-end border-b border-[#D4AF37]/20 pb-4">
                      <span className="text-muted-foreground">Total Invited</span>
                      <span className="text-2xl font-bold text-[#FFFDD0]">{totalInvited}</span>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm text-[#FFFDD0]">Interested</span>
                        </div>
                        <span className="font-bold text-green-400">{interested} <span className="text-xs text-muted-foreground font-normal">({interestedPct}%)</span></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm text-[#FFFDD0]">Declined</span>
                        </div>
                        <span className="font-bold text-red-400">{notInterested} <span className="text-xs text-muted-foreground font-normal">({notInterestedPct}%)</span></span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <span className="text-sm text-[#FFFDD0]">Pending</span>
                        </div>
                        <span className="font-bold text-yellow-400">{pending} <span className="text-xs text-muted-foreground font-normal">({pendingPct}%)</span></span>
                      </div>
                    </div>

                    <div className="mt-8">
                      <div className="w-full h-4 bg-[rgba(15,0,26,0.9)] rounded-full overflow-hidden border border-[#D4AF37]/30 flex">
                        <div style={{ width: `${interestedPct}%` }} className="bg-green-500 h-full transition-all" />
                        <div style={{ width: `${notInterestedPct}%` }} className="bg-red-500 h-full transition-all" />
                        <div style={{ width: `${pendingPct}%` }} className="bg-yellow-500 h-full transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventPage;
