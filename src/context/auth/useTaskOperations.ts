
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { User } from './types';

export const useTaskOperations = (user: User | null, setUser: (user: User | null) => void) => {
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
    return user.completedTasks.includes(taskId);
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

  return { 
    completeTask, 
    hasCompletedTask, 
    canCompleteTask, 
    meetsWithdrawalRequirements 
  };
};
