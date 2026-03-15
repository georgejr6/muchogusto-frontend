
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, CheckCircle, XCircle, Clock, EyeOff } from 'lucide-react';
import { getBlurStatus } from '@/contexts/AuthContext';
import BlurToggleButton from './BlurToggleButton';

const RSVPCard = ({ user, rsvpStatus, rsvpDate, isAdmin = false, onBlurToggle }) => {
  const navigate = useNavigate();
  const isBlurred = getBlurStatus(user);

  const getStatusBadge = (status) => {
    if (status === 'interested') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Interested
        </span>
      );
    }
    if (status === 'not_interested') {
      return (
        <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
          <XCircle className="w-3 h-3" /> Declined
        </span>
      );
    }
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
        <Clock className="w-3 h-3" /> Pending
      </span>
    );
  };

  const handleClick = () => {
    if (isAdmin || !isBlurred) {
      navigate(`/user/${user.id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`bg-[rgba(15,0,26,0.6)] border border-[#D4AF37]/30 rounded-lg p-3 relative group transition-colors ${
        isAdmin || !isBlurred ? 'cursor-pointer hover:bg-[rgba(212,175,55,0.1)]' : ''
      }`}
    >
      {/* Admin Blur Toggle */}
      {isAdmin && (
        <div className="absolute top-2 right-2 z-10">
          <BlurToggleButton 
            userId={user.id} 
            isBlurred={isBlurred} 
            onToggle={onBlurToggle} 
            isAdmin={isAdmin}
            adminStatus={user.admin_blur_status}
          />
        </div>
      )}

      {/* Blurred Indicator for Public */}
      {!isAdmin && isBlurred && (
        <div className="absolute top-2 right-2 z-10">
          <EyeOff className="w-4 h-4 text-muted-foreground opacity-50" />
        </div>
      )}

      <div className={`flex items-center justify-between ${isAdmin ? 'group-hover:opacity-100 group-hover:blur-none transition-all duration-300' : ''}`}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-[rgba(212,175,55,0.2)] border border-[#D4AF37]/50 flex items-center justify-center overflow-hidden shrink-0 ${isBlurred ? 'blur-[8px]' : ''}`}>
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-[#D4AF37]" />
            )}
          </div>
          <div className={`${isBlurred ? 'opacity-50 blur-sm select-none' : ''}`}>
            <h4 className="font-bold text-[#FFFDD0] text-sm">{user.name || 'Unknown'}</h4>
            {user.nickname && <p className="text-xs luxury-text-accent">"{user.nickname}"</p>}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1 mt-6 sm:mt-0">
          {getStatusBadge(rsvpStatus)}
          {rsvpDate && <span className="text-[10px] text-muted-foreground">{new Date(rsvpDate).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
};

export default RSVPCard;
