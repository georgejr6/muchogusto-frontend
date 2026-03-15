import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { respondToInvitation } from '@/lib/apiClient';

const InvitationCard = ({ invitation, onStatusChange }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(invitation.status || 'pending');

  const event = invitation.event || {};

  const handleRsvp = async (newStatus) => {
    setLoading(true);
    try {
      await respondToInvitation(invitation.id, newStatus);
      setStatus(newStatus);
      if (onStatusChange) onStatusChange(invitation.id, newStatus);
      toast({
        title: 'RSVP Updated',
        description: `You marked: ${newStatus === 'interested' ? 'Interested' : 'Not Interested'}`,
      });
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const dateStr = event.date
    ? new Date(event.date).toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
      })
    : '';
  const timeStr = event.time || '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="luxury-card p-5 relative overflow-hidden"
    >
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-bold text-[#FFFDD0]">{event.name}</h3>
          {status !== 'pending' && (
            <span className={`text-xs px-2 py-1 rounded-full border ${
              status === 'interested'
                ? 'bg-green-500/20 text-green-400 border-green-500/50'
                : 'bg-red-500/20 text-red-400 border-red-500/50'
            }`}>
              {status === 'interested' ? 'Attending' : 'Declined'}
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4 text-sm luxury-text-accent">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#D4AF37]" />
            <span>{dateStr}{timeStr ? ` at ${timeStr}` : ''}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#D4AF37]" />
              <span>{event.location}</span>
            </div>
          )}
        </div>

        {event.description && (
          <p className="text-sm text-[#FFFDD0] mb-6 line-clamp-2">{event.description}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => handleRsvp('interested')}
            disabled={loading || status === 'interested'}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-300 font-semibold
              ${status === 'interested'
                ? 'bg-green-600 text-white shadow-[0_0_15px_rgba(22,163,74,0.4)]'
                : 'luxury-button'}`}
          >
            {status === 'interested' ? <><Check className="w-4 h-4 mr-2" /> Going</> : 'Interested'}
          </button>
          <button
            onClick={() => handleRsvp('not_interested')}
            disabled={loading || status === 'not_interested'}
            className={`flex-1 py-2 px-4 rounded-lg flex items-center justify-center transition-all duration-300 font-semibold
              ${status === 'not_interested'
                ? 'bg-red-600/50 text-white border-2 border-red-500'
                : 'luxury-button-outline hover:border-red-400 hover:text-red-400 hover:bg-red-500/10'}`}
          >
            {status === 'not_interested' ? <><X className="w-4 h-4 mr-2" /> Passed</> : 'Pass'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default InvitationCard;
