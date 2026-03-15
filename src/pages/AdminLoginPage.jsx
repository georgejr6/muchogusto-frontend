import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Lock, LogIn, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n.jsx';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { loginAdmin, isAdminAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAdminAuthenticated) navigate('/admin-dashboard');
  }, [isAdminAuthenticated, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await loginAdmin(formData.username, formData.password);
    if (result.success) {
      toast({ title: t('login.success') });
      navigate('/admin-dashboard');
    } else {
      setError(result.error || 'Invalid credentials');
    }
    setLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Mucho Gusto Xo | {t('login.title')}</title>
      </Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <Header />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 flex items-center justify-center p-4 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full"
          >
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2 mb-4"
              >
                <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                <h1 className="text-4xl font-bold text-[#FFFDD0] tracking-tight">Mucho Gusto Xo</h1>
              </motion.div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Lock className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-xl font-semibold text-[#FFFDD0]">{t('login.title')}</h2>
              </div>
              <p className="luxury-text-accent text-sm">{t('login.subtitle')}</p>
            </div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              onSubmit={handleSubmit}
              className="luxury-card p-8 space-y-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFFDD0]">{t('login.email')}</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="luxury-input"
                  placeholder="admin@thehomies.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-[#FFFDD0]">{t('login.password')}</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="luxury-input"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="luxury-button w-full py-4 text-lg mt-4 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#0f001a] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {t('login.submit')}
                  </>
                )}
              </button>
            </motion.form>

            <p className="text-center text-sm luxury-text-accent mt-6 opacity-70">{t('login.protected')}</p>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;
