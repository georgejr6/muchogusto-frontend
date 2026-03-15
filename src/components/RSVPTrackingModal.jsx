import React from 'react';
import { X, Download, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/lib/i18n.jsx';

const RSVPTrackingModal = ({ event, onClose }) => {
  const { t } = useTranslation();
  if (!event) return null;

  const rsvps = event.rsvps || [];
  const invitedUsers = event.invitedUsers || [];

  const interested = rsvps.filter(r => r.status === 'interested').length;
  const notInterested = rsvps.filter(r => r.status === 'not_interested').length;
  const total = invitedUsers.length || 1;
  const pending = total - (interested + notInterested);

  const interestedPct = Math.round((interested / total) * 100);
  const notInterestedPct = Math.round((notInterested / total) * 100);
  const pendingPct = Math.round((pending / total) * 100);

  // Build guest list from rsvps (which include user data from the full event fetch)
  // or fall back to just user IDs if detail isn't available
  const guestList = invitedUsers.map(userId => {
    const rsvp = rsvps.find(r => r.userId === userId || r.user_id === userId);
    const user = rsvp?.user || {};
    return {
      id: userId,
      name: user.name || 'Unknown User',
      instagram: user.instagram || 'N/A',
      rsvpStatus: rsvp?.status || 'pending',
    };
  });

  const handleExport = () => {
    const headers = [t('rsvp.col_name'), t('rsvp.col_ig'), t('rsvp.col_status')];
    const csvContent = [
      headers.join(','),
      ...guestList.map(u => `"${u.name}","${u.instagram}","${u.rsvpStatus}"`),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.name.replace(/\s+/g, '_')}_RSVPs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    if (status === 'interested') return <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">{t('rsvp.interested')}</span>;
    if (status === 'not_interested') return <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">{t('rsvp.declined')}</span>;
    return <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">{t('rsvp.pending')}</span>;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="luxury-card w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        >
          <div className="p-6 border-b border-[#D4AF37]/30 flex justify-between items-center bg-[rgba(15,0,26,0.95)]">
            <div>
              <h2 className="text-2xl font-bold text-[#FFFDD0] flex items-center gap-2">
                <Users className="w-6 h-6 text-[#D4AF37]" />
                {t('rsvp.title')}
              </h2>
              <p className="luxury-text-accent mt-1">{event.name}</p>
            </div>
            <button onClick={onClose} className="p-2 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors rounded-full hover:bg-[rgba(212,175,55,0.1)]">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-green-400">{interested}</p>
                <p className="text-xs text-green-400/80 uppercase tracking-wider mt-1">{t('rsvp.interested')}</p>
              </div>
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-red-400">{notInterested}</p>
                <p className="text-xs text-red-400/80 uppercase tracking-wider mt-1">{t('rsvp.declined')}</p>
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                <p className="text-3xl font-bold text-yellow-400">{pending}</p>
                <p className="text-xs text-yellow-400/80 uppercase tracking-wider mt-1">{t('rsvp.pending')}</p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="luxury-text-accent">{t('rsvp.response_rate')}</span>
                <span className="text-[#FFFDD0]">{interestedPct + notInterestedPct}%</span>
              </div>
              <div className="w-full h-3 bg-[rgba(15,0,26,0.9)] rounded-full overflow-hidden border border-[#D4AF37]/30 flex">
                <div style={{ width: `${interestedPct}%` }} className="bg-green-500 h-full" />
                <div style={{ width: `${notInterestedPct}%` }} className="bg-red-500 h-full" />
                <div style={{ width: `${pendingPct}%` }} className="bg-yellow-500 h-full" />
              </div>
            </div>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-[#D4AF37]">{t('rsvp.guest_list')}</h3>
                <button
                  onClick={handleExport}
                  className="luxury-button-outline px-4 py-2 text-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  {t('rsvp.export')}
                </button>
              </div>

              <div className="border border-[#D4AF37]/30 rounded-lg overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-[rgba(212,175,55,0.1)]">
                    <tr>
                      <th className="px-4 py-3 text-sm font-semibold text-[#D4AF37]">{t('rsvp.col_name')}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-[#D4AF37]">{t('rsvp.col_ig')}</th>
                      <th className="px-4 py-3 text-sm font-semibold text-[#D4AF37] text-right">{t('rsvp.col_status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4AF37]/20">
                    {guestList.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-muted-foreground">{t('rsvp.no_invited')}</td>
                      </tr>
                    ) : (
                      guestList.map((user, idx) => (
                        <tr key={idx} className="hover:bg-[rgba(212,175,55,0.05)] transition-colors">
                          <td className="px-4 py-3 text-[#FFFDD0]">{user.name}</td>
                          <td className="px-4 py-3 text-[#FFFDD0]">@{user.instagram}</td>
                          <td className="px-4 py-3 text-right">{getStatusBadge(user.rsvpStatus)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default RSVPTrackingModal;
