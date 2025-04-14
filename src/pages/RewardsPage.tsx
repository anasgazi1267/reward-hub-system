
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import MainLayout from '@/components/layout/MainLayout';
import PageTitle from '@/components/shared/PageTitle';
import AdBanner from '@/components/ads/AdBanner';
import { 
  Coins, 
  Gift, 
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Reward, RewardCategory } from '@/lib/types';
import RewardCard from '@/components/rewards/RewardCard';
import RedeemModal from '@/components/rewards/RedeemModal';
import { useNavigate } from 'react-router-dom';

const RewardsPage = () => {
  const { user } = useAuth();
  const { rewards } = useData();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory | 'All'>('All');
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isRedeemModalOpen, setIsRedeemModalOpen] = useState(false);
  
  if (!user) {
    navigate('/login');
    return null;
  }
  
  const categories: Array<RewardCategory | 'All'> = [
    'All',
    'Amazon',
    'Google',
    'FreeFire',
    'PUBG',
    'Visa'
  ];
  
  // Filter rewards by search term and category
  const filteredRewards = rewards.filter(reward => {
    const matchesSearch = reward.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         reward.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || reward.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  const handleSelectReward = (reward: Reward) => {
    setSelectedReward(reward);
    setIsRedeemModalOpen(true);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <PageTitle 
          title="Rewards" 
          description="Redeem your coins for amazing rewards"
          action={
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 bg-gold-100 text-gold-800 px-3 py-1.5 rounded-full">
                <Coins size={16} className="text-gold-500" />
                <span className="font-medium">{user.coins.toLocaleString()}</span>
              </div>
            </div>
          }
        />
        
        <AdBanner position="top" />
        
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rewards..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs 
            defaultValue="All" 
            value={selectedCategory} 
            onValueChange={(value) => setSelectedCategory(value as RewardCategory | 'All')}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full sm:w-auto">
              {categories.map(category => (
                <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        
        {filteredRewards.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredRewards.map(reward => (
              <RewardCard 
                key={reward.id} 
                reward={reward} 
                onSelect={handleSelectReward} 
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center">
            <Gift className="mx-auto text-muted-foreground h-12 w-12 mb-3" />
            <h3 className="text-lg font-medium">No rewards found</h3>
            <p className="text-muted-foreground mt-1">
              {searchTerm || selectedCategory !== 'All' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No rewards are available at the moment. Check back later!'}
            </p>
            {(searchTerm || selectedCategory !== 'All') && (
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        )}
        
        <AdBanner position="bottom" />
      </div>
      
      {/* Redeem Modal */}
      <RedeemModal
        reward={selectedReward}
        isOpen={isRedeemModalOpen}
        onClose={() => {
          setIsRedeemModalOpen(false);
          setSelectedReward(null);
        }}
      />
    </MainLayout>
  );
};

export default RewardsPage;
