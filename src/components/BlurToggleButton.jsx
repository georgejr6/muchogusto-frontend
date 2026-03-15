import React, { useState } from 'react';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { setUserBlur } from '@/lib/apiClient';

const BlurToggleButton = ({ userId, isBlurred, onToggle, isAdmin, adminStatus }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  if (!isAdmin) return null;

  const handleToggle = async (e) => {
    e.stopPropagation();
    setIsLoading(true);
    try {
      const newStatus = !isBlurred;
      await setUserBlur(userId, newStatus);
      if (onToggle) onToggle(userId, newStatus);
      toast({
        title: `Profile ${newStatus ? 'Blurred' : 'Unblurred'}`,
        description: `User profile is now ${newStatus ? 'hidden' : 'visible'} to the public.`,
      });
    } catch (err) {
      toast({ title: 'Failed to update blur status', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const isAdminOverriding = adminStatus !== null && adminStatus !== undefined;

  return (
    <div className="flex items-center gap-2">
      {isAdminOverriding && (
        <div className="flex items-center text-[10px] text-[#D4AF37] bg-[rgba(212,175,55,0.1)] px-2 py-0.5 rounded-full border border-[#D4AF37]/30" title="Admin has explicitly set this status">
          <ShieldAlert className="w-3 h-3 mr-1" /> Admin
        </div>
      )}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${
          isBlurred
            ? 'bg-[#D4AF37] text-black hover:bg-[#F1E5AC]'
            : 'bg-[rgba(212,175,55,0.1)] text-[#D4AF37] border border-[#D4AF37]/50 hover:bg-[rgba(212,175,55,0.2)]'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isBlurred ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
        {isBlurred ? 'Unblur' : 'Blur'}
      </button>
    </div>
  );
};

export default BlurToggleButton;
