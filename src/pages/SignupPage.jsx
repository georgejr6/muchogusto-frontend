import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import FormInput from '@/components/FormInput';
import { useTranslation } from '@/lib/i18n.jsx';
import { validateInstagram } from '@/lib/formValidation';
import { useAuth } from '@/contexts/AuthContext';

const SignupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { signupUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    instagram: '',
    phone: '',
    email: '',
    countryCode: '+57',
  });
  const [errors, setErrors] = useState({});

  const countryCodes = [
    { value: '+57', label: 'Colombia (+57)' },
    { value: '+1', label: 'USA (+1)' },
    { value: '+66', label: 'Thailand (+66)' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const instagramError = validateInstagram(formData.instagram);
    if (instagramError) newErrors.instagram = instagramError;
    if (!formData.phone || formData.phone.length < 7) {
      newErrors.phone = 'Valid phone number required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      await signupUser({
        name: formData.name,
        instagram: formData.instagram ? formData.instagram.replace(/^@/, '') : '',
        phone: `${formData.countryCode}${formData.phone}`,
        email: formData.email || undefined,
      });

      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('signup.title')} | Mucho Gusto Xo</title>
      </Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <Header />

        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md z-10"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                    <h1 className="text-4xl font-bold text-[#FFFDD0]">Mucho Gusto Xo</h1>
                  </div>
                  <p className="luxury-text-accent text-lg">{t('signup.subtitle')}</p>
                </div>

                <form onSubmit={handleSubmit} className="luxury-card p-6 sm:p-8 space-y-6">
                  <FormInput
                    label={<>Name <span className="luxury-text-accent font-normal">(Optional)</span></>}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your name"
                  />

                  <FormInput
                    label={<>Instagram <span className="luxury-text-accent font-normal">(Optional)</span></>}
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    placeholder="@username"
                    error={errors.instagram}
                  />

                  <FormInput
                    label={<>Email <span className="luxury-text-accent font-normal">(Optional)</span></>}
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="you@example.com"
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[#FFFDD0]">
                      Phone Number <span className="text-red-400">*</span>
                    </label>
                    <div className="flex gap-3">
                      <div className="w-[140px]">
                        <select
                          name="countryCode"
                          value={formData.countryCode}
                          onChange={handleInputChange}
                          className="luxury-input appearance-none bg-[rgba(15,0,26,0.9)]"
                        >
                          {countryCodes.map(c => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <input
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="Phone number"
                          className={`luxury-input w-full ${errors.phone ? 'border-red-500 focus:shadow-[0_0_15px_rgba(239,68,68,0.4)]' : ''}`}
                        />
                      </div>
                    </div>
                    {errors.phone && <p className="text-sm text-red-400 mt-1">{errors.phone}</p>}
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 text-center">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="luxury-button w-full py-4 text-lg mt-6"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#0f001a] border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      'Join Mucho Gusto Xo'
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center z-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                  className="w-24 h-24 bg-[rgba(15,0,26,0.85)] rounded-full flex items-center justify-center mb-6 border-[3px] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  <CheckCircle className="w-12 h-12 text-[#D4AF37]" />
                </motion.div>
                <h2 className="text-3xl font-bold text-[#FFFDD0] mb-2">Welcome!</h2>
                <p className="luxury-text-accent text-lg">Taking you to your dashboard...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default SignupPage;
