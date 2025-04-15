
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import StatCard from '@/components/home/StatCard';
import AdBanner from '@/components/ads/AdBanner';
import { 
  Coins, 
  Gift, 
  FileCheck, 
  Users, 
  Award,
  DollarSign,
  ArrowUpRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { PopupAd } from '@/lib/types';
import PopupAdModal from '@/components/ads/PopupAdModal';

const HomePage = () => {
  const { user } = useAuth();
  const { tasks, rewards, popupAds, withdrawalRequests } = useData();
  const navigate = useNavigate();
  
  const [selectedAd, setSelectedAd] = useState<PopupAd | null>(null);
  const [isAdOpen, setIsAdOpen] = useState(false);
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  const pendingWithdrawals = withdrawalRequests.filter(
    wr => wr.userId === user.id && wr.status === 'pending'
  ).length;
  
  const completedTasks = user.completedTasks.length;
  
  const openRandomAd = (durationFilter: number) => {
    const filteredAds = popupAds.filter(ad => ad.durationSeconds === durationFilter);
    if (filteredAds.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAds.length);
      setSelectedAd(filteredAds[randomIndex]);
      setIsAdOpen(true);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title={`Welcome back, ${user.username}!`} 
          description="Check your stats and earn more coins"
        />
        
        <AdBanner position="top" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Coin Balance"
            value={user.coins}
            icon={<Coins size={24} />}
            className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
          />
          <StatCard
            title="Available Rewards"
            value={rewards.filter(r => r.available).length}
            icon={<Gift size={24} />}
            className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
          />
          <StatCard
            title="Tasks Completed"
            value={completedTasks}
            description={`${tasks.length - completedTasks} tasks remaining`}
            icon={<FileCheck size={24} />}
            className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
          />
          <StatCard
            title="Referrals"
            value={user.referralCount}
            description={`Referral code: ${user.referralCode}`}
            icon={<Users size={24} />}
            className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Earn Coins</span>
                <Button variant="link" size="sm" onClick={() => navigate('/earn')}>
                  View All <ArrowUpRight size={14} className="ml-1" />
                </Button>
              </CardTitle>
              <CardDescription>Watch ads to earn coins quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col items-center"
                  onClick={() => openRandomAd(15)}
                >
                  <Award className="mb-2 text-amber-500" size={24} />
                  <span className="font-medium">15 Seconds</span>
                  <span className="text-xs text-muted-foreground mt-1">+5 Coins</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col items-center"
                  onClick={() => openRandomAd(25)}
                >
                  <Award className="mb-2 text-amber-500" size={24} />
                  <span className="font-medium">25 Seconds</span>
                  <span className="text-xs text-muted-foreground mt-1">+15 Coins</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col items-center"
                  onClick={() => openRandomAd(35)}
                >
                  <Award className="mb-2 text-amber-500" size={24} />
                  <span className="font-medium">35 Seconds</span>
                  <span className="text-xs text-muted-foreground mt-1">+25 Coins</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-3 flex flex-col items-center"
                  onClick={() => openRandomAd(50)}
                >
                  <Award className="mb-2 text-amber-500" size={24} />
                  <span className="font-medium">50 Seconds</span>
                  <span className="text-xs text-muted-foreground mt-1">+40 Coins</span>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>My Withdrawals</span>
                <Button variant="link" size="sm" onClick={() => navigate('/withdraw')}>
                  Request <ArrowUpRight size={14} className="ml-1" />
                </Button>
              </CardTitle>
              <CardDescription>Manage your withdrawal requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 rounded-lg p-4 text-center">
                    <DollarSign className="mx-auto mb-2 text-amber-500" size={24} />
                    <div className="font-medium">Pending</div>
                    <div className="text-2xl font-bold mt-1">{pendingWithdrawals}</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <Coins className="mx-auto mb-2 text-green-500" size={24} />
                    <div className="font-medium">Available</div>
                    <div className="text-2xl font-bold mt-1">{user.coins}</div>
                  </div>
                </div>
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/rewards')}
                >
                  <Gift size={16} className="mr-2" /> Browse Rewards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <AdBanner position="bottom" />
      </div>
      
      {/* Popup Ad Modal */}
      {selectedAd && (
        <PopupAdModal
          ad={selectedAd}
          isOpen={isAdOpen}
          onClose={() => {
            setIsAdOpen(false);
            setSelectedAd(null);
          }}
        />
      )}
    </MainLayout>
  );
};

export default HomePage;
