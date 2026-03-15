
import React from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { useTranslation } from '@/lib/i18n.jsx';

const HomePage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>Mucho Gusto Xo - Exclusive Nightlife Community</title>
        <meta name="description" content={t('signup.subtitle')} />
      </Helmet>

      <div className="min-h-screen flex flex-col relative z-10">
        <Header />
        
        <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
          <div className="text-center space-y-8 max-w-lg w-full luxury-card p-8 sm:p-12">
            <div className="inline-flex items-center justify-center gap-3 mb-2 w-full">
              <Sparkles className="w-10 h-10 text-[#D4AF37]" />
              <h1 className="text-4xl sm:text-5xl font-bold text-[#FFFDD0] tracking-tight">Mucho Gusto Xo</h1>
            </div>
            
            <p className="text-xl luxury-text-accent leading-relaxed">
              {t('signup.subtitle')}
            </p>

            <div className="pt-8 flex flex-col gap-5">
              <button 
                onClick={() => navigate('/signup')} 
                className="luxury-button py-5 px-8 text-lg flex items-center justify-center gap-2 group"
              >
                {t('signup.title')}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
