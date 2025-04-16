
import { User as SupabaseUser } from '@/integrations/supabase/types';

export interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  completedTasks: string[];
  taskCompletionTimes: Record<string, string>;
  isAdmin: boolean;
}

export interface AuthContextType {
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
