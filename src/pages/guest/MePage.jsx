import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, LogOut, MapPin, Pencil, ShieldCheck, Trash2 } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import GuestShell from '@/components/shell/GuestShell';
import { HostAvatar } from '@/components/InviteCard';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from '@/lib/i18n.jsx';
import { deleteMyAccount, getCities, shareLocation } from '@/lib/apiClient';
import { getPosition } from '@/lib/guestUtils';

const MePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userProfile, updateProfileData, logoutUser, refreshProfile } = useAuth();
  const [cityName, setCityName] = useState('');
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!userProfile?.city_id) { setCityName(''); return; }
    getCities().then((cs) => setCityName(cs.find((c) => c.id === userProfile.city_id)?.name || '')).catch(() => {});
  }, [userProfile?.city_id]);

  if (!userProfile) return null;
  const verified = userProfile.verification_status === 'verified';
  const blurred = !!userProfile.user_blur_preference;

  const updateLocation = async () => {
    setLocating(true);
    try {
      const { lat, lng } = await getPosition();
      await shareLocation(lat, lng);
      await refreshProfile?.();
      toast({ title: t('me.loc_ok') });
    } catch {
      toast({ title: t('me.loc_err'), variant: 'destructive' });
    } finally {
      setLocating(false);
    }
  };

  const toggleBlur = async () => {
    try {
      await updateProfileData({ user_blur_preference: !blurred });
    } catch (e) {
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    }
  };

  const signOut = () => { logoutUser(); navigate('/'); };

  const deleteAccount = async () => {
    try {
      await deleteMyAccount();
      logoutUser();
      navigate('/', { replace: true });
    } catch (e) {
      toast({ title: t('id.err'), description: e.message, variant: 'destructive' });
    }
  };

  const Row = ({ to, icon: Icon, children }) => (
    <Link to={to} className="mg-card mg-card-hover flex items-center gap-3 p-4">
      <Icon className="h-4 w-4 text-primary" /><span className="flex-1 text-sm">{children}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );

  return (
    <GuestShell title={t('me.title')}>
      <Helmet><title>{t('me.title')} | Mucho Gusto Xo</title></Helmet>
      <div className="mg-page space-y-5">
        <div className="flex flex-col items-center gap-3 pt-2 text-center">
          <HostAvatar src={userProfile.photo_url} name={userProfile.name} size="h-24 w-24" />
          <div className="space-y-1.5">
            <h1 className="text-2xl">{userProfile.name || userProfile.email}</h1>
            {verified ? (
              <span className="mg-verified"><ShieldCheck className="h-3 w-3" />{t('me.verified')}</span>
            ) : (
              <Link to="/verify" className="mg-chip hover:border-primary/50"><ShieldCheck className="h-3 w-3" />{t('me.get_verified')}</Link>
            )}
          </div>
          {userProfile.bio && <p className="max-w-sm text-sm text-muted-foreground">{userProfile.bio}</p>}
        </div>

        <Row to="/profile-edit" icon={Pencil}>{t('me.edit')}</Row>
        <Row to="/notifications" icon={Bell}>{t('me.alerts')}</Row>

        <div className="mg-card flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <p className="mg-eyebrow">{t('me.city')}</p>
            <p className="flex items-center gap-1.5 truncate text-sm"><MapPin className="h-3.5 w-3.5 text-primary" />{cityName || t('me.no_city')}</p>
          </div>
          <button onClick={updateLocation} disabled={locating} className="mg-btn-ghost !px-4 !py-2 text-xs">
            {locating ? t('me.updating') : t('me.update_loc')}
          </button>
        </div>

        <div className="mg-card flex items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-medium">{blurred ? t('me.blur_on') : t('me.blur_off')}</p>
            <p className="text-xs text-muted-foreground">{t('me.blur_hint')}</p>
          </div>
          <button
            role="switch"
            aria-checked={blurred}
            onClick={toggleBlur}
            className={`relative h-7 w-12 shrink-0 rounded-full border border-border transition ${blurred ? 'bg-primary' : 'bg-accent'}`}
          >
            <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-foreground transition-all ${blurred ? 'left-6' : 'left-1'}`} />
          </button>
        </div>

        <button onClick={signOut} className="mg-btn-ghost w-full"><LogOut className="h-4 w-4" />{t('me.signout')}</button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="flex w-full items-center justify-center gap-2 py-2 text-xs text-muted-foreground hover:text-destructive">
              <Trash2 className="h-3.5 w-3.5" />{t('me.delete')}
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('me.delete')}</AlertDialogTitle>
              <AlertDialogDescription>{t('me.delete_confirm')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('id.cancel')}</AlertDialogCancel>
              <AlertDialogAction onClick={deleteAccount}>{t('me.delete_yes')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </GuestShell>
  );
};

export default MePage;
