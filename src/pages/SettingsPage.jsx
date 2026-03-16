import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Bell, Lock, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { updateSettings, changeAdminPassword } from '@/lib/apiClient';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, adminUser, updateProfileData, isAdminAuthenticated } = useAuth();

  // Shared email / notifications (user)
  const [email, setEmail] = useState(userProfile?.email || '');
  const [emailNotifications, setEmailNotifications] = useState(userProfile?.email_notifications ?? true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [prefsSaved, setPrefsSaved] = useState(false);

  // Admin password change
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleSavePrefs = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const updated = await updateSettings({ email, email_notifications: emailNotifications });
      await updateProfileData(updated);
      setPrefsSaved(true);
      setTimeout(() => setPrefsSaved(false), 2500);
    } catch (err) {
      toast({ title: err.message, variant: 'destructive' });
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    if (pwForm.next !== pwForm.confirm) {
      setPwError('New passwords do not match');
      return;
    }
    if (pwForm.next.length < 8) {
      setPwError('Password must be at least 8 characters');
      return;
    }
    setPwLoading(true);
    try {
      await changeAdminPassword(pwForm.current, pwForm.next);
      toast({ title: 'Password updated successfully' });
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Settings | Mucho Gusto Xo</title></Helmet>

      <div className="min-h-screen bg-[#0f001a] flex flex-col">
        <Header />

        <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">

          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-[#D4AF37] hover:text-[#F1E5AC] transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#FFFDD0]">Settings</h1>
          </div>

          {/* Email & Notifications (users only) */}
          {!isAdminAuthenticated && (
            <div className="luxury-card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#FFFDD0] flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#D4AF37]" /> Email & Notifications
              </h2>

              <form onSubmit={handleSavePrefs} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#FFFDD0]">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="luxury-input"
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-muted-foreground">Used for event reminders and messages.</p>
                </div>

                <div className="flex items-center justify-between p-4 border border-[#D4AF37]/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <p className="text-sm font-medium text-[#FFFDD0]">Email Notifications</p>
                      <p className="text-xs text-muted-foreground">Event reminders and new messages</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEmailNotifications(p => !p)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      emailNotifications ? 'bg-[#D4AF37]' : 'bg-[rgba(212,175,55,0.2)]'
                    }`}
                  >
                    <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      emailNotifications ? 'translate-x-7' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                <button type="submit" disabled={savingPrefs} className="luxury-button px-6 py-2.5 flex items-center gap-2">
                  {prefsSaved ? <><Check className="w-4 h-4" /> Saved!</> : savingPrefs ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>
          )}

          {/* Admin password change */}
          {isAdminAuthenticated && (
            <div className="luxury-card p-6 space-y-5">
              <h2 className="text-lg font-semibold text-[#FFFDD0] flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#D4AF37]" /> Change Password
              </h2>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { label: 'Current Password', key: 'current' },
                  { label: 'New Password',     key: 'next' },
                  { label: 'Confirm New Password', key: 'confirm' },
                ].map(({ label, key }) => (
                  <div key={key} className="space-y-2">
                    <label className="text-sm font-medium text-[#FFFDD0]">{label}</label>
                    <input
                      type="password"
                      value={pwForm[key]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      className="luxury-input"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                ))}
                {pwError && <p className="text-sm text-red-400">{pwError}</p>}
                <button type="submit" disabled={pwLoading} className="luxury-button px-6 py-2.5">
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default SettingsPage;
