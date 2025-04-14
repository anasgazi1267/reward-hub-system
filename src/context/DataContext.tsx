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

type DataContextType = {
  tasks: Task[];
  rewards: Reward[];
  withdrawalRequests: WithdrawalRequest[];
  settings: SystemSettings;
  popupAds: PopupAd[];
  bannerAds: BannerAd[];
  requestWithdrawal: (request: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt' | 'username'>) => boolean;
  approveWithdrawal: (requestId: string) => void;
  rejectWithdrawal: (requestId: string) => void;
  updateWithdrawalStatus: (requestId: string, status: 'pending' | 'approved' | 'rejected') => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, task: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (rewardId: string, reward: Partial<Reward>) => void;
  deleteReward: (rewardId: string) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  addPopupAd: (ad: Omit<PopupAd, 'id'>) => void;
  updatePopupAd: (adId: string, ad: Partial<PopupAd>) => void;
  deletePopupAd: (adId: string) => void;
  addBannerAd: (ad: Omit<BannerAd, 'id'>) => void;
  updateBannerAd: (adId: string, ad: Partial<BannerAd>) => void;
  deleteBannerAd: (adId: string) => void;
};

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Join Our Telegram Channel',
    description: 'Join our Telegram channel and stay updated with the latest news.',
    type: 'Telegram',
    coinReward: 100,
    targetUrl: 'https://t.me/examplechannel',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '2',
    title: 'Subscribe to YouTube Channel',
    description: 'Subscribe to our YouTube channel for helpful tutorials.',
    type: 'YouTube',
    coinReward: 150,
    targetUrl: 'https://youtube.com/c/examplechannel',
    imageUrl: '/placeholder.svg'
  },
  {
    id: '3',
    title: 'Daily Reward',
    description: 'Claim your daily reward - come back every day for more coins!',
    type: 'Daily',
    frequency: 'daily',
    coinReward: 50,
    targetUrl: '#',
    imageUrl: '/placeholder.svg'
  }
];

const initialRewards: Reward[] = [
  {
    id: '1',
    name: 'Amazon Gift Card $10',
    description: 'Get a $10 Amazon gift card',
    category: 'Amazon',
    coinCost: 1000,
    imageUrl: '/placeholder.svg',
    available: true
  },
  {
    id: '2',
    name: 'Google Play Gift Card $5',
    description: 'Get a $5 Google Play gift card',
    category: 'Google',
    coinCost: 500,
    imageUrl: '/placeholder.svg',
    available: true
  },
  {
    id: '3',
    name: '100 Free Fire Diamonds',
    description: 'Get 100 Free Fire diamonds',
    category: 'FreeFire',
    coinCost: 300,
    imageUrl: '/placeholder.svg',
    available: true
  },
  {
    id: '4',
    name: '50 PUBG UC',
    description: 'Get 50 PUBG UC',
    category: 'PUBG',
    coinCost: 250,
    imageUrl: '/placeholder.svg',
    available: true
  }
];

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

const initialWithdrawalRequests: WithdrawalRequest[] = [];

