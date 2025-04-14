
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/types';
import { toast } from '@/components/ui/sonner';

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, referralCode?: string) => Promise<boolean>;
  logout: () => void;
  updateUserCoins: (newCoins: number) => void;
  addCoins: (amount: number) => void;
  deductCoins: (amount: number) => boolean;
  completeTask: (taskId: string) => void;
  meetsWithdrawalRequirements: () => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user
const ADMIN_USERNAME = 'anasgazi11';
const ADMIN_PASSWORD = 'Anas1999@';

// Mock initial data
const mockUsers: User[] = [
  {
    id: '1',
    username: ADMIN_USERNAME,
    email: 'admin@rewardhub.com',
    coins: 5000,
    referralCode: 'ADMIN123',
    referralCount: 0,
    completedTasks: [],
    taskCompletionTimes: {},
    isAdmin: true
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<User[]>(mockUsers);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('rewardHubUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Load users from localStorage or use mock data
    const storedUsers = localStorage.getItem('rewardHubUsers');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    } else {
      localStorage.setItem('rewardHubUsers', JSON.stringify(users));
    }
    
    setIsLoading(false);
  }, []);

  // Save users to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rewardHubUsers', JSON.stringify(users));
  }, [users]);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if admin
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const adminUser = users.find(u => u.username === ADMIN_USERNAME);
        if (adminUser) {
          setUser(adminUser);
          localStorage.setItem('rewardHubUser', JSON.stringify(adminUser));
          toast.success('Welcome back, Admin!');
          return true;
        }
      }
      
      // Check regular users
      const foundUser = users.find(u => u.username === username);
      
      if (foundUser) {
        // In a real app, you would hash and compare passwords
        // This is just a simulation
        setUser(foundUser);
        localStorage.setItem('rewardHubUser', JSON.stringify(foundUser));
        toast.success(`Welcome back, ${foundUser.username}!`);
        return true;
      } else {
        toast.error('Invalid username or password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred during login');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (
    username: string, 
    email: string, 
    password: string, 
    referralCode?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if username already exists
      if (users.some(u => u.username === username)) {
        toast.error('Username already exists');
        return false;
      }

      // Check if email already exists
      if (users.some(u => u.email === email)) {
        toast.error('Email already exists');
        return false;
      }

      // Generate a unique referral code
      const newReferralCode = `${username.slice(0, 4).toUpperCase()}${Math.floor(1000 + Math.random() * 9000)}`;
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        username,
        email,
        coins: 100, // Starting coins
        referralCode: newReferralCode,
        referralCount: 0,
        completedTasks: [],
        taskCompletionTimes: {},
        isAdmin: false
      };
      
      // If there's a referral code, add the referral connection
      if (referralCode) {
        const referrer = users.find(u => u.referralCode === referralCode);
        if (referrer) {
          newUser.referredBy = referrer.id;
          
          // Update referrer's stats and coins
          const updatedUsers = users.map(u => {
            if (u.id === referrer.id) {
              return {
                ...u,
                referralCount: u.referralCount + 1,
                coins: u.coins + 50 // Reward for referral
              };
            }
            return u;
          });
          
          setUsers([...updatedUsers, newUser]);
          toast.success('Account created with referral bonus!');
        } else {
          // Invalid referral code
          toast.error('Invalid referral code, but account created');
          setUsers([...users, newUser]);
        }
      } else {
        // No referral code
        setUsers([...users, newUser]);
        toast.success('Account created successfully!');
      }
      
      // Log in the new user
      setUser(newUser);
      localStorage.setItem('rewardHubUser', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred during registration');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem('rewardHubUser');
    toast.success('Logged out successfully');
  };

  // Update user coins
  const updateUserCoins = (newCoins: number) => {
    if (!user) return;
    
    const updatedUser = { ...user, coins: newCoins };
    setUser(updatedUser);
    localStorage.setItem('rewardHubUser', JSON.stringify(updatedUser));
    
    // Update in users array
    const updatedUsers = users.map(u => 
      u.id === user.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('rewardHubUsers', JSON.stringify(updatedUsers));
  };

  // Add coins to user account
  const addCoins = (amount: number) => {
    if (!user) return;
    updateUserCoins(user.coins + amount);
    toast.success(`Earned ${amount} coins!`);
  };

  // Deduct coins from user account
  const deductCoins = (amount: number): boolean => {
    if (!user) return false;
    
    if (user.coins < amount) {
      toast.error('Not enough coins!');
      return false;
    }
    
    updateUserCoins(user.coins - amount);
    toast.success(`${amount} coins deducted from your account`);
    return true;
  };

  // Mark task as completed
  const completeTask = (taskId: string) => {
    if (!user) return;
    
    // Always mark the completion time
    const currentTime = new Date().toISOString();
    const updatedTimes = {
      ...user.taskCompletionTimes,
      [taskId]: currentTime
    };
    
    // For non-daily tasks, also add to completedTasks array if not already there
    let updatedCompletedTasks = [...user.completedTasks];
    if (!user.completedTasks.includes(taskId)) {
      updatedCompletedTasks.push(taskId);
    }
    
    const updatedUser = {
      ...user,
      completedTasks: updatedCompletedTasks,
      taskCompletionTimes: updatedTimes
    };
    
    setUser(updatedUser);
    localStorage.setItem('rewardHubUser', JSON.stringify(updatedUser));
    
    // Update in users array
    const updatedUsers = users.map(u => 
      u.id === user.id ? updatedUser : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('rewardHubUsers', JSON.stringify(updatedUsers));
  };

  // Check if user meets withdrawal requirements
  const meetsWithdrawalRequirements = (): boolean => {
    if (!user) return false;
    return user.referralCount >= 5; // Hardcoded requirement of 5 referrals
  };

  const value = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateUserCoins,
    addCoins,
    deductCoins,
    completeTask,
    meetsWithdrawalRequirements
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
