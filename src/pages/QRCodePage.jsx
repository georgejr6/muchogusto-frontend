
import React, { useRef } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Download, Link2, Sparkles, ArrowLeft } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/i18n.jsx';

const QRCodePage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const qrCodeRef = useRef(null);
  const signupUrl = `${window.location.origin}/signup`;

  const handleDownload = () => {
    const svg = qrCodeRef.current?.querySelector('svg');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = '#0f001a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      
      const link = document.createElement('a');
      link.download = 'mucho-gusto-xo-qr.png';
      link.href = canvas.toDataURL('image/png');
      link.click();

      toast({
        title: 'QR Code Downloaded!',
        description: 'QR code saved to your device',
      });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(signupUrl);
    toast({
      title: 'Link Copied!',
      description: 'Signup link copied to clipboard',
    });
  };

  return (
    <>
      <Helmet>
        <title>Share Your Mucho Gusto Xo Profile</title>
        <meta name="description" content={t('qr.subtitle')} />
      </Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden z-10">
        <Header />
        
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8 flex flex-col w-full">
          <div className="max-w-2xl mx-auto w-full z-10">
            <button 
              className="mb-6 luxury-text-accent hover:text-[#D4AF37] flex items-center transition-colors"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl mx-auto w-full text-center flex-1 z-10"
          >
            <div className="mb-12">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                <h1 className="text-4xl font-bold text-[#FFFDD0] tracking-tight">Mucho Gusto Xo</h1>
              </motion.div>
              <p className="luxury-text-accent text-xl">
                Scan to join Mucho Gusto Xo
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="luxury-card p-8 mb-8 inline-block shadow-[0_0_40px_rgba(212,175,55,0.3)] relative"
              ref={qrCodeRef}
            >
              <div className="absolute top-3 left-3 w-4 h-4 border-t-[3px] border-l-[3px] border-[#D4AF37]" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-[3px] border-r-[3px] border-[#D4AF37]" />
              <div className="absolute bottom-3 left-3 w-4 h-4 border-b-[3px] border-l-[3px] border-[#D4AF37]" />
              <div className="absolute bottom-3 right-3 w-4 h-4 border-b-[3px] border-r-[3px] border-[#D4AF37]" />

              <div className="bg-[#FFFDD0] p-4 rounded-xl">
                <QRCodeSVG
                  value={signupUrl}
                  size={260}
                  level="H"
                  includeMargin={true}
                  fgColor="#0f001a"
                  bgColor="#FFFDD0"
                  className="mx-auto"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="luxury-card p-6 mb-8 max-w-md mx-auto"
            >
              <h2 className="text-[#D4AF37] text-lg font-semibold mb-2">
                {t('qr.instruction_title')}
              </h2>
              <p className="luxury-text-accent text-sm">
                {t('qr.instruction_desc')}
              </p>
            </motion.div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleDownload}
                className="luxury-button px-8 py-4 flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                {t('qr.download')}
              </button>
              
              <button
                onClick={handleCopyLink}
                className="luxury-button-outline px-8 py-4 flex items-center justify-center gap-2"
              >
                <Link2 className="w-5 h-5" />
                {t('qr.copy')}
              </button>
            </div>

            <div className="space-y-3">
              <p className="luxury-text-accent text-sm max-w-md mx-auto">
                {t('qr.footer')}
              </p>
              <p className="text-[#FFFDD0] text-xs font-mono break-all max-w-md mx-auto bg-[rgba(15,0,26,0.8)] border border-[#D4AF37]/50 p-3 rounded-lg shadow-inner">
                {signupUrl}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default QRCodePage;
