import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Phone, Instagram, Calendar, ChevronRight, EyeOff } from 'lucide-react';
import { getBlurStatus } from '@/contexts/AuthContext';
import BlurToggleButton from './BlurToggleButton';

const MemberCard = ({ member, isAdmin = false, onBlurToggle }) => {
  const navigate = useNavigate();

  const getCompletionPercentage = (profile) => {
    const requiredFields = ['dob', 'email', 'hobbies', 'bio'];
    const completed = requiredFields.filter(f => profile[f] && String(profile[f]).trim() !== '').length;
    return requiredFields.length > 0 ? Math.round((completed / requiredFields.length) * 100) : 0;
  };

  const joinDate = member.created_at ? new Date(member.created_at).toLocaleDateString() : 'Unknown';
  const isBlurred = getBlurStatus(member);

  const handleClick = () => {
    if (isAdmin) navigate(`/user/${member.id}`);
  };

  // Public (non-admin) view — no contact info
  if (!isAdmin) {
    return (
      <div className="luxury-card p-5 relative overflow-hidden">
        {isBlurred && (
          <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-[10px] text-muted-foreground bg-[rgba(15,0,26,0.8)] px-2 py-1 rounded border border-white/10">
            <EyeOff className="w-3 h-3" /> Anonymized
          </div>
        )}
        <div className="flex flex-col items-center text-center gap-3 py-2">
          <div className={`w-16 h-16 rounded-full bg-[rgba(212,175,55,0.2)] border-2 border-[#D4AF37] flex items-center justify-center overflow-hidden ${isBlurred ? 'blur-[8px]' : ''}`}>
            {member.photo_url ? (
              <img src={member.photo_url} alt="Member" className="w-full h-full object-cover" />
            ) : (
              <User className="w-7 h-7 text-[#D4AF37]" />
            )}
          </div>
          <div className={isBlurred ? 'blur-md select-none' : ''}>
            <p className="text-sm font-semibold text-[#FFFDD0]">Member</p>
            <p className="text-xs luxury-text-accent mt-1 flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3" /> Joined {joinDate}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Admin view — full details
  const completion = getCompletionPercentage(member);

  return (
    <div
      onClick={handleClick}
      className="luxury-card p-5 group relative overflow-hidden transition-all duration-300 cursor-pointer hover:bg-[rgba(212,175,55,0.05)] hover:shadow-[0_8px_30px_rgba(212,175,55,0.2)]"
    >
      <div className="absolute top-1/2 right-4 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <ChevronRight className="w-6 h-6 text-[#D4AF37]" />
      </div>

      <div className="absolute top-3 right-3 z-10">
        <BlurToggleButton
          userId={member.id}
          isBlurred={isBlurred}
          onToggle={onBlurToggle}
          isAdmin={true}
          adminStatus={member.admin_blur_status}
        />
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-full bg-[rgba(212,175,55,0.2)] border-2 border-[#D4AF37] flex items-center justify-center overflow-hidden shrink-0 ${isBlurred ? 'blur-[8px]' : ''}`}>
          {member.photo_url ? (
            <img src={member.photo_url} alt="Member" className="w-full h-full object-cover" />
          ) : (
            <User className="w-7 h-7 text-[#D4AF37]" />
          )}
        </div>
        <div className={`flex-1 min-w-0 pr-8 ${isBlurred ? 'opacity-50 blur-md select-none' : ''}`}>
          <h3 className="text-lg font-bold text-[#FFFDD0] truncate">
            {member.name || 'Unknown User'}
          </h3>
          <div className="flex items-center gap-1 text-[#D4AF37] text-sm mt-0.5">
            <Instagram className="w-3.5 h-3.5" />
            <span className="truncate">@{member.instagram || 'N/A'}</span>
          </div>
        </div>
      </div>

      <div className={`space-y-2 mb-4 text-sm luxury-text-accent ${isBlurred ? 'opacity-50 blur-md select-none' : ''}`}>
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-[#D4AF37]" />
          <span>{member.phone || 'No phone'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-[#D4AF37]" />
          <span>Joined: {joinDate}</span>
        </div>
      </div>

      <div className="w-full">
        <div className={`flex justify-between text-xs mb-1 ${isBlurred ? 'opacity-50 blur-md select-none' : ''}`}>
          <span className="text-muted-foreground">Profile Completion</span>
          <span className="text-[#D4AF37] font-bold">{completion}%</span>
        </div>
        <div className={`w-full h-1.5 bg-[rgba(15,0,26,0.9)] rounded-full overflow-hidden border border-[#D4AF37]/30 ${isBlurred ? 'blur-[2px]' : ''}`}>
          <div style={{ width: `${completion}%` }} className="bg-[#D4AF37] h-full transition-all" />
        </div>
      </div>
    </div>
  );
};

export default MemberCard;
