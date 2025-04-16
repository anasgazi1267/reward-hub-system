
import React, { createContext, useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { AuthContextType } from './types';
import { useAuthState } from './useAuthState';
import { useAuthOperations } from './useAuthOperations';
import { useCoinOperations } from './useCoinOperations';
import { useTaskOperations } from './useTaskOperations';
import { handleReferralCode } from './utils';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { user, setUser, isLoading } = useAuthState();
  const { login, register, logout } = useAuthOperations(user, setUser);
  const { addCoins, deductCoins } = useCoinOperations(user, setUser);
  const { 
    completeTask, 
    hasCompletedTask, 
    canCompleteTask, 
    meetsWithdrawalRequirements 
  } = useTaskOperations(user, setUser);

  // Process referral code from URL if present
  useEffect(() => {
    handleReferralCode(location);
  }, [location]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isLoading,
      addCoins,
      deductCoins,
      completeTask,
      hasCompletedTask,
      canCompleteTask,
      meetsWithdrawalRequirements,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
