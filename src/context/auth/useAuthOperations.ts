
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { User } from './types';

export const useAuthOperations = (user: User | null, setUser: (user: User | null) => void) => {
  const navigate = useNavigate();

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Login error:', error);
        toast.error(error.message);
        return false;
      }
      
      toast.success('Logged in successfully');
      navigate('/');
      return true;
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred during login');
      return false;
    }
  };

  const register = async (username: string, email: string, password: string, referralCode?: string): Promise<boolean> => {
    try {
      let referredByUserId: string | null = null;
      
      if (referralCode) {
        const { data: referrerData, error: referrerError } = await supabase
          .from('users')
          .select('id')
          .eq('referral_code', referralCode)
          .single();
          
        if (referrerError) {
          if (referrerError.code !== 'PGRST116') {
            console.error('Error checking referral code:', referrerError);
          }
        } else if (referrerData) {
          referredByUserId = referrerData.id;
        }
      }
      
      if (!referredByUserId) {
        const storedReferralCode = sessionStorage.getItem('referralCode');
        if (storedReferralCode) {
          const { data: referrerData, error: referrerError } = await supabase
            .from('users')
            .select('id')
            .eq('referral_code', storedReferralCode)
            .single();
            
          if (!referrerError && referrerData) {
            referredByUserId = referrerData.id;
          }
        }
      }
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) {
        console.error('Registration error:', authError);
        toast.error(authError.message);
        return false;
      }
      
      if (!authData.user) {
        toast.error('Failed to create user account');
        return false;
      }
      
      const referralCodeBase = username.toLowerCase().replace(/[^a-z0-9]/g, '');
      const uniqueReferralCode = `${referralCodeBase}${Math.floor(Math.random() * 10000)}`;
      
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          username,
          email,
          coins: 100,
          referral_code: uniqueReferralCode,
          referred_by: referredByUserId,
          referral_count: 0
        });
        
      if (profileError) {
        console.error('Profile creation error:', profileError);
        // No need to attempt to delete the user - this isn't a valid operation with the admin API in client code
        toast.error('Failed to create user profile');
        return false;
      }
      
      if (referredByUserId) {
        const { data: settingsData } = await supabase
          .from('settings')
          .select('referral_reward, inviter_reward')
          .eq('id', 'global')
          .single();
          
        const referralReward = settingsData?.referral_reward || 50;
        const inviterReward = settingsData?.inviter_reward || 25;
        
        await supabase
          .from('users')
          .update({ coins: 100 + referralReward })
          .eq('id', authData.user.id);
          
        await supabase.rpc('increment_referral_count', {
          user_id: referredByUserId,
          coin_reward: inviterReward
        });
        
        sessionStorage.removeItem('referralCode');
      }
      
      toast.success('Account created successfully');
      navigate('/');
      return true;
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An error occurred during registration');
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'An error occurred during logout');
    }
  };

  return { login, register, logout };
};
