
import React, { useState } from 'react';
import { useTranslation } from '@/lib/i18n.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'es', label: 'Español' },
  { code: 'en', label: 'English' },
  { code: 'th', label: 'ไทย' }
];

const LanguageSwitcher = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen(!isOpen);

  const selectLanguage = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-20 md:top-6 right-6 z-50 flex flex-col items-end gap-2">
      <button
        onClick={toggleOpen}
        className="luxury-card w-12 h-12 rounded-full flex items-center justify-center p-0 shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:scale-105 active:scale-95 transition-transform"
        title="Change Language"
      >
        <Globe className="w-6 h-6 text-[#D4AF37]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 mt-2"
          >
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => selectLanguage(lang.code)}
                className={`luxury-card py-2 px-4 rounded-full text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                  language === lang.code 
                    ? 'bg-[#D4AF37] text-[#0f001a] border-[#D4AF37]' 
                    : 'text-[#FFFDD0] hover:bg-[#D4AF37]/20 hover:text-[#F1E5AC]'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