const initialSettings: SystemSettings = {
  minWithdrawalCoins: 500,
  referralReward: 50,
  minReferralsForWithdrawal: 5
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const { user, meetsWithdrawalRequirements } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);
  const [popupAds, setPopupAds] = useState<PopupAd[]>(initialPopupAds);
  const [bannerAds, setBannerAds] = useState<BannerAd[]>(initialBannerAds);

  useEffect(() => {
    const storedTasks = localStorage.getItem('rewardHubTasks');
    if (storedTasks) {
      setTasks(JSON.parse(storedTasks));
    } else {
      localStorage.setItem('rewardHubTasks', JSON.stringify(tasks));
    }
    
    const storedRewards = localStorage.getItem('rewardHubRewards');
    if (storedRewards) {
      setRewards(JSON.parse(storedRewards));
    } else {
      localStorage.setItem('rewardHubRewards', JSON.stringify(rewards));
    }
    
    const storedWithdrawalRequests = localStorage.getItem('rewardHubWithdrawalRequests');
    if (storedWithdrawalRequests) {
      setWithdrawalRequests(JSON.parse(storedWithdrawalRequests));
    }
    
    const storedSettings = localStorage.getItem('rewardHubSettings');
    if (storedSettings) {
      setSettings(JSON.parse(storedSettings));
    } else {
      localStorage.setItem('rewardHubSettings', JSON.stringify(settings));
    }
    
    const storedPopupAds = localStorage.getItem('rewardHubPopupAds');
    if (storedPopupAds) {
      setPopupAds(JSON.parse(storedPopupAds));
    } else {
      localStorage.setItem('rewardHubPopupAds', JSON.stringify(popupAds));
    }
    
    const storedBannerAds = localStorage.getItem('rewardHubBannerAds');
    if (storedBannerAds) {
      setBannerAds(JSON.parse(storedBannerAds));
    } else {
      localStorage.setItem('rewardHubBannerAds', JSON.stringify(bannerAds));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rewardHubTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubRewards', JSON.stringify(rewards));
  }, [rewards]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubWithdrawalRequests', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubSettings', JSON.stringify(settings));
  }, [settings]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubPopupAds', JSON.stringify(popupAds));
  }, [popupAds]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubBannerAds', JSON.stringify(bannerAds));
  }, [bannerAds]);

  const requestWithdrawal = (request: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt' | 'username'>): boolean => {
    if (!user) {
      toast.error(`You must be logged in to request a withdrawal`);
      return false;
    }
    
    if (!meetsWithdrawalRequirements()) {
      toast.error(`You need at least 5 referrals to make a withdrawal`);
      return false;
    }
    
    const newRequest: WithdrawalRequest = {
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString(),
      username: user.username,
      ...request
    };
    
    setWithdrawalRequests([...withdrawalRequests, newRequest]);
    toast.success(`Withdrawal request submitted successfully`);
    return true;
  };

  const approveWithdrawal = (requestId: string) => {
    updateWithdrawalStatus(requestId, 'approved');
  };
  
  const rejectWithdrawal = (requestId: string) => {
    updateWithdrawalStatus(requestId, 'rejected');
  };
  
  const updateWithdrawalStatus = (requestId: string, status: 'pending' | 'approved' | 'rejected') => {
    const updatedRequests = withdrawalRequests.map(req => 
      req.id === requestId ? { ...req, status } : req
    );
    setWithdrawalRequests(updatedRequests);
    toast.success(`Withdrawal request ${status}`);
  };
  
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      ...task
    };
    setTasks([...tasks, newTask]);
    toast.success(`Task added successfully`);
  };
  
  const updateTask = (taskId: string, task: Partial<Task>) => {
    const updatedTasks = tasks.map(t => 
      t.id === taskId ? { ...t, ...task } : t
    );
    setTasks(updatedTasks);
    toast.success(`Task updated successfully`);
  };
  
  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    setTasks(updatedTasks);
    toast.success(`Task deleted successfully`);
  };
  
  const addReward = (reward: Omit<Reward, 'id'>) => {
    const newReward: Reward = {
      id: Date.now().toString(),
      ...reward
    };
    setRewards([...rewards, newReward]);
    toast.success(`Reward added successfully`);
  };
  
  const updateReward = (rewardId: string, reward: Partial<Reward>) => {
    const updatedRewards = rewards.map(r => 
      r.id === rewardId ? { ...r, ...reward } : r
    );
    setRewards(updatedRewards);
    toast.success(`Reward updated successfully`);
  };
  
  const deleteReward = (rewardId: string) => {
    const updatedRewards = rewards.filter(r => r.id !== rewardId);
    setRewards(updatedRewards);
    toast.success(`Reward deleted successfully`);
  };
  
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings({ ...settings, ...newSettings });
    toast.success(`Settings updated successfully`);
  };
  
  const addPopupAd = (ad: Omit<PopupAd, 'id'>) => {
    const newAd: PopupAd = {
      id: Date.now().toString(),
      ...ad
    };
    setPopupAds([...popupAds, newAd]);
    toast.success(`Popup ad added successfully`);
  };
  
  const updatePopupAd = (adId: string, ad: Partial<PopupAd>) => {
    const updatedAds = popupAds.map(a => 
      a.id === adId ? { ...a, ...ad } : a
    );
    setPopupAds(updatedAds);
    toast.success(`Popup ad updated successfully`);
  };
  
  const deletePopupAd = (adId: string) => {
    const updatedAds = popupAds.filter(a => a.id !== adId);
    setPopupAds(updatedAds);
    toast.success(`Popup ad deleted successfully`);
  };
  
  const addBannerAd = (ad: Omit<BannerAd, 'id'>) => {
    const newAd: BannerAd = {
      id: Date.now().toString(),
      ...ad
    };
    setBannerAds([...bannerAds, newAd]);
    toast.success(`Banner ad added successfully`);
  };
  
  const updateBannerAd = (adId: string, ad: Partial<BannerAd>) => {
    const updatedAds = bannerAds.map(a => 
      a.id === adId ? { ...a, ...ad } : a
    );
    setBannerAds(updatedAds);
    toast.success(`Banner ad updated successfully`);
  };
  
  const deleteBannerAd = (adId: string) => {
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
    deleteBannerAd
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
