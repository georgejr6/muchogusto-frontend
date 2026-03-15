import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Globe, ChevronDown, Users, User, LogOut, LogIn } from 'lucide-react';
import { useTranslation } from '@/lib/i18n.jsx';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header = ({ rightContent }) => {
  const { language, setLanguage } = useTranslation();
  const { isUserAuthenticated, userProfile, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { code: 'es', label: 'Español' },
    { code: 'en', label: 'English' },
    { code: 'th', label: 'ไทย' }
  ];

  const rsvpsText = {
    en: 'Community',
    es: 'Comunidad',
    th: 'ชุมชน'
  }[language] || 'Community';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand group">
        <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#D4AF37] group-hover:scale-110 transition-transform" />
        <span className="font-bold text-[#FFFDD0] hidden sm:block tracking-tight text-lg">Mucho Gusto Xo</span>
      </Link>

      <div className="navbar-actions">
        {/* Community Link */}
        <Link
          to="/rsvps"
          className="flex items-center gap-1.5 text-[#D4AF37] hover:text-[#F1E5AC] hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.5)] transition-all duration-300 font-bold text-sm sm:text-base mr-1 sm:mr-2"
        >
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">{rsvpsText}</span>
        </Link>

        {/* Language Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors p-1 rounded-md"
            aria-label="Select Language"
          >
            <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium uppercase">{language}</span>
            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-32 bg-[rgba(15,0,26,0.95)] border border-[#D4AF37]/50 rounded-lg shadow-[0_4px_20px_rgba(212,175,55,0.2)] overflow-hidden backdrop-blur-xl z-50"
              >
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => { setLanguage(lang.code); setIsOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                      language === lang.code
                        ? 'bg-[#D4AF37]/20 text-[#D4AF37] font-bold'
                        : 'text-[#FFFDD0] hover:bg-[#D4AF37]/10 hover:text-[#F1E5AC]'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Auth Button */}
        {isUserAuthenticated ? (
          <div className="flex items-center gap-2">
            <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              {userProfile?.photo_url ? (
                <img
                  src={userProfile.photo_url}
                  alt="Profile"
                  className="w-7 h-7 rounded-full object-cover border border-[#D4AF37]/60"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[rgba(212,175,55,0.15)] border border-[#D4AF37]/60 flex items-center justify-center">
                  <User className="w-4 h-4 text-[#D4AF37]" />
                </div>
              )}
              <span className="text-xs text-[#F1E5AC] hidden sm:block">
                @{userProfile?.instagram || userProfile?.name || 'Me'}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              title="Log out"
              className="text-[#F1E5AC] hover:text-[#D4AF37] p-1.5 rounded-full hover:bg-[rgba(212,175,55,0.1)] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-1.5 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors text-sm font-medium"
          >
            <LogIn className="w-4 h-4" />
            <span className="hidden sm:inline">Login</span>
          </Link>
        )}

        {rightContent && (
          <div className="pl-3 sm:pl-4 ml-1 sm:ml-2 border-l border-[#D4AF37]/30 flex items-center h-6">
            {rightContent}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
