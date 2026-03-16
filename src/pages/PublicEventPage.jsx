import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Calendar, MapPin, Clock, Youtube, Mail, Share2, Check } from 'lucide-react';
import { getPublicEventByToken, subscribeToEvent } from '@/lib/apiClient';

function extractYouTubeId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?#]+)/);
  return match ? match[1] : null;
}

const PublicEventPage = () => {
  const { shareToken } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subError, setSubError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getPublicEventByToken(shareToken)
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [shareToken]);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    setSubError('');
    setSubscribing(true);
    try {
      await subscribeToEvent(shareToken, email, name);
      setSubscribed(true);
    } catch (err) {
      setSubError(err.message);
    } finally {
      setSubscribing(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f001a]">
      <div className="text-[#D4AF37] text-sm tracking-widest uppercase animate-pulse">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f001a] gap-4 p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#FFFDD0] mb-2">Event not found</h1>
        <p className="text-muted-foreground">This link may be invalid or the event has been removed.</p>
      </div>
      <Link to="/" className="text-[#D4AF37] hover:underline text-sm">← Back to home</Link>
    </div>
  );

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  const youtubeItems = (event.media || []).filter(m => m.type === 'youtube');
  const imageItems   = (event.media || []).filter(m => m.type === 'image');

  return (
    <>
      <Helmet>
        <title>{event.name} | Mucho Gusto Xo</title>
        <meta name="description" content={event.description?.slice(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-[#0f001a]">

        {/* Header */}
        <div className="border-b border-[#D4AF37]/20 px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-[#D4AF37] font-bold tracking-[3px] uppercase text-sm">
            Mucho Gusto Xo
          </Link>
          <button onClick={copyLink} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[#D4AF37] transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Share'}
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">

          {/* Event hero */}
          <div className="luxury-card overflow-hidden">
            {imageItems.length > 0 ? (
              <img src={imageItems[0].url} alt={event.name} className="w-full h-56 object-cover" />
            ) : (
              <div className="h-40 bg-gradient-to-r from-[#2D1B4E] to-[rgba(212,175,55,0.2)] flex items-center justify-center">
                <Calendar className="w-14 h-14 text-[#D4AF37]/40" />
              </div>
            )}

            <div className="p-8">
              <h1 className="text-3xl font-bold text-[#FFFDD0] mb-6">{event.name}</h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <div className="flex items-center gap-3 text-sm luxury-text-accent">
                  <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-lg">
                    <Calendar className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <span>{eventDate}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-3 text-sm luxury-text-accent">
                    <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-lg">
                      <Clock className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <span>{event.time}</span>
                  </div>
                )}
                {event.location && (
                  <div className="flex items-center gap-3 text-sm luxury-text-accent sm:col-span-2">
                    <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-lg">
                      <MapPin className="w-5 h-5 text-[#D4AF37]" />
                    </div>
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <div>
                  <h3 className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider mb-3">About</h3>
                  <p className="text-[#FFFDD0] leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* YouTube embeds */}
          {youtubeItems.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
                <Youtube className="w-4 h-4" /> Videos
              </h3>
              {youtubeItems.map((item, idx) => {
                const videoId = item.videoId || extractYouTubeId(item.url);
                return videoId ? (
                  <div key={idx} className="luxury-card overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}`}
                        title={`Video ${idx + 1}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          )}

          {/* Image gallery */}
          {imageItems.length > 1 && (
            <div className="space-y-3">
              <h3 className="text-[#D4AF37] font-semibold text-sm uppercase tracking-wider">Photos</h3>
              <div className="grid grid-cols-2 gap-3">
                {imageItems.slice(1).map((item, idx) => (
                  <img key={idx} src={item.url} alt="" className="rounded-lg object-cover aspect-square w-full" />
                ))}
              </div>
            </div>
          )}

          {/* Email subscription */}
          <div className="luxury-card p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-[rgba(212,175,55,0.1)] rounded-lg">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div>
                <h3 className="text-[#FFFDD0] font-semibold">Get Updates</h3>
                <p className="text-sm text-muted-foreground">Add your email to stay in the loop for this event.</p>
              </div>
            </div>

            {subscribed ? (
              <div className="flex items-center gap-2 text-green-400 bg-green-400/10 border border-green-400/30 rounded-lg p-4">
                <Check className="w-5 h-5" />
                <span>You're on the list! We'll keep you updated.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-3">
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className="luxury-input"
                />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="Your email address"
                  required className="luxury-input"
                />
                {subError && <p className="text-red-400 text-sm">{subError}</p>}
                <button type="submit" disabled={subscribing} className="luxury-button w-full py-3">
                  {subscribing ? 'Adding you...' : 'Notify Me'}
                </button>
                <p className="text-xs text-muted-foreground text-center">
                  Want to RSVP?{' '}
                  <Link to="/signup" className="text-[#D4AF37] hover:underline">Create an account</Link>
                </p>
              </form>
            )}
          </div>

          {/* Invite a friend */}
          <div className="luxury-card p-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-[#FFFDD0] font-semibold mb-1">Invite a Friend</h3>
              <p className="text-sm text-muted-foreground">Share this link with someone who should be there.</p>
            </div>
            <button onClick={copyLink}
              className="luxury-button-outline px-5 py-2 flex items-center gap-2 whitespace-nowrap">
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default PublicEventPage;
