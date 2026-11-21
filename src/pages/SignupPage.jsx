import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import FormInput from '@/components/FormInput';
import PhoneInput from '@/components/PhoneInput';
import SocialAuthButtons from '@/components/SocialAuthButtons';
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

  const [formData, setFormData] = useState({ name: '', instagram: '', phone: '', email: '', countryCode: '+57' });
  const [errors, setErrors] = useState({});
  const [consent, setConsent] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const next = {};
    const instagramError = validateInstagram(formData.instagram);
    if (instagramError) next.instagram = instagramError;

    if (!formData.email.trim()) next.email = t('su.err_email_req');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) next.email = t('su.err_email');

    if (!formData.phone.trim()) next.phone = t('su.err_phone_req');
    else if (formData.phone.trim().length < 5 || !formData.countryCode) next.phone = t('su.err_phone');

    if (!consent) next.consent = t('su.consent_err');

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError('');
    try {
      await signupUser({
        name: formData.name || undefined,
        instagram: formData.instagram ? formData.instagram.replace(/^@/, '') : undefined,
        phone: `${formData.countryCode}${formData.phone.trim()}`,
        email: formData.email.trim(),
        consent: true,
      });
      setSuccess(true);
      setTimeout(() => navigate('/welcome'), 1200);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Helmet><title>{t('su.title')} | Mucho Gusto Xo</title></Helmet>
      <header className="px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-lg text-primary">Mucho Gusto</Link>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-4">
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div key="form" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="w-full max-w-sm space-y-6">
              <div className="space-y-1 text-center">
                <h1 className="text-3xl">{t('su.title')}</h1>
                <p className="text-sm text-muted-foreground">{t('su.sub')}</p>
              </div>

              <SocialAuthButtons />
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">{t('su.or_email')}</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <FormInput
                  label={<>{t('su.name')} <span className="font-normal text-muted-foreground">({t('su.name_opt')})</span></>}
                  name="name"
                  autoComplete="given-name"
                  value={formData.name}
                  onChange={handleInputChange}
                />
                <FormInput
                  label={<>Instagram <span className="font-normal text-muted-foreground">({t('su.name_opt')})</span></>}
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="@username"
                  error={errors.instagram}
                />
                <FormInput
                  label={t('auth.email')}
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  required
                  error={errors.email}
                />
                <PhoneInput
                  label={t('su.phone')}
                  required
                  countryCode={formData.countryCode}
                  onCountryChange={(code) => setFormData((p) => ({ ...p, countryCode: code }))}
                  phone={formData.phone}
                  onPhoneChange={(val) => {
                    setFormData((p) => ({ ...p, phone: val }));
                    if (errors.phone) setErrors((p) => ({ ...p, phone: '' }));
                  }}
                  error={errors.phone}
                />
                <p className="-mt-2 text-xs text-muted-foreground">{t('su.phone_help')}</p>

                <label className="flex items-start gap-3 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => { setConsent(e.target.checked); if (errors.consent) setErrors((p) => ({ ...p, consent: '' })); }}
                    className="mt-1 h-4 w-4 accent-[hsl(var(--primary))]"
                    aria-invalid={!!errors.consent}
                  />
                  <span>
                    {t('su.consent')} (<Link to="/privacy" target="_blank" className="underline">/privacy</Link>)
                    {errors.consent && <span className="block text-destructive" role="alert">{errors.consent}</span>}
                  </span>
                </label>

                {error && (
                  <p className="text-center text-sm text-destructive" role="alert">
                    {error}
                    {error.toLowerCase().includes('already exists') && (
                      <> <Link to="/login" className="underline">{t('su.login_here')}</Link></>
                    )}
                  </p>
                )}

                <button type="submit" disabled={loading} className="mg-btn w-full">
                  {loading ? t('su.saving') : t('su.submit')}
                </button>
              </form>

              <p className="text-center text-sm text-muted-foreground">
                <Link to="/login" className="hover:text-foreground">{t('land.login')}</Link>
              </p>
            </motion.div>
          ) : (
            <motion.div key="ok" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mt-24 space-y-3 text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-primary" />
              <h2 className="text-3xl">{t('su.welcome')}</h2>
              <p className="text-sm text-muted-foreground">{t('su.moving')}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SignupPage;
