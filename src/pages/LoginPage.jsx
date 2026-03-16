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
