import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { toast } from '@/components/ui/sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isLoading: boolean;
  addCoins: (amount: number) => Promise<boolean>;
  deductCoins: (amount: number) => Promise<boolean>;
  completeTask: (taskId: string) => Promise<boolean>;
  hasCompletedTask: (taskId: string) => boolean;
  canCompleteTask: (taskId: string, frequency?: string) => boolean;
  meetsWithdrawalRequirements: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const referralCode = params.get('ref');
    
    if (referralCode) {
      sessionStorage.setItem('referralCode', referralCode);
    }
  }, [location]);

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            console.error('Error fetching user data:', userError);
          } else if (userData) {
            const appUser: User = {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              coins: userData.coins,
              referralCode: userData.referral_code,
              referredBy: userData.referred_by || undefined,
              referralCount: userData.referral_count,
              completedTasks: [],
              taskCompletionTimes: {},
              isAdmin: userData.is_admin
            };
            
            setUser(appUser);
            
            const { data: completedTasksData, error: completedTasksError } = await supabase
              .from('completed_tasks')
              .select('task_id, completed_at')
              .eq('user_id', userData.id);
              
            if (!completedTasksError && completedTasksData) {
              appUser.completedTasks = completedTasksData.map(task => task.task_id);
              
              const taskCompletionTimes: Record<string, string> = {};
              completedTasksData.forEach(task => {
                taskCompletionTimes[task.task_id] = task.completed_at;
              });
              
              appUser.taskCompletionTimes = taskCompletionTimes;
              setUser({ ...appUser });
            }
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (userError) {
            console.error('Error fetching user data:', userError);
          } else if (userData) {
            const appUser: User = {
              id: userData.id,
              username: userData.username,
              email: userData.email,
              coins: userData.coins,
              referralCode: userData.referral_code,
              referredBy: userData.referred_by || undefined,
              referralCount: userData.referral_count,
              completedTasks: [],
              taskCompletionTimes: {},
              isAdmin: userData.is_admin
            };
            
            setUser(appUser);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        await supabase.auth.admin.deleteUser(authData.user.id);
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

  const addCoins = async (amount: number): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to earn coins');
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ coins: user.coins + amount })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error adding coins:', error);
        toast.error('Failed to add coins');
        return false;
      }
      
      setUser({ ...user, coins: user.coins + amount });
      return true;
    } catch (error) {
      console.error('Error in addCoins:', error);
      toast.error('Failed to add coins');
      return false;
    }
  };

  const deductCoins = async (amount: number): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to spend coins');
      return false;
    }
    
    if (user.coins < amount) {
      toast.error(`You don't have enough coins. You need ${amount} coins.`);
      return false;
    }
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ coins: user.coins - amount })
        .eq('id', user.id);
        
      if (error) {
        console.error('Error deducting coins:', error);
        toast.error('Failed to deduct coins');
        return false;
      }
      
      setUser({ ...user, coins: user.coins - amount });
      return true;
    } catch (error) {
      console.error('Error in deductCoins:', error);
      toast.error('Failed to deduct coins');
      return false;
    }
  };

  const completeTask = async (taskId: string): Promise<boolean> => {
    if (!user) {
      toast.error('You must be logged in to complete tasks');
      return false;
    }
    
    if (user.completedTasks.includes(taskId)) {
      const { data: taskData } = await supabase
        .from('tasks')
        .select('frequency')
        .eq('id', taskId)
        .single();
        
      if (taskData?.frequency !== 'daily') {
        toast.error('You have already completed this task');
        return false;
      }
      
      const lastCompletionTime = user.taskCompletionTimes[taskId];
      if (lastCompletionTime) {
        const lastCompletion = new Date(lastCompletionTime);
        const today = new Date();
        
        if (lastCompletion.toDateString() === today.toDateString()) {
          toast.error('You have already completed this daily task today');
          return false;
        }
      }
    }
    
    try {
      const { data: taskData, error: taskError } = await supabase
        .from('tasks')
        .select('coin_reward')
        .eq('id', taskId)
        .single();
        
      const coinReward = taskData.coin_reward;
      
      const now = new Date().toISOString();
      const { error: completionError } = await supabase
        .from('completed_tasks')
        .upsert({
          user_id: user.id,
          task_id: taskId,
          completed_at: now
        });
        
      if (completionError) {
        console.error('Error recording task completion:', completionError);
        toast.error('Failed to record task completion');
        return false;
      }
      
      const { error: coinError } = await supabase
        .from('users')
        .update({ coins: user.coins + coinReward })
        .eq('id', user.id);
        
      if (coinError) {
        console.error('Error adding coins for task completion:', coinError);
        toast.error('Failed to add coins for task completion');
        return false;
      }
      
      const updatedCompletedTasks = [...user.completedTasks];
      if (!updatedCompletedTasks.includes(taskId)) {
        updatedCompletedTasks.push(taskId);
      }
      
      const updatedTaskCompletionTimes = { ...user.taskCompletionTimes, [taskId]: now };
      
      setUser({
        ...user,
        coins: user.coins + coinReward,
        completedTasks: updatedCompletedTasks,
        taskCompletionTimes: updatedTaskCompletionTimes
      });
      
      toast.success(`Task completed! +${coinReward} coins`);
      return true;
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to complete task');
      return false;
    }
  };

  const hasCompletedTask = (taskId: string): boolean => {
    if (!user) return false;
    
    if (user.completedTasks.includes(taskId)) {
      return true;
    }
    
    return false;
  };

  const canCompleteTask = (taskId: string, frequency?: string): boolean => {
    if (!user) return false;
    
    if (frequency !== 'daily' && user.completedTasks.includes(taskId)) {
      return false;
    }
    
    if (frequency === 'daily' && user.completedTasks.includes(taskId)) {
      const lastCompletionTime = user.taskCompletionTimes[taskId];
      if (lastCompletionTime) {
        const lastCompletion = new Date(lastCompletionTime);
        const today = new Date();
        
        if (lastCompletion.toDateString() === today.toDateString()) {
          return false;
        }
      }
    }
    
    return true;
  };

  const meetsWithdrawalRequirements = (): boolean => {
    if (!user) return false;
    
    return user.referralCount >= 5;
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
      addCoins,
      deductCoins,
      completeTask,
      hasCompletedTask,
      canCompleteTask,
      meetsWithdrawalRequirements,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
