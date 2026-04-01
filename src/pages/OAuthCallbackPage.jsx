import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function OAuthCallbackPage() {
  const [params] = useSearchParams();
  const { loginWithToken } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      toast({ title: 'Sign in failed', description: 'Please try again.', variant: 'destructive' });
      navigate('/login');
      return;
    }

    loginWithToken(token).then(() => navigate('/dashboard'));
  }, []);

  return (
    <div className="min-h-screen bg-[#0f001a] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[rgba(255,253,208,0.5)] text-sm tracking-widest uppercase">Signing you in...</p>
      </div>
    </div>
  );
}
