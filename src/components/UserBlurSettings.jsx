
import React from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

const UserBlurSettings = ({ user, onUpdate }) => {
  if (!user) return null;

  const isAdminOverriding = user.admin_blur_status !== null && user.admin_blur_status !== undefined;
  const currentActualStatus = isAdminOverriding ? user.admin_blur_status : user.user_blur_preference;

  const handleToggle = () => {
    onUpdate({ user_blur_preference: !user.user_blur_preference });
  };

  return (
    <div className="bg-[rgba(15,0,26,0.5)] rounded-xl p-5 border border-[#D4AF37]/30 shadow-[inset_0_0_20px_rgba(212,175,55,0.02)]">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-lg font-semibold text-[#FFFDD0]">Privacy: Profile Visibility</h4>
            {isAdminOverriding && (
              <span className="flex items-center text-[10px] text-[#D4AF37] bg-[rgba(212,175,55,0.1)] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                <ShieldAlert className="w-3 h-3 mr-1" /> Admin Overridden
              </span>
            )}
          </div>
          <p className="text-sm luxury-text-accent">
            Choose whether to show or blur your profile on public community pages.
            <br />
            <span className="text-xs opacity-70 mt-1 block">Note: Admin blur status takes priority over your preference.</span>
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="px-3 py-1.5 rounded-lg bg-[rgba(212,175,55,0.05)] border border-[#D4AF37]/20 text-sm flex items-center gap-2">
              <span className="text-muted-foreground">Current Public Status:</span>
              <span className={`font-bold flex items-center gap-1 ${currentActualStatus ? 'text-red-400' : 'text-green-400'}`}>
                {currentActualStatus ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {currentActualStatus ? 'Blurred' : 'Visible'}
              </span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex flex-col items-end">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={!!user.user_blur_preference}
              onChange={handleToggle}
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4AF37]"></div>
          </label>
          <span className="text-xs text-muted-foreground mt-2 font-medium uppercase tracking-wide">
            {user.user_blur_preference ? 'Prefer Blurred' : 'Prefer Visible'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default UserBlurSettings;
