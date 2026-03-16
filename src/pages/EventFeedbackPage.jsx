import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Star, Check } from 'lucide-react';
import { getEventFeedbackMeta, submitEventFeedback } from '@/lib/apiClient';

const EventFeedbackPage = () => {
  const { shareToken } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    getEventFeedbackMeta(shareToken)
      .then(setEvent)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [shareToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setSubmitError('Please select a rating.');
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      await submitEventFeedback(shareToken, { rating, comment, email });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f001a]">
      <div className="text-[#D4AF37] text-sm tracking-widest uppercase animate-pulse">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f001a] gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold text-[#FFFDD0]">Page not found</h1>
      <Link to="/" className="text-[#D4AF37] hover:underline text-sm">← Back to home</Link>
    </div>
  );

  const eventDate = new Date(event.date).toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <>
      <Helmet>
        <title>How was {event.name}? | Mucho Gusto Xo</title>
      </Helmet>

      <div className="min-h-screen bg-[#0f001a]">

        <div className="border-b border-[#D4AF37]/20 px-6 py-4">
          <Link to="/" className="text-[#D4AF37] font-bold tracking-[3px] uppercase text-sm">
            Mucho Gusto Xo
          </Link>
        </div>

        <div className="max-w-lg mx-auto px-4 py-12">

          {submitted ? (
            <div className="luxury-card p-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.1)] flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-[#D4AF37]" />
              </div>
              <h2 className="text-2xl font-bold text-[#FFFDD0]">Thank you!</h2>
              <p className="text-muted-foreground">Your feedback means a lot to us. See you at the next one.</p>
              <Link to="/" className="inline-block mt-4 text-[#D4AF37] hover:underline text-sm">← Back to home</Link>
            </div>
          ) : (
            <div className="luxury-card p-8 space-y-8">

              <div className="text-center space-y-2">
                <p className="text-muted-foreground text-sm uppercase tracking-wider">You attended</p>
                <h1 className="text-2xl font-bold text-[#FFFDD0]">{event.name}</h1>
                <p className="text-muted-foreground text-sm">{eventDate}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Star rating */}
                <div className="space-y-3 text-center">
                  <label className="text-sm font-medium text-[#FFFDD0] block">How was your experience?</label>
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= (hovered || rating)
                              ? 'text-[#D4AF37] fill-[#D4AF37]'
                              : 'text-[#D4AF37]/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-sm text-[#D4AF37]">
                      {['', 'Not great', 'It was okay', 'Good time', 'Really enjoyed it', 'Absolutely amazing!'][rating]}
                    </p>
                  )}
                </div>

                {/* Comment */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFFDD0]">
                    Any thoughts? <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    className="luxury-input min-h-[100px]"
                    placeholder="Tell us what you loved or what we can improve..."
                  />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFFDD0]">
                    Your email <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <input
                    type="email" value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="luxury-input"
                    placeholder="so we can follow up"
                  />
                </div>

                {submitError && (
                  <p className="text-red-400 text-sm text-center">{submitError}</p>
                )}

                <button type="submit" disabled={submitting} className="luxury-button w-full py-3">
                  {submitting ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </form>

            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default EventFeedbackPage;
