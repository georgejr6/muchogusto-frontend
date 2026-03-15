import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowLeft, User, MapPin, Calendar, Mail, Phone, Edit } from 'lucide-react';
import Header from '@/components/Header';
import { useAuth } from '@/contexts/AuthContext';

const MyProfilePage = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();

  if (!userProfile) { navigate('/login'); return null; }

  return (
    <>
      <Helmet><title>My Profile | Mucho Gusto Xo</title></Helmet>
      <div className="min-h-screen flex flex-col bg-[#0f001a]">
        <Header />
        <div className="flex-1 p-4 md:p-8">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[#F1E5AC] hover:text-[#D4AF37] transition-colors">
                <ArrowLeft className="w-5 h-5" /> Back
              </button>
              <button onClick={() => navigate('/profile-edit')} className="luxury-button-outline px-4 py-2 flex items-center gap-2 text-sm">
                <Edit className="w-4 h-4" /> Edit Profile
              </button>
            </div>

            <div className="luxury-card overflow-hidden">
              <div className="p-8 bg-gradient-to-b from-[rgba(212,175,55,0.1)] to-transparent border-b border-[#D4AF37]/20 flex flex-col items-center text-center">
                <div className="w-28 h-28 rounded-full bg-[rgba(15,0,26,0.9)] border-2 border-[#D4AF37] flex items-center justify-center mb-4 overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  {userProfile.photo_url ? (
                    <img src={userProfile.photo_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-14 h-14 text-[#D4AF37]" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-[#FFFDD0]">{userProfile.name || 'Anonymous Member'}</h1>
                {userProfile.instagram && <p className="text-[#D4AF37] font-mono mt-1">@{userProfile.instagram}</p>}
              </div>

              <div className="p-6 space-y-4">
                {userProfile.email && (
                  <div className="flex items-center gap-3 text-sm text-[#FFFDD0]">
                    <Mail className="w-4 h-4 text-[#D4AF37]" /><span>{userProfile.email}</span>
                  </div>
                )}
                {userProfile.phone && (
                  <div className="flex items-center gap-3 text-sm text-[#FFFDD0]">
                    <Phone className="w-4 h-4 text-[#D4AF37]" /><span>{userProfile.phone}</span>
                  </div>
                )}
                {userProfile.city && (
                  <div className="flex items-center gap-3 text-sm text-[#FFFDD0]">
                    <MapPin className="w-4 h-4 text-[#D4AF37]" /><span>{userProfile.city}</span>
                  </div>
                )}
                {userProfile.created_at && (
                  <div className="flex items-center gap-3 text-sm text-[#FFFDD0]">
                    <Calendar className="w-4 h-4 text-[#D4AF37]" /><span>Joined {new Date(userProfile.created_at).toLocaleDateString()}</span>
                  </div>
                )}
                {userProfile.bio && (
                  <div className="pt-2 border-t border-[#D4AF37]/20">
                    <p className="text-xs text-[#D4AF37] mb-1 uppercase tracking-wider">Bio</p>
                    <p className="text-sm luxury-text-accent">{userProfile.bio}</p>
                  </div>
                )}
                {userProfile.hobbies && (
                  <div>
                    <p className="text-xs text-[#D4AF37] mb-1 uppercase tracking-wider">Hobbies</p>
                    <p className="text-sm luxury-text-accent">{userProfile.hobbies}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MyProfilePage;
