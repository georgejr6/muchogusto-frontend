import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, Calendar, MapPin, ExternalLink, ArrowRight, RefreshCw } from 'lucide-react';
import { getConsentInfo } from '@/lib/apiClient';

const STEPS = [
  { icon: FileText,     label: 'Sign consent form',  desc: 'Review and sign the 2-minute consent form on myconsent.me.' },
  { icon: CheckCircle,  label: 'Form confirmed',      desc: 'We automatically receive your submission — no extra steps.' },
  { icon: ArrowRight,   label: 'Confirm your RSVP',  desc: 'Come back here and tap Interested to lock in your spot.' },
];

export default function ConsentPage() {
  const { invitationId } = useParams();
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [checking, setChecking] = useState(false);

  const load = async () => {
    try {
      const data = await getConsentInfo(invitationId);
      setInfo(data);
    } catch (err) {
      setError('Could not load invitation details. Please log in and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [invitationId]);

  const handleCheck = async () => {
    setChecking(true);
    await load();
    setChecking(false);
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f001a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f001a] flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <p className="text-red-400">{error}</p>
          <button onClick={() => navigate('/login')} className="luxury-button px-6 py-2">Log In</button>
        </div>
      </div>
    );
  }

  const alreadyDone = info.consent_status === 'submitted' || info.consent_status === 'verified';

  return (
    <div className="min-h-screen bg-[#0f001a] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#D4AF37] tracking-widest uppercase mb-1">
            Mucho Gusto Xo
          </h1>
          <p className="text-[rgba(255,253,208,0.5)] text-sm tracking-widest uppercase">
            Consent Required
          </p>
        </div>

        {/* Event card */}
        <div className="luxury-card p-5 mb-6">
          <p className="text-xs text-[#D4AF37] tracking-widest uppercase mb-2">Your Invitation</p>
          <h2 className="text-xl font-bold text-[#FFFDD0] mb-3">{info.event_name}</h2>
          <div className="space-y-1.5 text-sm text-[rgba(255,253,208,0.7)]">
            {info.event_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{formatDate(info.event_date)}{info.event_time ? ` at ${info.event_time}` : ''}</span>
              </div>
            )}
            {info.event_location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0" />
                <span>{info.event_location}</span>
              </div>
            )}
          </div>
        </div>

        {alreadyDone ? (
          /* ── Already completed ── */
          <div className="luxury-card p-6 text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <h3 className="text-lg font-bold text-[#FFFDD0]">Consent Complete</h3>
            <p className="text-sm text-[rgba(255,253,208,0.6)]">
              Your form has been received. Head back to the dashboard to confirm your RSVP.
            </p>
            <button onClick={() => navigate('/dashboard')} className="luxury-button w-full py-3">
              Go to Dashboard & RSVP
            </button>
          </div>
        ) : (
          /* ── Consent needed ── */
          <div className="space-y-5">
            {/* Why section */}
            <div className="luxury-card p-5">
              <p className="text-sm font-semibold text-[#FFFDD0] mb-2">Why is this required?</p>
              <p className="text-sm text-[rgba(255,253,208,0.65)] leading-relaxed">
                To protect everyone at our events, we require a signed consent form before confirming
                your spot. It covers media usage, personal safety, and general conduct — and takes
                about 2 minutes to complete.
              </p>
            </div>

            {/* Steps */}
            <div className="luxury-card p-5 space-y-4">
              <p className="text-sm font-semibold text-[#D4AF37] tracking-widest uppercase mb-3">How it works</p>
              {STEPS.map(({ icon: Icon, label, desc }, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5
                    ${i === 0 ? 'bg-[#D4AF37] text-[#0f001a]' : 'bg-[rgba(212,175,55,0.15)] text-[#D4AF37]'} border border-[#D4AF37]`}>
                    <span className="text-xs font-bold">{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#FFFDD0]">{label}</p>
                    <p className="text-xs text-[rgba(255,253,208,0.55)] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            {info.consent_url ? (
              <a
                href={info.consent_url}
                target="_blank"
                rel="noopener noreferrer"
                className="luxury-button w-full py-3 flex items-center justify-center gap-2 text-center"
              >
                <FileText className="w-4 h-4" />
                Open Consent Form
                <ExternalLink className="w-3 h-3 opacity-70" />
              </a>
            ) : (
              <p className="text-center text-sm text-[rgba(255,253,208,0.4)]">
                Consent form link not found. Please contact support.
              </p>
            )}

            {/* Already signed? Check status */}
            <button
              onClick={handleCheck}
              disabled={checking}
              className="w-full py-2.5 text-sm text-[rgba(255,253,208,0.5)] hover:text-[#FFFDD0] flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              Already signed? Check my status
            </button>
          </div>
        )}

        {/* Back link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="text-xs text-[rgba(255,253,208,0.3)] hover:text-[rgba(255,253,208,0.6)] transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </motion.div>
    </div>
  );
}
