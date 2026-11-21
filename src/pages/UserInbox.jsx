import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Sparkles } from 'lucide-react';
import GuestShell from '@/components/shell/GuestShell';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n.jsx';
import { getUserInbox } from '@/lib/apiClient';

const UserInbox = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserInbox()
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Helmet>
        <title>{t('inbox.title')} | Mucho Gusto Xo</title>
      </Helmet>

      <GuestShell><div className="flex flex-col pb-24">

        <div className="flex-1 p-4 md:p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl flex items-center justify-between mb-8">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-primary/90 hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-5 h-5" /> <span className="hidden sm:inline">{t('inbox.back')}</span>
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold text-foreground">{t('inbox.title')}</h1>
            </div>
          </div>

          <div className="w-full max-w-4xl luxury-card overflow-hidden">
            <div className="p-6 border-b border-primary/30 bg-[rgba(212,175,55,0.05)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">{t('inbox.admin_name')}</h3>
                  <p className="text-xs text-primary">{t('inbox.admin_role')}</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center luxury-text-accent">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="p-12 flex flex-col items-center justify-center text-muted-foreground opacity-50 space-y-4">
                <MessageSquare className="w-16 h-16 text-primary" />
                <p>{t('inbox.no_msgs_conv')}</p>
              </div>
            ) : (
              <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                {messages.map(msg => (
                  <div key={msg.id} className="flex justify-start">
                    <div className="max-w-[75%] rounded-2xl p-3 bg-accent border border-primary/50 text-foreground rounded-tl-none shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                      <p className="text-sm">{msg.content}</p>
                      <p className="text-[10px] mt-1 text-primary/70">
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3 bg-[rgba(15,0,26,0.95)] border-t border-primary/30 text-center">
              <p className="text-xs text-muted-foreground">{t('inbox.read_only')}</p>
            </div>
          </div>
        </div>
      </div></GuestShell>
    </>
  );
};

export default UserInbox;
