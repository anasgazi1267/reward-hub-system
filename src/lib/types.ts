
// Types for the reward hub system

// User Type
export interface User {
  id: string;
  username: string;
  email: string;
  coins: number;
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  completedTasks: string[];
  taskCompletionTimes: Record<string, string>; // Map of taskId to ISO timestamp
  isAdmin: boolean;
}

// Reward Types
export interface Reward {
  id: string;
  name: string;
  description: string;
  category: RewardCategory;
  coinCost: number;
  imageUrl: string;
  available: boolean;
}

export type RewardCategory = 'Amazon' | 'Google' | 'FreeFire' | 'PUBG' | 'Visa';

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  coinReward: number;
  targetUrl: string;
  imageUrl?: string;
  requirements?: string;
  frequency?: TaskFrequency;
}

export type TaskType = 'Telegram' | 'YouTube' | 'Daily' | 'Custom';
export type TaskFrequency = 'once' | 'daily';

// Ad Types
export interface PopupAd {
  id: string;
  htmlContent: string;
  durationSeconds: number;
  coinReward: number;
}

export interface BannerAd {
  id: string;
  htmlContent: string;
  name: string;
}

// Withdrawal Types
export interface WithdrawalRequest {
  id: string;
  userId: string;
  username: string;
  rewardId: string;
  rewardName: string;
  coinAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  playerUsername?: string;
  playerID?: string;
  email?: string;
  phoneNumber?: string;
  category: RewardCategory;
}

// Settings Type
export interface SystemSettings {
  minWithdrawalCoins: number;
  referralReward: number;
  minReferralsForWithdrawal: number;
}

// Admin Analytics
export interface AdminAnalytics {
  totalUsers: number;
  totalCoins: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  completedTasks: number;
  totalAdsViewed: number;
}
