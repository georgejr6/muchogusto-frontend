import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ShieldCheck, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { verifyOTP, updateProfile } from '@/lib/supabaseClient';

const CreateAccountPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [phone, setPhone] = useState(location.state?.phone || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!phone) {
      navigate('/signup');
    }
  }, [phone, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const { data: profile, error: verifyError } = await verifyOTP(phone, otp);
      
      if (verifyError) throw new Error(verifyError);

      // Bring over temp data from signup step 1
      const tempDataStr = localStorage.getItem('signup_temp_data');
      if (tempDataStr && profile) {
        const tempData = JSON.parse(tempDataStr);
        await updateProfile(profile.id, {
          name: tempData.name,
          instagram: tempData.instagram
        });
        localStorage.removeItem('signup_temp_data');
      }

      toast({ title: 'Phone Verified!', description: 'Let\'s complete your profile.' });
      navigate('/profile-setup');

    } catch (err) {
      setError(err.message || 'Verification failed');
      toast({
        title: 'Error',
        description: err.message || 'Invalid OTP. Try 000000 for demo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Verify Phone | The Homies</title>
      </Helmet>

      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Button 
            variant="ghost" 
            className="mb-6 text-muted-foreground hover:text-foreground -ml-4"
            onClick={() => navigate('/signup')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Signup
          </Button>

          <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
            
            <h2 className="text-2xl font-bold text-foreground mb-2">Verify your number</h2>
            <p className="text-muted-foreground mb-6">
              We've sent a code to <span className="text-foreground font-mono">{phone}</span>
            </p>

            <form onSubmit={handleVerify} className="space-y-6">
              <div>
                <Input
                  type="text"
                  placeholder="000000"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className={`text-center text-2xl tracking-[0.5em] font-mono h-14 bg-input border-border text-foreground ${error ? 'border-destructive' : ''}`}
                />
                {error && <p className="text-destructive text-sm mt-2">{error}</p>}
                <p className="text-xs text-muted-foreground mt-2">Demo: Use 000000 to bypass</p>
              </div>

              <Button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-6 text-lg font-semibold gradient-purple-pink text-white rounded-xl shadow-lg"
              >
                {loading ? 'Verifying...' : 'Confirm'}
              </Button>
            </form>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default CreateAccountPage;