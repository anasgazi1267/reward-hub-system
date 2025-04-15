import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Task, 
  Reward, 
  WithdrawalRequest,
  SystemSettings,
  PopupAd,
  BannerAd
} from '@/lib/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

type DataContextType = {
  tasks: Task[];
  rewards: Reward[];
  withdrawalRequests: WithdrawalRequest[];
  settings: SystemSettings;
  popupAds: PopupAd[];
  bannerAds: BannerAd[];
  requestWithdrawal: (request: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt' | 'username'>) => Promise<boolean>;
  approveWithdrawal: (requestId: string) => Promise<void>;
  rejectWithdrawal: (requestId: string) => Promise<void>;
  updateWithdrawalStatus: (requestId: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>;
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (taskId: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addReward: (reward: Omit<Reward, 'id'>) => Promise<void>;
  updateReward: (rewardId: string, reward: Partial<Reward>) => Promise<void>;
  deleteReward: (rewardId: string) => Promise<void>;
  updateSettings: (newSettings: Partial<SystemSettings>) => Promise<void>;
  addPopupAd: (ad: Omit<PopupAd, 'id'>) => Promise<void>;
  updatePopupAd: (adId: string, ad: Partial<PopupAd>) => Promise<void>;
  deletePopupAd: (adId: string) => Promise<void>;
  addBannerAd: (ad: Omit<BannerAd, 'id'>) => Promise<void>;
  updateBannerAd: (adId: string, ad: Partial<BannerAd>) => Promise<void>;
  deleteBannerAd: (adId: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string | null>;
  getTotalReferrals: () => number;
};

const initialPopupAds: PopupAd[] = [
  {
    id: '1',
    htmlContent: `<div style="background-color:#f0f0f0; padding:20px; text-align:center;">
      <h2>Special Offer!</h2>
      <p>Check out our amazing products at a discount!</p>
      <a href="#" target="_blank" style="background-color:#4CAF50; color:white; padding:10px 20px; text-decoration:none; display:inline-block; margin-top:10px;">Learn More</a>
    </div>`,
    durationSeconds: 15,
    coinReward: 5
  },
  {
    id: '2',
    htmlContent: `<div style="background-color:#e0f0ff; padding:20px; text-align:center;">
      <h2>New App Launch!</h2>
      <p>Download our app for exclusive rewards!</p>
      <a href="#" target="_blank" style="background-color:#2196F3; color:white; padding:10px 20px; text-decoration:none; display:inline-block; margin-top:10px;">Download Now</a>
    </div>`,
    durationSeconds: 25,
    coinReward: 15
  },
  {
    id: '3',
    htmlContent: `<div style="background-color:#fff0e0; padding:20px; text-align:center;">
      <h2>Join Our Community!</h2>
      <p>Become part of our growing community and claim your free bonus!</p>
      <a href="#" target="_blank" style="background-color:#FF9800; color:white; padding:10px 20px; text-decoration:none; display:inline-block; margin-top:10px;">Join Now</a>
    </div>`,
    durationSeconds: 35,
    coinReward: 25
  },
  {
    id: '4',
    htmlContent: `<div style="background-color:#e0ffe0; padding:20px; text-align:center;">
      <h2>Limited Time Offer!</h2>
      <p>50% discount on premium subscriptions for the next 24 hours!</p>
      <a href="#" target="_blank" style="background-color:#4CAF50; color:white; padding:10px 20px; text-decoration:none; display:inline-block; margin-top:10px;">Get Discount</a>
    </div>`,
    durationSeconds: 50,
    coinReward: 40
  }
];

const initialBannerAds: BannerAd[] = [
  {
    id: '1',
    name: 'Main Banner',
    htmlContent: `<div style="width:468px; height:60px; background-color:#f0f0f0; display:flex; align-items:center; justify-content:center; border:1px solid #ddd;">
      <span style="font-weight:bold;">468x60 Banner Ad</span>
    </div>`
  }
];

const initialSettings: SystemSettings = {
  minWithdrawalCoins: 500,
  referralReward: 50,
  inviterReward: 25,
  minReferralsForWithdrawal: 5
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, meetsWithdrawalRequirements } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [popupAds, setPopupAds] = useState<PopupAd[]>(initialPopupAds);
  const [bannerAds, setBannerAds] = useState<BannerAd[]>(initialBannerAds);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { data: tasksData, error: tasksError } = await supabase
          .from('tasks')
          .select('*');
        
        if (tasksError) {
          console.error('Error fetching tasks:', tasksError);
        } else if (tasksData) {
          const formattedTasks = tasksData.map(task => ({
            id: task.id,
            title: task.title,
            description: task.description,
            type: task.type as any,
            coinReward: task.coin_reward,
            targetUrl: task.target_url,
            imageUrl: task.image_url,
            requirements: task.requirements,
            frequency: task.frequency as any
          }));
          setTasks(formattedTasks);
        }
        
        const { data: rewardsData, error: rewardsError } = await supabase
          .from('rewards')
          .select('*');
        
        if (rewardsError) {
          console.error('Error fetching rewards:', rewardsError);
        } else if (rewardsData) {
          const formattedRewards = rewardsData.map(reward => ({
            id: reward.id,
            name: reward.name,
            description: reward.description,
            category: reward.category as any,
            coinCost: reward.coin_cost,
            imageUrl: reward.image_url,
            available: reward.available
          }));
          setRewards(formattedRewards);
        }
        
        const { data: settingsData, error: settingsError } = await supabase
          .from('settings')
          .select('*')
          .eq('id', 'global')
          .single();
        
        if (settingsError) {
          console.error('Error fetching settings:', settingsError);
        } else if (settingsData) {
          setSettings({
            minWithdrawalCoins: settingsData.min_withdrawal_coins,
            referralReward: settingsData.referral_reward,
            inviterReward: settingsData.inviter_reward,
            minReferralsForWithdrawal: settingsData.min_referrals_for_withdrawal
          });
        }
        
        if (user) {
          const { data: withdrawalData, error: withdrawalError } = await supabase
            .from('withdrawal_requests')
            .select('*, users(username)')
            .order('created_at', { ascending: false });
          
          if (withdrawalError) {
            console.error('Error fetching withdrawal requests:', withdrawalError);
          } else if (withdrawalData) {
            const formattedWithdrawals = withdrawalData.map(withdrawal => ({
              id: withdrawal.id,
              userId: withdrawal.user_id,
              username: withdrawal.users?.username || 'Unknown',
              rewardId: withdrawal.reward_id,
              rewardName: withdrawal.reward_name || 'Unknown Reward',
              coinAmount: withdrawal.coin_amount,
              status: withdrawal.status as any,
              createdAt: withdrawal.created_at,
              playerUsername: withdrawal.player_username,
              playerID: withdrawal.player_id,
              email: withdrawal.email,
              phoneNumber: withdrawal.phone_number,
              category: withdrawal.category as any
            }));
            setWithdrawalRequests(formattedWithdrawals);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    
    const tasksSubscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchData)
      .subscribe();
      
    const rewardsSubscription = supabase
      .channel('public:rewards')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rewards' }, fetchData)
      .subscribe();
      
    const settingsSubscription = supabase
      .channel('public:settings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, fetchData)
      .subscribe();
      
    const withdrawalSubscription = supabase
      .channel('public:withdrawal_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'withdrawal_requests' }, fetchData)
      .subscribe();
    
    return () => {
      supabase.removeChannel(tasksSubscription);
      supabase.removeChannel(rewardsSubscription);
      supabase.removeChannel(settingsSubscription);
      supabase.removeChannel(withdrawalSubscription);
    };
  }, [user]);

  const getTotalReferrals = () => {
    if (!user) return 0;
    return user.referralCount || 0;
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);
        
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        toast.error('Failed to upload image');
        return null;
      }
      
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Error in uploadImage:', error);
      toast.error('Failed to upload image');
      return null;
    }
  };

  const requestWithdrawal = async (request: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt' | 'username'>): Promise<boolean> => {
    if (!user) {
      toast.error(`You must be logged in to request a withdrawal`);
      return false;
    }
    
    if (!meetsWithdrawalRequirements()) {
      toast.error(`You need at least ${settings.minReferralsForWithdrawal} referrals to make a withdrawal`);
      return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          reward_id: request.rewardId,
          reward_name: request.rewardName,
          coin_amount: request.coinAmount,
          player_username: request.playerUsername,
          player_id: request.playerID,
          email: request.email,
          phone_number: request.phoneNumber,
          category: request.category
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating withdrawal request:', error);
        toast.error('Failed to submit withdrawal request');
        return false;
      }
      
      const newRequest: WithdrawalRequest = {
        id: data.id,
        userId: data.user_id,
        username: user.username,
        rewardId: data.reward_id,
        rewardName: request.rewardName,
        coinAmount: data.coin_amount,
        status: data.status,
        createdAt: data.created_at,
        playerUsername: data.player_username,
        playerID: data.player_id,
        email: data.email,
        phoneNumber: data.phone_number,
        category: data.category
      };
      
      setWithdrawalRequests(prev => [newRequest, ...prev]);
      toast.success(`Withdrawal request submitted successfully`);
      return true;
    } catch (error) {
      console.error('Error in requestWithdrawal:', error);
      toast.error('Failed to submit withdrawal request');
      return false;
    }
  };

  const updateWithdrawalStatus = async (requestId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
    try {
      const { error } = await supabase
        .from('withdrawal_requests')
        .update({ status })
        .eq('id', requestId);
        
      if (error) {
        console.error('Error updating withdrawal status:', error);
        toast.error('Failed to update withdrawal status');
        return;
      }
      
      const updatedRequests = withdrawalRequests.map(req => 
        req.id === requestId ? { ...req, status } : req
      );
      setWithdrawalRequests(updatedRequests);
      toast.success(`Withdrawal request ${status}`);
    } catch (error) {
      console.error('Error in updateWithdrawalStatus:', error);
      toast.error('Failed to update withdrawal status');
    }
  };
  
  const approveWithdrawal = async (requestId: string): Promise<void> => {
    await updateWithdrawalStatus(requestId, 'approved');
  };
  
  const rejectWithdrawal = async (requestId: string): Promise<void> => {
    await updateWithdrawalStatus(requestId, 'rejected');
  };
  
  const addTask = async (task: Omit<Task, 'id'>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: task.title,
          description: task.description,
          type: task.type,
          coin_reward: task.coinReward,
          target_url: task.targetUrl,
          image_url: task.imageUrl,
          requirements: task.requirements,
          frequency: task.frequency
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating task:', error);
        toast.error('Failed to add task');
        return;
      }
      
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description,
        type: data.type,
        coinReward: data.coin_reward,
        targetUrl: data.target_url,
        imageUrl: data.image_url,
        requirements: data.requirements,
        frequency: data.frequency
      };
      
      setTasks(prev => [...prev, newTask]);
      toast.success(`Task added successfully`);
    } catch (error) {
      console.error('Error in addTask:', error);
      toast.error('Failed to add task');
    }
  };
  
  const updateTask = async (taskId: string, task: Partial<Task>): Promise<void> => {
    try {
      const updates: any = {};
      if (task.title) updates.title = task.title;
      if (task.description) updates.description = task.description;
      if (task.type) updates.type = task.type;
      if (task.coinReward !== undefined) updates.coin_reward = task.coinReward;
      if (task.targetUrl) updates.target_url = task.targetUrl;
      if (task.imageUrl !== undefined) updates.image_url = task.imageUrl;
      if (task.requirements !== undefined) updates.requirements = task.requirements;
      if (task.frequency !== undefined) updates.frequency = task.frequency;
      
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);
        
      if (error) {
        console.error('Error updating task:', error);
        toast.error('Failed to update task');
        return;
      }
      
      const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, ...task } : t
      );
      setTasks(updatedTasks);
      toast.success(`Task updated successfully`);
    } catch (error) {
      console.error('Error in updateTask:', error);
      toast.error('Failed to update task');
    }
  };
  
  const deleteTask = async (taskId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
        return;
      }
      
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      setTasks(updatedTasks);
      toast.success(`Task deleted successfully`);
    } catch (error) {
      console.error('Error in deleteTask:', error);
      toast.error('Failed to delete task');
    }
  };
  
  const addReward = async (reward: Omit<Reward, 'id'>): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('rewards')
        .insert({
          name: reward.name,
          description: reward.description,
          category: reward.category,
          coin_cost: reward.coinCost,
          image_url: reward.imageUrl,
          available: reward.available
        })
        .select()
        .single();
        
      if (error) {
        console.error('Error creating reward:', error);
        toast.error('Failed to add reward');
        return;
      }
      
      const newReward: Reward = {
        id: data.id,
        name: data.name,
        description: data.description,
        category: data.category,
        coinCost: data.coin_cost,
        imageUrl: data.image_url,
        available: data.available
      };
      
      setRewards(prev => [...prev, newReward]);
      toast.success(`Reward added successfully`);
    } catch (error) {
      console.error('Error in addReward:', error);
      toast.error('Failed to add reward');
    }
  };
  
  const updateReward = async (rewardId: string, reward: Partial<Reward>): Promise<void> => {
    try {
      const updates: any = {};
      if (reward.name) updates.name = reward.name;
      if (reward.description) updates.description = reward.description;
      if (reward.category) updates.category = reward.category;
      if (reward.coinCost !== undefined) updates.coin_cost = reward.coinCost;
      if (reward.imageUrl !== undefined) updates.image_url = reward.imageUrl;
      if (reward.available !== undefined) updates.available = reward.available;
      
      const { error } = await supabase
        .from('rewards')
        .update(updates)
        .eq('id', rewardId);
        
      if (error) {
        console.error('Error updating reward:', error);
        toast.error('Failed to update reward');
        return;
      }
      
      const updatedRewards = rewards.map(r => 
        r.id === rewardId ? { ...r, ...reward } : r
      );
      setRewards(updatedRewards);
      toast.success(`Reward updated successfully`);
    } catch (error) {
      console.error('Error in updateReward:', error);
      toast.error('Failed to update reward');
    }
  };
  
  const deleteReward = async (rewardId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('rewards')
        .delete()
        .eq('id', rewardId);
        
      if (error) {
        console.error('Error deleting reward:', error);
        toast.error('Failed to delete reward');
        return;
      }
      
      const updatedRewards = rewards.filter(r => r.id !== rewardId);
      setRewards(updatedRewards);
      toast.success(`Reward deleted successfully`);
    } catch (error) {
      console.error('Error in deleteReward:', error);
      toast.error('Failed to delete reward');
    }
  };
  
  const updateSettings = async (newSettings: Partial<SystemSettings>): Promise<void> => {
    try {
      const updates: any = {};
      if (newSettings.minWithdrawalCoins !== undefined) updates.min_withdrawal_coins = newSettings.minWithdrawalCoins;
      if (newSettings.referralReward !== undefined) updates.referral_reward = newSettings.referralReward;
      if (newSettings.inviterReward !== undefined) updates.inviter_reward = newSettings.inviterReward;
      if (newSettings.minReferralsForWithdrawal !== undefined) updates.min_referrals_for_withdrawal = newSettings.minReferralsForWithdrawal;
      
      const { error } = await supabase
        .from('settings')
        .update(updates)
        .eq('id', 'global');
        
      if (error) {
        console.error('Error updating settings:', error);
        toast.error('Failed to update settings');
        return;
      }
      
      setSettings({ ...settings, ...newSettings });
      toast.success(`Settings updated successfully`);
    } catch (error) {
      console.error('Error in updateSettings:', error);
      toast.error('Failed to update settings');
    }
  };
  
  const addPopupAd = async (ad: Omit<PopupAd, 'id'>): Promise<void> => {
    const newAd: PopupAd = {
      id: Date.now().toString(),
      ...ad
    };
    setPopupAds([...popupAds, newAd]);
    toast.success(`Popup ad added successfully`);
  };
  
  const updatePopupAd = async (adId: string, ad: Partial<PopupAd>): Promise<void> => {
    const updatedAds = popupAds.map(a => 
      a.id === adId ? { ...a, ...ad } : a
    );
    setPopupAds(updatedAds);
    toast.success(`Popup ad updated successfully`);
  };
  
  const deletePopupAd = async (adId: string): Promise<void> => {
    const updatedAds = popupAds.filter(a => a.id !== adId);
    setPopupAds(updatedAds);
    toast.success(`Popup ad deleted successfully`);
  };
  
  const addBannerAd = async (ad: Omit<BannerAd, 'id'>): Promise<void> => {
    const newAd: BannerAd = {
      id: Date.now().toString(),
      ...ad
    };
    setBannerAds([...bannerAds, newAd]);
    toast.success(`Banner ad added successfully`);
  };
  
  const updateBannerAd = async (adId: string, ad: Partial<BannerAd>): Promise<void> => {
    const updatedAds = bannerAds.map(a => 
      a.id === adId ? { ...a, ...ad } : a
    );
    setBannerAds(updatedAds);
    toast.success(`Banner ad updated successfully`);
  };
  
  const deleteBannerAd = async (adId: string): Promise<void> => {
    const updatedAds = bannerAds.filter(a => a.id !== adId);
    setBannerAds(updatedAds);
    toast.success(`Banner ad deleted successfully`);
  };

  const value = {
    tasks,
    rewards,
    withdrawalRequests,
    settings,
    popupAds,
    bannerAds,
    requestWithdrawal,
    approveWithdrawal,
    rejectWithdrawal,
    updateWithdrawalStatus,
    addTask,
    updateTask,
    deleteTask,
    addReward,
    updateReward,
    deleteReward,
    updateSettings,
    addPopupAd,
    updatePopupAd,
    deletePopupAd,
    addBannerAd,
    updateBannerAd,
    deleteBannerAd,
    uploadImage,
    getTotalReferrals
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
