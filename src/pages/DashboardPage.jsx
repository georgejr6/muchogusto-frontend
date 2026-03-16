import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Users, MessageSquare,
  Settings, LogOut, User, ChevronRight, Sparkles,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import InvitationCard from '@/components/InvitationCard';
import Header from '@/components/Header';
import UserMessaging from '@/components/UserMessaging';
import { getMyInvitations, getPublicEvents, getPublicUsers } from '@/lib/apiClient';

const NAV = [
  { id: 'home',      label: 'Home',      icon: LayoutDashboard },
  { id: 'events',    label: 'Events',    icon: CalendarDays },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'messages',  label: 'Messages',  icon: MessageSquare },
  { id: 'settings',  label: 'Settings',  icon: Settings },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userProfile, logoutUser } = useAuth();
  const { percentage, incompleteFields, isComplete } = useProfileCompletion(userProfile);
  const [section, setSection] = useState('home');
  const [invitations, setInvitations] = useState([]);
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (userProfile) {
      getMyInvitations().then(setInvitations).catch(console.error);
    }
  }, [userProfile]);

  useEffect(() => {
    if (section === 'events' && events.length === 0) {
      setLoadingEvents(true);
      getPublicEvents().then(setEvents).catch(console.error).finally(() => setLoadingEvents(false));
    }
    if (section === 'community' && members.length === 0) {
      setLoadingMembers(true);
      getPublicUsers().then(setMembers).catch(console.error).finally(() => setLoadingMembers(false));
    }
  }, [section]);

  const formattedInvitations = invitations.map(inv => ({
    id: inv.id,
    status: inv.status,
    event: {
      id: inv.event_id,
      name: inv.event_name,
      date: inv.event_date,
      time: inv.event_time,
      location: inv.event_location,
      description: inv.event_description,
      dress_code: inv.dress_code,
    },
  }));

  const handleLogout = () => { logoutUser(); navigate('/'); };

  const logoutBtn = (
    <button onClick={handleLogout} className="text-red-400 hover:text-red-300 flex items-center gap-1.5 text-sm font-medium transition-colors">
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  );

  // ── Section renders ────────────────────────────────────────────────────────

  const renderHome = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">

      {/* Left: Invitations */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold text-[#FFFDD0]">Your Invitations</h2>
        {formattedInvitations.length === 0 ? (
          <div className="luxury-card border-dashed p-10 text-center">
            <CalendarDays className="w-10 h-10 mx-auto mb-3 text-[#D4AF37]/40" />
            <p className="luxury-text-accent">No invitations yet. Check back soon!</p>
          </div>
        ) : (
          formattedInvitations.map(inv => <InvitationCard key={inv.id} invitation={inv} />)
        )}
      </div>

      {/* Right: Profile card */}
      <div className="space-y-4">
        <div className="luxury-card p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.1)] border-2 border-[#D4AF37]/60 flex items-center justify-center overflow-hidden flex-shrink-0">
              {userProfile?.photo_url
                ? <img src={userProfile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                : <User className="w-8 h-8 text-[#D4AF37]" />
              }
            </div>
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-[#FFFDD0] truncate">{userProfile?.name || 'Anonymous VIP'}</h3>
              {userProfile?.instagram && <p className="text-[#D4AF37] font-mono text-sm">@{userProfile.instagram}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/profile-edit')} className="luxury-button-outline flex-1 py-2 text-sm flex items-center justify-center gap-1">
              <Settings className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => navigate('/my-profile')} className="luxury-button-outline flex-1 py-2 text-sm flex items-center justify-center gap-1">
              <User className="w-4 h-4" /> View
            </button>
          </div>
        </div>

        <div className="luxury-card p-6">
          <div className={`h-1 -mt-6 -mx-6 mb-5 rounded-t-lg ${isComplete ? 'bg-green-500' : 'bg-[#D4AF37]'}`} />
          <h3 className="text-sm font-semibold text-[#FFFDD0] mb-3">Profile Completion</h3>
          <div className="flex justify-between text-sm mb-1.5">
            <span className="luxury-text-accent">Progress</span>
            <span className="font-bold text-[#D4AF37]">{percentage}%</span>
          </div>
          <div className="w-full bg-[rgba(15,0,26,0.9)] h-2 rounded-full overflow-hidden border border-[#D4AF37]/30 mb-4">
            <div className="bg-[#D4AF37] h-full transition-all duration-500" style={{ width: `${percentage}%` }} />
          </div>
          {!isComplete && (
            <div className="space-y-1.5 mb-4">
              {incompleteFields.slice(0, 3).map(f => (
                <div key={f.name} className="flex items-center text-xs text-[#FFFDD0]/70">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mr-2" /> {f.label}
                </div>
              ))}
              {incompleteFields.length > 3 && <p className="text-xs text-muted-foreground pl-3">+{incompleteFields.length - 3} more</p>}
            </div>
          )}
          <button onClick={() => navigate('/profile-edit')} className="luxury-button w-full py-2.5 text-sm flex items-center justify-center gap-1">
            {isComplete ? 'Update Profile' : 'Complete Profile'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderEvents = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-[#FFFDD0]">Events</h2>
      {loadingEvents
        ? <div className="luxury-text-accent text-center py-10">Loading events...</div>
        : events.length === 0
          ? <div className="luxury-card p-10 text-center text-muted-foreground"><CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No upcoming events yet.</p></div>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.map(ev => (
                <div
                  key={ev.id}
                  onClick={() => ev.share_token && navigate(`/e/${ev.share_token}`)}
                  className={`luxury-card p-5 space-y-2 ${ev.share_token ? 'cursor-pointer hover:border-[#D4AF37]/60 transition-colors' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-[#FFFDD0]">{ev.name}</h3>
                    <span className="text-xs text-[#D4AF37]/70 whitespace-nowrap">{new Date(ev.date).toLocaleDateString()}</span>
                  </div>
                  {ev.location && <p className="text-sm text-muted-foreground">{ev.location}</p>}
                  {ev.description && <p className="text-sm text-[#FFFDD0]/70 line-clamp-2">{ev.description}</p>}
                </div>
              ))}
            </div>
      }
    </div>
  );

  const renderCommunity = () => (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h2 className="text-xl font-bold text-[#FFFDD0]">Community <span className="text-muted-foreground text-sm font-normal">({members.length} members)</span></h2>
      {loadingMembers
        ? <div className="luxury-text-accent text-center py-10">Loading members...</div>
        : <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {members.map(m => (
              <div key={m.id} className="luxury-card p-3 flex flex-col items-center text-center gap-2">
                <div className="w-14 h-14 rounded-full bg-[rgba(212,175,55,0.1)] border border-[#D4AF37]/30 overflow-hidden flex items-center justify-center flex-shrink-0">
                  {m.photo_url && !m.is_blurred && !m.user_blur_preference
                    ? <img src={m.photo_url} alt="" className="w-full h-full object-cover" />
                    : <User className="w-7 h-7 text-[#D4AF37]/50" />
                  }
                </div>
                <p className="text-xs text-muted-foreground">Member</p>
              </div>
            ))}
          </div>
      }
    </div>
  );

  const renderContent = () => {
    switch (section) {
      case 'events':    return renderEvents();
      case 'community': return renderCommunity();
      case 'messages':  return <UserMessaging userProfile={userProfile} />;
      case 'settings':  return (
        <div className="animate-in fade-in duration-300">
          <div className="luxury-card p-6 space-y-4 max-w-lg">
            <h2 className="text-xl font-bold text-[#FFFDD0]">Settings</h2>
            <Link to="/settings" className="luxury-button-outline w-full py-3 flex items-center justify-center gap-2">
              <Settings className="w-4 h-4" /> Open Full Settings
            </Link>
            <Link to="/profile-edit" className="luxury-button-outline w-full py-3 flex items-center justify-center gap-2">
              <User className="w-4 h-4" /> Edit Profile
            </Link>
            <button onClick={handleLogout} className="w-full py-3 border border-red-500/40 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </div>
      );
      default: return renderHome();
    }
  };

  return (
    <>
      <Helmet><title>Dashboard | Mucho Gusto Xo</title></Helmet>

      <div className="min-h-screen flex flex-col bg-[#0f001a] text-[#FFFDD0]">
        <Header rightContent={logoutBtn} />

        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
          <aside className="w-56 bg-[rgba(15,0,26,0.95)] border-r border-[#D4AF37]/30 flex-col hidden md:flex">
            <div className="p-5 border-b border-[#D4AF37]/30 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <span className="font-bold text-[#D4AF37] tracking-tight">MG XO</span>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {NAV.map(item => {
                const Icon = item.icon;
                const active = section === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium text-sm
                      ${active ? 'bg-[#D4AF37] text-[#0f001a] shadow-[0_0_12px_rgba(212,175,55,0.3)]' : 'text-[#FFFDD0] hover:bg-[rgba(212,175,55,0.1)] hover:text-[#D4AF37]'}`}
                  >
                    <Icon className="w-4 h-4" /> {item.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex-1 flex flex-col overflow-hidden">
            {/* Mobile nav */}
            <div className="md:hidden p-3 border-b border-[#D4AF37]/30 bg-[rgba(15,0,26,0.95)]">
              <select
                value={section}
                onChange={e => setSection(e.target.value)}
                className="luxury-input py-1 px-2 text-sm w-full bg-[#0f001a]"
              >
                {NAV.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </select>
            </div>

            <div className="flex-1 p-4 md:p-8 overflow-y-auto">
              <div className="max-w-5xl mx-auto">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
