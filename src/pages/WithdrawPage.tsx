
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/ads/AdBanner';
import { 
  Coins, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { WithdrawalRequest, Reward, RewardCategory } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const WithdrawPage = () => {
  const { user } = useAuth();
  const { withdrawalRequests, rewards, settings } = useData();
  const navigate = useNavigate();
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  // Filter withdrawal requests for current user
  const userWithdrawals = withdrawalRequests.filter(wr => wr.userId === user.id);
  
  // Sort by date (newest first)
  const sortedWithdrawals = [...userWithdrawals].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Check if user meets requirements for withdrawal
  const canWithdraw = user.referralCount >= settings.minReferralsForWithdrawal;
  
  const getBadgeForStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock size={12} className="mr-1" /> Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 size={12} className="mr-1" /> Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle size={12} className="mr-1" /> Rejected
        </Badge>;
      default:
        return null;
    }
  };
  
  const getCategoryIcon = (category: RewardCategory) => {
    switch (category) {
      case 'Amazon':
        return '🛒';
      case 'Google':
        return '🎮';
      case 'FreeFire':
        return '🔥';
      case 'PUBG':
        return '🎯';
      case 'Visa':
        return '💳';
      default:
        return '🎁';
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title="Withdraw" 
          description="Redeem your coins for rewards"
        />
        
        <AdBanner position="top" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
                <CardDescription>Your withdrawal history</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all">
                    {renderWithdrawals(sortedWithdrawals)}
                  </TabsContent>
                  
                  <TabsContent value="pending">
                    {renderWithdrawals(sortedWithdrawals.filter(wr => wr.status === 'pending'))}
                  </TabsContent>
                  
                  <TabsContent value="approved">
                    {renderWithdrawals(sortedWithdrawals.filter(wr => wr.status === 'approved'))}
                  </TabsContent>
                  
                  <TabsContent value="rejected">
                    {renderWithdrawals(sortedWithdrawals.filter(wr => wr.status === 'rejected'))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>My Balance</CardTitle>
                <CardDescription>Your current coin balance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gold-50 p-4 rounded-lg border border-gold-200 text-center">
                  <div className="text-gold-800 font-medium">Available Coins</div>
                  <div className="flex justify-center items-center mt-1">
                    <Coins className="h-6 w-6 text-gold-500 mr-2" />
                    <span className="text-3xl font-bold">{user.coins}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    className="w-full" 
                    onClick={() => navigate('/rewards')}
                    disabled={!canWithdraw || user.coins < settings.minWithdrawalCoins}
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Request Withdrawal
                  </Button>
                  
                  {!canWithdraw && (
                    <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md flex">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        You need at least {settings.minReferralsForWithdrawal} referrals to be able to withdraw.
                        You currently have {user.referralCount} referrals.
                      </div>
                    </div>
                  )}
                  
                  {canWithdraw && user.coins < settings.minWithdrawalCoins && (
                    <div className="mt-3 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md flex">
                      <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                      <div>
                        Minimum withdrawal amount is {settings.minWithdrawalCoins} coins.
                        You need {settings.minWithdrawalCoins - user.coins} more coins.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Popular Rewards</CardTitle>
                <CardDescription>Quick access to rewards</CardDescription>
              </CardHeader>
              <CardContent>
                {rewards.slice(0, 3).map(reward => (
                  <div 
                    key={reward.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-md cursor-pointer transition-colors"
                    onClick={() => navigate('/rewards')}
                  >
                    <div className="h-10 w-10 bg-primary/10 rounded-md flex items-center justify-center text-xl">
                      {getCategoryIcon(reward.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{reward.name}</h4>
                      <div className="flex items-center text-muted-foreground text-xs mt-0.5">
                        <Coins className="h-3 w-3 mr-1" />
                        <span>{reward.coinCost} coins</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full mt-2"
                  onClick={() => navigate('/rewards')}
                >
                  View all rewards
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

// Helper function to render withdrawals
function renderWithdrawals(withdrawals: WithdrawalRequest[]) {
  // Badge helper function
  const getBadgeForStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
          <Clock size={12} className="mr-1" /> Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle2 size={12} className="mr-1" /> Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
          <XCircle size={12} className="mr-1" /> Rejected
        </Badge>;
      default:
        return null;
    }
  };

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-12">
        <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="text-lg font-medium">No withdrawal requests</h3>
        <p className="text-muted-foreground mt-1">You haven't made any withdrawal requests yet.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {withdrawals.map(withdrawal => (
        <div 
          key={withdrawal.id}
          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{withdrawal.rewardName}</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {new Date(withdrawal.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
            <div>
              {getBadgeForStatus(withdrawal.status)}
            </div>
          </div>
          <div className="flex justify-between items-center mt-3 pt-3 border-t">
            <div className="flex items-center gap-1 text-gold-600 font-semibold">
              <Coins size={16} className="text-gold-500" />
              <span>{withdrawal.coinAmount}</span>
            </div>
            {withdrawal.additionalInfo?.playerUsername && (
              <div className="text-xs text-muted-foreground">
                Player: {withdrawal.additionalInfo.playerUsername}
                {withdrawal.additionalInfo.playerId && ` (${withdrawal.additionalInfo.playerId})`}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default WithdrawPage;
