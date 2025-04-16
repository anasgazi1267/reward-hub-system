
import { User } from './types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

export const fetchUserData = async (userId: string): Promise<User | null> => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (userError) {
      console.error('Error fetching user data:', userError);
      return null;
    }
    
    if (!userData) return null;
    
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
    
    // Fetch completed tasks
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
    }
    
    return appUser;
  } catch (error) {
    console.error('Error in fetchUserData:', error);
    return null;
  }
};

export const handleReferralCode = (location: Location): string | null => {
  const params = new URLSearchParams(location.search);
  const referralCode = params.get('ref');
  
  if (referralCode) {
    sessionStorage.setItem('referralCode', referralCode);
    return referralCode;
  }
  
  return sessionStorage.getItem('referralCode');
};
