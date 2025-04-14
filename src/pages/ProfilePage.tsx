
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/ads/AdBanner';
import { 
  User as UserIcon, 
  Mail, 
  Copy, 
  Coins, 
  Users, 
  CheckCircle2,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/sonner';
import { useData } from '@/context/DataContext';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const { tasks } = useData();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const completedTasksCount = user.completedTasks.length;
  const totalTasksCount = tasks.length;
  const completionPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100)
    : 0;
  
  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success('Referral code copied to clipboard!');
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title="Profile" 
          description="Manage your account"
        />
        
        <AdBanner position="top" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>View and manage your account details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Username</div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <UserIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.username}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{user.email}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Referral Code</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-gray-50 rounded-md font-medium font-mono">
                      {user.referralCode}
                    </div>
                    <Button size="sm" variant="outline" onClick={copyReferralCode}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Stats Overview</CardTitle>
                <CardDescription>Your activity and earnings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <Coins className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium text-muted-foreground">Total Coins</div>
                    <div className="text-2xl font-bold mt-1">{user.coins}</div>
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium text-muted-foreground">Referrals</div>
                    <div className="text-2xl font-bold mt-1">{user.referralCount}</div>
                  </div>
                  
                  <div className="bg-primary/5 p-4 rounded-lg text-center">
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <div className="text-sm font-medium text-muted-foreground">Tasks Completed</div>
                    <div className="text-2xl font-bold mt-1">{completedTasksCount}/{totalTasksCount}</div>
                  </div>
                </div>
                
                <div className="mt-5">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Task Completion</span>
                    <span className="font-medium">{completionPercentage}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary"
                      style={{ width: `${completionPercentage}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Actions</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/rewards')}
                >
                  <Coins className="h-4 w-4 mr-2 text-primary" />
                  Redeem Coins
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start" 
                  onClick={() => navigate('/earn')}
                >
                  <Users className="h-4 w-4 mr-2 text-primary" />
                  Earn More Coins
                </Button>
                
                <Button 
                  variant="destructive" 
                  className="w-full justify-start" 
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <AdBanner position="bottom" />
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
