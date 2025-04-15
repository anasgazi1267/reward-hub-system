
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Reward, Task, PopupAd, BannerAd, WithdrawalRequest, SystemSettings } from '@/lib/types';

// Mock data for demonstration
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Join our Telegram channel',
    description: 'Join our Telegram channel and stay updated with the latest news',
    type: 'Telegram',
    coinReward: 50,
    targetUrl: 'https://t.me/example',
    imageUrl: '/placeholder.svg',
    frequency: 'once'
  },
  {
    id: '2',
    title: 'Subscribe to YouTube channel',
    description: 'Subscribe to our YouTube channel and watch the latest videos',
    type: 'YouTube',
    coinReward: 100,
    targetUrl: 'https://youtube.com/example',
    imageUrl: '/placeholder.svg',
    frequency: 'daily'
  },
  {
    id: '3',
    title: 'Daily Login',
    description: 'Login daily to earn coins',
    type: 'Daily',
    coinReward: 10,
    targetUrl: '/',
    frequency: 'daily'
  }
];

const mockRewards: Reward[] = [
  {
    id: '1',
    name: 'Amazon Gift Card $10',
    description: '$10 Amazon Gift Card sent via email',
    category: 'Amazon',
    coinCost: 5000,
    imageUrl: '/placeholder.svg',
    available: true
  },
  {
    id: '2',
    name: 'Google Play Credit $5',
    description: '$5 Google Play Credit code',
    category: 'Google',
    coinCost: 2500,
    imageUrl: '/placeholder.svg',
    available: true
  }
];

const mockPopupAds: PopupAd[] = [
  {
    id: '1',
    htmlContent: '<div>Advertisement 1</div>',
    durationSeconds: 15,
    coinReward: 5
  },
  {
    id: '2',
    htmlContent: '<div>Advertisement 2</div>',
    durationSeconds: 25,
    coinReward: 15
  },
  {
    id: '3',
    htmlContent: '<div>Advertisement 3</div>',
    durationSeconds: 35,
    coinReward: 25
  },
  {
    id: '4',
    htmlContent: '<div>Advertisement 4</div>',
    durationSeconds: 50,
    coinReward: 40
  }
];

const mockBannerAds: BannerAd[] = [
  {
    id: '1',
    htmlContent: '<div>Banner Ad 1</div>',
    name: 'Top Banner'
  },
  {
    id: '2',
    htmlContent: '<div>Banner Ad 2</div>',
    name: 'Bottom Banner'
  }
];

const mockWithdrawalRequests: WithdrawalRequest[] = [
  {
    id: '1',
    userId: 'user1',
    username: 'user1',
    rewardId: '1',
    rewardName: 'Amazon Gift Card $10',
    coinAmount: 5000,
    status: 'pending',
    createdAt: new Date().toISOString(),
    email: 'user1@example.com',
    category: 'Amazon'
  }
];

const mockSettings: SystemSettings = {
  minWithdrawalCoins: 1000,
  referralReward: 100,
  inviterReward: 50,
  minReferralsForWithdrawal: 5
};

// Create the context
type DataContextType = {
  tasks: Task[];
  rewards: Reward[];
  popupAds: PopupAd[];
  bannerAds: BannerAd[];
  withdrawalRequests: WithdrawalRequest[];
  settings: SystemSettings;
};

const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider component
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [tasks] = useState<Task[]>(mockTasks);
  const [rewards] = useState<Reward[]>(mockRewards);
  const [popupAds] = useState<PopupAd[]>(mockPopupAds);
  const [bannerAds] = useState<BannerAd[]>(mockBannerAds);
  const [withdrawalRequests] = useState<WithdrawalRequest[]>(mockWithdrawalRequests);
  const [settings] = useState<SystemSettings>(mockSettings);

  return (
    <DataContext.Provider
      value={{
        tasks,
        rewards,
        popupAds,
        bannerAds,
        withdrawalRequests,
        settings
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

// Custom hook to use the context
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
