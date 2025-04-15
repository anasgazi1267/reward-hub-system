
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/ads/AdBanner';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Users, Copy, Share2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { useData } from '@/context/DataProvider';
import { useNavigate } from 'react-router-dom';

const InvitePage = () => {
  const { user } = useAuth();
  const { settings } = useData();
  const navigate = useNavigate();
  const [copyText, setCopyText] = useState('Copy');
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);
  
  if (!user) return null;
  
  const referralLink = `${window.location.origin}/register?ref=${user.referralCode}`;
  const maxReferrals = 10; // We can make this dynamic from settings later
  const progressPercentage = (user.referralCount / maxReferrals) * 100;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopyText('Copied!');
    toast.success('Invite link copied to clipboard!');
    setTimeout(() => setCopyText('Copy'), 3000);
  };
  
  const shareInviteLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join RewardHub',
        text: `Join RewardHub with my referral code and earn bonus coins! Use code: ${user.referralCode}`,
        url: referralLink,
      })
      .then(() => toast.success('Link shared successfully!'))
      .catch((error) => console.error('Error sharing:', error));
    } else {
      copyToClipboard();
    }
  };
  
  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title="Invite Friends" 
          description="Invite friends and earn rewards"
        />
        
        <AdBanner position="top" />
        
        <Card className="border-dashed border-2 border-primary/30 bg-primary/5">
          <CardContent className="pt-6 space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Invite Friends & Earn Big</h2>
              <p className="text-lg text-muted-foreground">
                Invite friends to join and earn coins for every successful referral!
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <span className="text-lg font-medium">Your Referrals:</span>
              </div>
              <span className="text-lg font-bold">{user.referralCount} / {maxReferrals}</span>
            </div>
            
            <Progress value={progressPercentage} className="h-2" />
            
            <p className="text-center text-lg">
              Invite {maxReferrals - user.referralCount} more friends to get a special reward!
            </p>
            
            <div className="bg-white rounded-full border overflow-hidden">
              <div className="flex items-center">
                <div className="flex-1 p-3 px-4 truncate">
                  <p className="truncate text-sm md:text-base">{referralLink}</p>
                </div>
                <Button 
                  onClick={copyToClipboard} 
                  className="rounded-l-none"
                >
                  {copyText}
                </Button>
              </div>
            </div>
            
            <div className="text-center">
              <p className="mb-2">Or share your invite code: <span className="font-mono font-bold">{user.referralCode}</span></p>
              
              <Button 
                onClick={shareInviteLink} 
                size="lg" 
                className="w-full md:w-auto px-8 mt-2 bg-purple-500 hover:bg-purple-600"
              >
                <Share2 className="mr-2" /> Share Invite Link
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <AdBanner position="bottom" />
      </div>
    </MainLayout>
  );
};

export default InvitePage;
