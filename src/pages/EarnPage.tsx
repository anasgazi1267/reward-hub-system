
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/ads/AdBanner';
import { 
  Award,
  Users,
  ArrowRight,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { PopupAd } from '@/lib/types';
import PopupAdModal from '@/components/ads/PopupAdModal';
import TaskCard from '@/components/tasks/TaskCard';
import { toast } from '@/components/ui/sonner';

const EarnPage = () => {
  const { user } = useAuth();
  const { tasks, popupAds, settings } = useData();
  const navigate = useNavigate();
  
  const [selectedAd, setSelectedAd] = useState<PopupAd | null>(null);
  const [isAdOpen, setIsAdOpen] = useState(false);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const openRandomAd = (durationFilter: number) => {
    const filteredAds = popupAds.filter(ad => ad.durationSeconds === durationFilter);
    if (filteredAds.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredAds.length);
      setSelectedAd(filteredAds[randomIndex]);
      setIsAdOpen(true);
    }
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    toast.success('Referral code copied to clipboard!');
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title="Earn Coins" 
          description="Complete tasks and watch ads to earn coins"
        />
        
        <AdBanner position="top" />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Watch Ads</CardTitle>
                <CardDescription>Watch ads to earn coins quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
                <CardTitle>Complete Tasks</CardTitle>
                <CardDescription>Earn coins by completing tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tasks.map(task => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                  {tasks.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No tasks available right now. Check back later!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
              <CardHeader>
                <CardTitle>Refer Friends</CardTitle>
                <CardDescription>Invite friends and earn {settings.referralReward} coins for each referral</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="bg-white rounded-lg p-4 space-y-3">
                    <div className="text-sm font-medium">Your Referral Code</div>
                    <div className="flex">
                      <div className="bg-gray-100 flex-1 py-2 px-3 rounded-l-md font-mono">{user.referralCode}</div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-l-none"
                        onClick={copyReferralCode}
                      >
                        <Copy size={16} />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="text-primary" size={24} />
                      <div>
                        <div className="font-medium">Total Referrals</div>
                        <div className="text-2xl font-bold">{user.referralCount}</div>
                      </div>
                    </div>
                    <div className="text-4xl font-bold text-primary">
                      {user.referralCount * settings.referralReward}
                      <span className="text-sm font-normal ml-1">coins</span>
                    </div>
                  </div>
                  
                  <div className="bg-white p-4 rounded-lg">
                    <div className="text-sm font-medium mb-2">Referral Status</div>
                    <div className="flex items-center justify-between">
                      <div>Required Referrals for Withdrawal:</div>
                      <div className="font-medium">{settings.minReferralsForWithdrawal}</div>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <div>Your Referrals:</div>
                      <div className="font-medium">{user.referralCount}</div>
                    </div>
                    <div className="mt-3">
                      <div className="relative pt-1">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div
                            style={{ width: `${Math.min(user.referralCount / settings.minReferralsForWithdrawal * 100, 100)}%` }}
                            className="shadow-none flex flex-col justify-center text-center whitespace-nowrap text-white bg-primary transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    {user.referralCount < settings.minReferralsForWithdrawal && (
                      <div className="text-sm text-amber-600 mt-2">
                        You need {settings.minReferralsForWithdrawal - user.referralCount} more referrals to be able to withdraw.
                      </div>
                    )}
                  </div>
                  
                  <Button className="w-full gap-2" onClick={() => navigate('/rewards')}>
                    Redeem Rewards <ArrowRight size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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

export default EarnPage;
