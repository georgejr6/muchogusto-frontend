import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle, Lock } from 'lucide-react';
import Header from '@/components/Header';
import PhoneInput from '@/components/PhoneInput';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { loginUser, loginAdmin } = useAuth();
  const [tab, setTab] = useState('member');

  // Member login — phone OR email
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+57');
  const [email, setEmail] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');
  const [memberSuccess, setMemberSuccess] = useState(false);

  // Admin login
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  const handleMemberLogin = async (e) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    const trimmedEmail = email.trim();

    if (!trimmedPhone && !trimmedEmail) {
      setMemberError('Enter your phone number or email to sign in.');
      return;
    }

    setMemberLoading(true);
    setMemberError('');

    const payload = {};
    if (trimmedPhone) payload.phone = `${countryCode}${trimmedPhone}`;
    if (trimmedEmail) payload.email = trimmedEmail;

    const result = await loginUser(payload);
    if (result.success) {
      setMemberSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      setMemberError(result.error || 'Login failed');
    }
    setMemberLoading(false);
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setAdminLoading(true);
    setAdminError('');
    const result = await loginAdmin(adminForm.email, adminForm.password);
    if (result.success) {
      toast({ title: 'Welcome back.' });
      navigate('/admin-dashboard');
    } else {
      setAdminError(result.error || 'Invalid credentials');
    }
    setAdminLoading(false);
  };

  return (
    <>
      <Helmet><title>Login | Mucho Gusto Xo</title></Helmet>

      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <Header />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="flex-1 flex flex-col items-center justify-center p-4 z-10">
          <AnimatePresence mode="wait">
            {tab === 'member' && memberSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center"
              >
                <div className="w-24 h-24 bg-[rgba(15,0,26,0.85)] rounded-full flex items-center justify-center mb-6 border-[3px] border-[#D4AF37] shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                  <CheckCircle className="w-12 h-12 text-[#D4AF37]" />
                </div>
                <h2 className="text-3xl font-bold text-[#FFFDD0] mb-2">Welcome back!</h2>
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
                  {[
                    { id: 'member', label: 'Member Login' },
                    { id: 'admin',  label: 'Admin Login' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTab(t.id)}
                      className={`flex-1 py-3 font-semibold text-sm transition-colors relative
                        ${tab === t.id ? 'text-[#D4AF37]' : 'text-muted-foreground hover:text-[#FFFDD0]'}`}
                    >
                      {t.label}
                      {tab === t.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#D4AF37]" />}
                    </button>
                  ))}
                </div>

                {/* ── Member Login ── */}
                {tab === 'member' && (
                  <>
                    {/* OAuth buttons */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/discord`}
                        className="flex items-center justify-center gap-2 h-12 rounded-lg bg-[#5865F2] hover:bg-[#4752C4] text-white text-sm font-semibold transition-colors"
                      >
                        <svg className="h-4 w-4 fill-white shrink-0" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/>
                        </svg>
                        Discord
                      </a>
                      <a
                        href={`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/google`}
                        className="flex items-center justify-center gap-2 h-12 rounded-lg bg-white hover:bg-gray-100 text-gray-800 text-sm font-semibold transition-colors border border-gray-200"
                      >
                        <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Google
                      </a>
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-[#D4AF37]/20" />
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">or sign in with</span>
                      <div className="flex-1 h-px bg-[#D4AF37]/20" />
                    </div>

                    <form onSubmit={handleMemberLogin} className="luxury-card p-6 sm:p-8 space-y-5">
                      <p className="text-xs text-[#F1E5AC]/70">
                        Enter the phone number <span className="text-[#D4AF37]">or</span> email address on your account.
                      </p>

                      {/* Email field */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-[#FFFDD0]">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={e => { setEmail(e.target.value); setMemberError(''); }}
                          placeholder="you@example.com"
                          className="luxury-input w-full"
                        />
                      </div>

                      {/* Divider */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-[#D4AF37]/20" />
                        <span className="text-xs text-muted-foreground uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-[#D4AF37]/20" />
                      </div>

                      {/* Phone field */}
                      <PhoneInput
                        label="Phone Number"
                        countryCode={countryCode}
                        onCountryChange={setCountryCode}
                        phone={phone}
                        onPhoneChange={val => { setPhone(val); setMemberError(''); }}
                      />

                      {memberError && (
                        <div className="text-sm text-red-400 text-center">
                          {memberError}
                          {memberError.toLowerCase().includes('sign up') && (
                            <span> <Link to="/signup" className="text-[#D4AF37] underline">Sign up here</Link></span>
                          )}
                        </div>
                      )}

                      <button type="submit" disabled={memberLoading} className="luxury-button w-full py-4 text-lg">
                        {memberLoading
                          ? <span className="flex items-center justify-center gap-2">
                              <span className="w-5 h-5 border-2 border-[#0f001a] border-t-transparent rounded-full animate-spin" />
                              Signing in...
                            </span>
                          : 'Sign In'
                        }
                      </button>
                    </form>

                    <p className="text-center text-sm luxury-text-accent mt-4">
                      Don't have an account?{' '}
                      <Link to="/signup" className="text-[#D4AF37] hover:underline font-medium">
                        Create one
                      </Link>
                    </p>
                  </>
                )}

                {/* ── Admin Login ── */}
                {tab === 'admin' && (
                  <form onSubmit={handleAdminSubmit} className="luxury-card p-6 sm:p-8 space-y-5">
                    <div className="flex items-center gap-2 mb-1">
                      <Lock className="w-4 h-4 text-[#D4AF37]" />
                      <p className="text-xs text-[#F1E5AC]/70">Admin access only.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#FFFDD0]">Email</label>
                      <input
                        type="email" value={adminForm.email}
                        onChange={e => setAdminForm(p => ({ ...p, email: e.target.value }))}
                        className="luxury-input" placeholder="admin@example.com" required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-[#FFFDD0]">Password</label>
                      <input
                        type="password" value={adminForm.password}
                        onChange={e => setAdminForm(p => ({ ...p, password: e.target.value }))}
                        className="luxury-input" placeholder="••••••••" required
                      />
                    </div>
                    {adminError && <p className="text-sm text-red-400 text-center">{adminError}</p>}
                    <button type="submit" disabled={adminLoading} className="luxury-button w-full py-4 text-lg flex items-center justify-center gap-2">
                      {adminLoading
                        ? <span className="w-5 h-5 border-2 border-[#0f001a] border-t-transparent rounded-full animate-spin" />
                        : 'Sign In'
                      }
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
