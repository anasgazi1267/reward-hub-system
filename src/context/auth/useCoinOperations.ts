
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { User } from './types';

export const useCoinOperations = (user: User | null, setUser: (user: User | null) => void) => {
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

  return { addCoins, deductCoins };
};
