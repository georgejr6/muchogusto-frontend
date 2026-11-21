import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import SocialAuthButtons from '@/components/SocialAuthButtons';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/lib/i18n.jsx';

const CODE_LEN = 6;

// Six boxes, one hidden-feeling input each. Supports paste and iOS/Android one-time-code autofill.
const CodeInput = ({ value, onChange, onComplete, disabled }) => {
  const refs = useRef([]);
  const digits = Array.from({ length: CODE_LEN }, (_, i) => value[i] || '');

  const setAt = (i, ch) => {
    const arr = digits.slice();
    arr[i] = ch;
    const next = arr.join('').slice(0, CODE_LEN);
    onChange(next);
    if (next.length === CODE_LEN && !next.includes(' ')) onComplete?.(next);
  };

  const handleChange = (i, e) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) { setAt(i, ''); return; }
    if (raw.length > 1) {
      const next = raw.slice(0, CODE_LEN);
      onChange(next);
      refs.current[Math.min(next.length, CODE_LEN - 1)]?.focus();
      if (next.length === CODE_LEN) onComplete?.(next);
      return;
    }
    setAt(i, raw);
    if (i < CODE_LEN - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex justify-between gap-2" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          pattern="[0-9]*"
          maxLength={CODE_LEN}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          className="mg-input !px-0 text-center font-display text-2xl"
          style={{ width: '100%', minWidth: 0 }}
        />
      ))}
    </div>
  );
};

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { sendLoginCode, confirmLoginCode, loginAdmin } = useAuth();
  const [tab, setTab] = useState('member');

  const redirectTo = location.state?.from && location.state.from !== '/login' ? location.state.from : '/tonight';

  // member
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // host
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [adminBusy, setAdminBusy] = useState(false);
  const [adminError, setAdminError] = useState('');

  const requestCode = async (e) => {
    e?.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!clean) { setError(t('auth.need_email')); return; }
    setBusy(true);
    setError('');
    const r = await sendLoginCode({ email: clean });
    setBusy(false);
    if (r.success) { setCodeSent(true); setCode(''); }
    else setError(r.error || t('id.err'));
  };

  const verify = async (finalCode) => {
    const c = (finalCode || code).replace(/\D/g, '');
    if (c.length !== CODE_LEN) { setError(t('auth.need_code')); return; }
    setBusy(true);
    setError('');
    const r = await confirmLoginCode({ email: email.trim().toLowerCase(), code: c });
    setBusy(false);
    if (r.success) {
      // Waitlisted members have no city yet; only send to onboarding if they never gave location consent.
      const needsOnboarding = !r.user?.location_consent;
      navigate(needsOnboarding ? '/welcome' : redirectTo, { replace: true, state: { from: redirectTo } });
    } else {
      setError(r.error || t('id.err'));
      setCode('');
    }
  };

  const adminSubmit = async (e) => {
    e.preventDefault();
    setAdminBusy(true);
    setAdminError('');
    const r = await loginAdmin(adminForm.email, adminForm.password);
    setAdminBusy(false);
    if (r.success) {
      toast({ title: t('auth.welcome') });
      navigate('/host', { replace: true });
    } else {
      setAdminError(r.error || 'Invalid credentials');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Helmet><title>{t('auth.signin')} | Mucho Gusto Xo</title></Helmet>
      <header className="px-4 py-4 sm:px-6">
        <Link to="/" className="font-display text-lg text-primary">Mucho Gusto</Link>
      </header>

      <div className="flex flex-1 items-start justify-center px-4 pb-16 pt-6">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-3xl">{t('auth.signin_title')}</h1>
            <p className="text-sm text-muted-foreground">{t('auth.signin_sub')}</p>
          </div>

          <div role="tablist" className="flex gap-1 rounded-full border border-border bg-card/60 p-1">
            {[['member', t('auth.member')], ['admin', t('auth.host')]].map(([id, label]) => (
              <button
                key={id}
                role="tab"
                aria-selected={tab === id}
                onClick={() => setTab(id)}
                className={`flex-1 rounded-full py-2 text-sm font-medium transition ${tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === 'member' ? (
              <motion.div key="member" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-5">
                {!codeSent ? (
                  <>
                    <SocialAuthButtons />
                    <div className="flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="text-xs text-muted-foreground">{t('auth.or_email')}</span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <form onSubmit={requestCode} className="space-y-4">
                      <label className="block space-y-1.5">
                        <span className="text-sm text-muted-foreground">{t('auth.email')}</span>
                        <input
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => { setEmail(e.target.value); setError(''); }}
                          placeholder="you@example.com"
                          className="mg-input"
                        />
                      </label>
                      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
                      <button type="submit" disabled={busy} className="mg-btn w-full">{busy ? t('auth.sending') : t('auth.send_code')}</button>
                    </form>
                    <p className="text-center text-sm text-muted-foreground">
                      {t('auth.no_account')} <Link to="/signup" className="text-primary hover:underline">{t('auth.create')}</Link>
                    </p>
                  </>
                ) : (
                  <div className="space-y-5">
                    <div className="space-y-1 text-center">
                      <h2 className="text-xl">{t('auth.code_title')}</h2>
                      <p className="text-sm text-muted-foreground">{t('auth.code_sub')} <span className="text-foreground">{email}</span></p>
                    </div>
                    <CodeInput value={code} onChange={(v) => { setCode(v); setError(''); }} onComplete={verify} disabled={busy} />
                    {error && <p className="text-center text-sm text-destructive" role="alert">{error}</p>}
                    <button onClick={() => verify()} disabled={busy || code.length !== CODE_LEN} className="mg-btn w-full">
                      {busy ? t('auth.verifying') : t('auth.verify')}
                    </button>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <button onClick={() => { setCodeSent(false); setCode(''); setError(''); }} className="hover:text-foreground">{t('auth.use_other')}</button>
                      <button onClick={requestCode} disabled={busy} className="hover:text-foreground">{t('auth.resend')}</button>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.form key="admin" onSubmit={adminSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <p className="text-center text-xs text-muted-foreground">{t('auth.host_note')}</p>
                <label className="block space-y-1.5">
                  <span className="text-sm text-muted-foreground">{t('auth.email')}</span>
                  <input type="email" required autoComplete="username" value={adminForm.email} onChange={(e) => setAdminForm((p) => ({ ...p, email: e.target.value }))} className="mg-input" />
                </label>
                <label className="block space-y-1.5">
                  <span className="text-sm text-muted-foreground">{t('auth.password')}</span>
                  <input type="password" required autoComplete="current-password" value={adminForm.password} onChange={(e) => setAdminForm((p) => ({ ...p, password: e.target.value }))} className="mg-input" />
                </label>
                {adminError && <p className="text-sm text-destructive" role="alert">{adminError}</p>}
                <button type="submit" disabled={adminBusy} className="mg-btn w-full">{adminBusy ? t('auth.verifying') : t('auth.signin')}</button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
