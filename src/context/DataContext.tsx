
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Task, 
  Reward, 
  PopupAd, 
  BannerAd, 
  WithdrawalRequest,
  SystemSettings
} from '@/lib/types';
import { useAuth } from './AuthContext';
import { toast } from '@/components/ui/sonner';

type DataContextType = {
  tasks: Task[];
  rewards: Reward[];
  popupAds: PopupAd[];
  bannerAds: BannerAd[];
  withdrawalRequests: WithdrawalRequest[];
  settings: SystemSettings;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  addReward: (reward: Omit<Reward, 'id'>) => void;
  updateReward: (id: string, reward: Partial<Reward>) => void;
  deleteReward: (id: string) => void;
  addPopupAd: (ad: Omit<PopupAd, 'id'>) => void;
  updatePopupAd: (id: string, ad: Partial<PopupAd>) => void;
  deletePopupAd: (id: string) => void;
  addBannerAd: (ad: Omit<BannerAd, 'id'>) => void;
  updateBannerAd: (id: string, ad: Partial<BannerAd>) => void;
  deleteBannerAd: (id: string) => void;
  requestWithdrawal: (request: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt'>) => void;
  updateWithdrawalStatus: (id: string, status: 'approved' | 'rejected') => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
};

// Mock initial data
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
  const { user } = useAuth();
  
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [popupAds, setPopupAds] = useState<PopupAd[]>(initialPopupAds);
  const [bannerAds, setBannerAds] = useState<BannerAd[]>(initialBannerAds);
  const [withdrawalRequests, setWithdrawalRequests] = useState<WithdrawalRequest[]>(initialWithdrawalRequests);
  const [settings, setSettings] = useState<SystemSettings>(initialSettings);

  // Load data from localStorage on initial render
  useEffect(() => {
    const storedTasks = localStorage.getItem('rewardHubTasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
    
    const storedRewards = localStorage.getItem('rewardHubRewards');
    if (storedRewards) setRewards(JSON.parse(storedRewards));
    
    const storedPopupAds = localStorage.getItem('rewardHubPopupAds');
    if (storedPopupAds) setPopupAds(JSON.parse(storedPopupAds));
    
    const storedBannerAds = localStorage.getItem('rewardHubBannerAds');
    if (storedBannerAds) setBannerAds(JSON.parse(storedBannerAds));
    
    const storedWithdrawalRequests = localStorage.getItem('rewardHubWithdrawalRequests');
    if (storedWithdrawalRequests) setWithdrawalRequests(JSON.parse(storedWithdrawalRequests));
    
    const storedSettings = localStorage.getItem('rewardHubSettings');
    if (storedSettings) setSettings(JSON.parse(storedSettings));
  }, []);

  // Update localStorage when data changes
  useEffect(() => {
    localStorage.setItem('rewardHubTasks', JSON.stringify(tasks));
  }, [tasks]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubRewards', JSON.stringify(rewards));
  }, [rewards]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubPopupAds', JSON.stringify(popupAds));
  }, [popupAds]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubBannerAds', JSON.stringify(bannerAds));
  }, [bannerAds]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubWithdrawalRequests', JSON.stringify(withdrawalRequests));
  }, [withdrawalRequests]);
  
  useEffect(() => {
    localStorage.setItem('rewardHubSettings', JSON.stringify(settings));
  }, [settings]);

  // Task functions
  const addTask = (task: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...task,
      id: Date.now().toString()
    };
    setTasks([...tasks, newTask]);
    toast.success('Task added successfully');
  };

  const updateTask = (id: string, task: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...task } : t));
    toast.success('Task updated successfully');
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast.success('Task deleted successfully');
  };

  // Reward functions
  const addReward = (reward: Omit<Reward, 'id'>) => {
    const newReward: Reward = {
      ...reward,
      id: Date.now().toString()
    };
    setRewards([...rewards, newReward]);
    toast.success('Reward added successfully');
  };

  const updateReward = (id: string, reward: Partial<Reward>) => {
    setRewards(rewards.map(r => r.id === id ? { ...r, ...reward } : r));
    toast.success('Reward updated successfully');
  };

  const deleteReward = (id: string) => {
    setRewards(rewards.filter(r => r.id !== id));
    toast.success('Reward deleted successfully');
  };

  // Popup ad functions
  const addPopupAd = (ad: Omit<PopupAd, 'id'>) => {
    const newAd: PopupAd = {
      ...ad,
      id: Date.now().toString()
    };
    setPopupAds([...popupAds, newAd]);
    toast.success('Popup ad added successfully');
  };

  const updatePopupAd = (id: string, ad: Partial<PopupAd>) => {
    setPopupAds(popupAds.map(a => a.id === id ? { ...a, ...ad } : a));
    toast.success('Popup ad updated successfully');
  };

  const deletePopupAd = (id: string) => {
    setPopupAds(popupAds.filter(a => a.id !== id));
    toast.success('Popup ad deleted successfully');
  };

  // Banner ad functions
  const addBannerAd = (ad: Omit<BannerAd, 'id'>) => {
    const newAd: BannerAd = {
      ...ad,
      id: Date.now().toString()
    };
    setBannerAds([...bannerAds, newAd]);
    toast.success('Banner ad added successfully');
  };

  const updateBannerAd = (id: string, ad: Partial<BannerAd>) => {
    setBannerAds(bannerAds.map(a => a.id === id ? { ...a, ...ad } : a));
    toast.success('Banner ad updated successfully');
  };

  const deleteBannerAd = (id: string) => {
    setBannerAds(bannerAds.filter(a => a.id !== id));
    toast.success('Banner ad deleted successfully');
  };

  // Withdrawal request functions
  const requestWithdrawal = (request: Omit<WithdrawalRequest, 'id' | 'status' | 'createdAt'>) => {
    if (!user) {
      toast.error('You must be logged in to request a withdrawal');
      return;
    }
    
    if (user.coins < request.coinAmount) {
      toast.error('Not enough coins to make this withdrawal');
      return;
    }
    
    // Check if user has enough referrals
    if (user.referralCount < settings.minReferralsForWithdrawal) {
      toast.error(`You need at least ${settings.minReferralsForWithdrawal} referrals to make a withdrawal`);
      return;
    }

    const newRequest: WithdrawalRequest = {
      ...request,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date().toISOString()
    };
    
    setWithdrawalRequests([...withdrawalRequests, newRequest]);
    toast.success('Withdrawal request submitted successfully');
  };

  const updateWithdrawalStatus = (id: string, status: 'approved' | 'rejected') => {
    setWithdrawalRequests(
      withdrawalRequests.map(wr => 
        wr.id === id ? { ...wr, status } : wr
      )
    );
    toast.success(`Withdrawal request ${status}`);
  };

  // Settings functions
  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings({ ...settings, ...newSettings });
    toast.success('Settings updated successfully');
  };

  const value = {
    tasks,
    rewards,
    popupAds,
    bannerAds,
    withdrawalRequests,
    settings,
    addTask,
    updateTask,
    deleteTask,
    addReward,
    updateReward,
    deleteReward,
    addPopupAd,
    updatePopupAd,
    deletePopupAd,
    addBannerAd,
    updateBannerAd,
    deleteBannerAd,
    requestWithdrawal,
    updateWithdrawalStatus,
    updateSettings
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
