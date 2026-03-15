import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ChevronRight, Settings } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileCompletion } from '@/hooks/useProfileCompletion';
import InvitationCard from '@/components/InvitationCard';
import Header from '@/components/Header';
import { getMyInvitations } from '@/lib/apiClient';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { userProfile, logoutUser } = useAuth();
  const { percentage, incompleteFields, isComplete } = useProfileCompletion(userProfile);
  const [invitations, setInvitations] = useState([]);

  useEffect(() => {
    if (userProfile) {
      getMyInvitations()
        .then(data => setInvitations(data))
        .catch(console.error);
    }
  }, [userProfile]);

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  // Shape invitations into the format InvitationCard expects
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

  const userActions = (
    <div className="flex items-center gap-3">
      <span className="text-xs sm:text-sm luxury-text-accent font-mono truncate max-w-[100px] sm:max-w-none">
        @{userProfile?.instagram || 'User'}
      </span>
      <button
        onClick={handleLogout}
        className="text-[#F1E5AC] hover:text-[#D4AF37] p-1.5 rounded-full hover:bg-[rgba(212,175,55,0.1)] transition-colors"
        title="Logout"
      >
        <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Mucho Gusto Xo Dashboard</title>
      </Helmet>

      <div className="min-h-screen pb-20 relative z-10 flex flex-col">
        <Header rightContent={userActions} />

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Invitations */}
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-2xl font-bold text-[#FFFDD0] flex items-center gap-2">
                Upcoming Invitations
              </h2>

              <div className="space-y-4">
                {formattedInvitations.length === 0 ? (
                  <div className="luxury-card border-dashed p-8 text-center bg-[rgba(15,0,26,0.5)]">
                    <p className="luxury-text-accent">No invitations yet. Check back soon!</p>
                  </div>
                ) : (
                  formattedInvitations.map(inv => (
                    <InvitationCard key={inv.id} invitation={inv} />
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Profile Status */}
            <div className="space-y-6">
              <div className="luxury-card p-6 overflow-hidden relative">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[rgba(212,175,55,0.1)] border-2 border-[#D4AF37]/60 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                    {userProfile?.photo_url ? (
                      <img src={userProfile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-[#D4AF37]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-[#FFFDD0] truncate">{userProfile?.name || 'Anonymous VIP'}</h3>
                    {userProfile?.instagram && (
                      <p className="text-[#D4AF37] font-mono text-sm">@{userProfile?.instagram}</p>
                    )}
                    <p className="luxury-text-accent text-xs mt-0.5">{userProfile?.phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/profile-edit')}
                  className="luxury-button-outline w-full py-2 flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> Edit Profile
                </button>
                <button
                  onClick={() => navigate('/my-profile')}
                  className="luxury-button-outline w-full py-2 flex items-center justify-center gap-2 mt-2"
                >
                  <User className="w-4 h-4" /> View My Profile
                </button>
              </div>

              <div className="luxury-card p-6 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-full h-1 ${isComplete ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]'}`} />

                <h3 className="text-lg font-semibold text-[#FFFDD0] mb-4">Profile Completion</h3>

                <div className="mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="luxury-text-accent">Progress</span>
                    <span className="font-bold text-[#D4AF37]">{percentage}%</span>
                  </div>
                  <div className="w-full bg-[rgba(15,0,26,0.9)] h-2 rounded-full overflow-hidden border border-[#D4AF37]/30">
                    <div
                      className="bg-[#D4AF37] h-full transition-all duration-500 ease-out relative"
                      style={{ width: `${percentage}%` }}
                    >
                      <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
                    </div>
                  </div>
                </div>

                {!isComplete ? (
                  <>
                    <p className="text-sm luxury-text-accent mb-4">
                      Complete your profile to receive event invitations.
                    </p>
                    <div className="space-y-2 mb-6">
                      {incompleteFields.slice(0, 4).map(field => (
                        <div key={field.name} className="flex items-center text-sm text-[#FFFDD0]/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37] mr-2 shadow-[0_0_5px_#D4AF37]" />
                          {field.label} {field.required && <span className="text-red-400 ml-1">*</span>}
                        </div>
                      ))}
                      {incompleteFields.length > 4 && (
                        <p className="text-xs luxury-text-accent pl-3">+ {incompleteFields.length - 4} more</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                    <p className="text-green-400 text-sm font-medium">Profile is complete! You're ready for invites.</p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/profile-edit')}
                  className="luxury-button w-full py-3 flex items-center justify-center gap-1"
                >
                  {isComplete ? 'Update Profile' : 'Complete Profile'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </main>
      </div>
    </>
  );
};

export default DashboardPage;
