import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, Lock, LogIn } from 'lucide-react';
import Header from '@/components/Header';
import FormInput from '@/components/FormInput';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { validateInstagram } from '@/lib/formValidation';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signupUser, loginAdmin } = useAuth();
  const [tab, setTab] = useState('user');

  // User state
  const [userForm, setUserForm] = useState({ name: '', instagram: '', email: '', phone: '', countryCode: '+57' });
  const [userErrors, setUserErrors] = useState({});
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState(false);

  // Admin state
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const countryCodes = [
    { value: '+57', label: 'Colombia (+57)' },
    { value: '+1', label: 'USA (+1)' },
    { value: '+66', label: 'Thailand (+66)' },
  ];

  const validateUserForm = () => {
    const errs = {};
    const igError = validateInstagram(userForm.instagram);
    if (igError) errs.instagram = igError;
    if (!userForm.email && !userForm.phone) errs.email = 'Email or phone number is required';
    if (userForm.phone && userForm.phone.length < 7) errs.phone = 'Enter a valid phone number';
    setUserErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!validateUserForm()) return;
    setUserLoading(true);
    setUserError('');
    try {
      await signupUser({
        name: userForm.name,
        instagram: userForm.instagram ? userForm.instagram.replace(/^@/, '') : '',
        phone: `${userForm.countryCode}${userForm.phone}`,
        email: userForm.email || undefined,
      });
      setUserSuccess(true);
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setUserError(err.message || 'Login failed. Please try again.');
    } finally {
      setUserLoading(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');
    const result = await loginAdmin(adminForm.email, adminForm.password);
    if (result.success) {
      toast({ title: 'Welcome back, Admin.' });
      navigate('/admin-dashboard');
    } else {
      setAdminError(result.error || 'Invalid credentials');
    }
    setAdminLoading(false);
  };

  return (
    <>
      <Helmet>
        <title>Login | Mucho Gusto Xo</title>
      </Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <Header />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
          <AnimatePresence mode="wait">
            {tab === 'user' && userSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-[rgba(15,0,26,0.85)] rounded-full flex items-center justify-center mb-6 border-[3px] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <CheckCircle className="w-12 h-12 text-[#D4AF37]" />
                </div>
                <h2 className="text-3xl font-bold text-[#FFFDD0] mb-2">Welcome!</h2>
                <p className="luxury-text-accent text-lg">Taking you to your dashboard...</p>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
              >
                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                    <h1 className="text-4xl font-bold text-[#FFFDD0]">Mucho Gusto Xo</h1>
                  </div>
                  <p className="luxury-text-accent text-lg">Sign in to your account</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#D4AF37]/30 mb-6">
                  <button
                    onClick={() => setTab('user')}
                    className={`flex-1 py-3 font-semibold text-sm transition-colors relative ${tab === 'user' ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-[#FFFDD0]'}`}
                  >
                    Member Login
                    {tab === 'user' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
                  </button>
                  <button
                    onClick={() => setTab('admin')}
                    className={`flex-1 py-3 font-semibold text-sm transition-colors relative ${tab === 'admin' ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-[#FFFDD0]'}`}
                  >
                    Admin Login
                    {tab === 'admin' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
                  </button>
                </div>

                {/* User Tab */}
                {tab === 'user' && (
                  <form onSubmit={handleUserSubmit} className="luxury-card p-6 sm:p-8 space-y-5">
                    <p className="text-xs text-[#F1E5AC]/70 -mt-1">Sign in or create an account with your email. Phone is optional.</p>
                    <FormInput
                      label={<>Email <span className="text-red-400">*</span></>}
                      name="email"
                      type="email"
                      value={userForm.email}
                      onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      error={userErrors.email}
                    />
                    <FormInput
                      label={<>Name <span className="luxury-text-accent font-normal">(Optional)</span></>}
                      name="name"
                      value={userForm.name}
                      onChange={e => setUserForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="Enter your name"
                    />
                    <FormInput
                      label={<>Instagram <span className="luxury-text-accent font-normal">(Optional)</span></>}
                      name="instagram"
                      value={userForm.instagram}
                      onChange={e => setUserForm(p => ({ ...p, instagram: e.target.value }))}
                      placeholder="@username"
                      error={userErrors.instagram}
                    />
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#FFFDD0]">Phone <span className="luxury-text-accent font-normal">(Optional)</span></label>
                      <div className="flex gap-3">
                        <div className="w-[140px]">
                          <select
                            value={userForm.countryCode}
                            onChange={e => setUserForm(p => ({ ...p, countryCode: e.target.value }))}
                            className="luxury-input appearance-none bg-[rgba(15,0,26,0.9)]"
                          >
                            {countryCodes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                          </select>
                        </div>
                        <input
                          type="tel"
                          value={userForm.phone}
                          onChange={e => setUserForm(p => ({ ...p, phone: e.target.value }))}
                          placeholder="Phone number"
                          className={`luxury-input flex-1 ${userErrors.phone ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {userErrors.phone && <p className="text-sm text-red-400">{userErrors.phone}</p>}
                    </div>
                    {userError && <p className="text-sm text-red-400 text-center">{userError}</p>}
                    <button type="submit" disabled={userLoading} className="luxury-button w-full py-4 text-lg mt-2">
                      {userLoading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-[#0f001a] border-t-transparent rounded-full animate-spin" />
                          Signing in...
                        </div>
                      ) : 'Sign In / Join'}
                    </button>
                  </form>
                )}

                {/* Admin Tab */}
                {tab === 'admin' && (
                  <form onSubmit={handleAdminSubmit} className="luxury-card p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-[#D4AF37]" />
                      <p className="text-xs text-[#F1E5AC]/70">Admin access only.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#FFFDD0]">Email</label>
                      <input
                        type="email"
                        value={adminForm.email}
                        onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))}
                        className="luxury-input"
                        placeholder="admin@thehomies.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#FFFDD0]">Password</label>
                      <input
                        type="password"
                        value={adminForm.password}
                        onChange={e => setAdminForm(p => ({ ...p, password: e.target.value }))}
                        className="luxury-input"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    {adminError && <p className="text-sm text-red-400 text-center">{adminError}</p>}
                    <button type="submit" disabled={adminLoading} className="luxury-button w-full py-4 text-lg flex items-center justify-center gap-2">
                      {adminLoading ? (
                        <div className="w-5 h-5 border-2 border-[#0f001a] border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <><LogIn className="w-5 h-5" /> Admin Sign In</>
                      )}
                    </button>
                  </form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
