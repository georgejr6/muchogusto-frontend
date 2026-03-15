
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { CheckCircle, Share2, Home } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n.jsx';

const ThankYouPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const timestamp = new Date().toLocaleString();

  const handleShare = () => {
    const shareUrl = `${window.location.origin}`;
    if (navigator.share) {
      navigator.share({
        title: 'Join Mucho Gusto Xo',
        text: t('signup.subtitle'),
        url: shareUrl
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Link Copied!',
        description: 'Share link copied to clipboard',
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>Welcome to Mucho Gusto Xo</title>
        <meta name="description" content={t('thank_you.desc')} />
      </Helmet>

      <LanguageSwitcher />

      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden z-10">
        {/* Subtle glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[150px] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl w-full text-center z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-28 h-28 bg-[rgba(15,0,26,0.85)] backdrop-blur-sm border-[4px] border-[#D4AF37] rounded-full mb-10 shadow-[0_0_40px_rgba(212,175,55,0.4)]"
          >
            <CheckCircle className="w-14 h-14 text-[#D4AF37]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4 mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-[#FFFDD0] tracking-tight mb-4">
              Welcome to Mucho Gusto Xo <span className="text-5xl inline-block ml-2 animate-bounce">🎉</span>
            </h1>
            <p className="text-xl luxury-text-accent font-medium mb-2">
              {t('thank_you.subtitle')}
            </p>
            <p className="text-lg text-[#FFFDD0] max-w-lg mx-auto">
              {t('thank_you.desc')}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="luxury-card p-6 mb-10 max-w-md mx-auto"
          >
            <p className="text-sm luxury-text-accent mb-2 uppercase tracking-widest font-bold">{t('thank_you.received')}</p>
            <p className="text-[#FFFDD0] font-mono text-lg">{timestamp}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-5 justify-center"
          >
            <button
              onClick={handleShare}
              className="luxury-button px-8 py-4 flex items-center justify-center gap-2 text-lg"
            >
              <Share2 className="w-5 h-5" />
              {t('thank_you.share')}
            </button>
            
            <button
              onClick={() => navigate('/')}
              className="luxury-button-outline px-8 py-4 flex items-center justify-center gap-2 text-lg"
            >
              <Home className="w-5 h-5" />
              {t('thank_you.home')}
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm luxury-text-accent mt-16"
          >
            {t('thank_you.footer')}{' '}
            <button
              onClick={() => navigate('/qr-code')}
              className="text-[#D4AF37] hover:text-[#FFFDD0] underline decoration-[#D4AF37] underline-offset-4 transition-colors font-bold ml-1"
            >
              {t('thank_you.view_qr')}
            </button>
          </motion.p>
        </motion.div>
      </div>
    </>
  );
};

export default ThankYouPage;
