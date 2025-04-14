
import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Reward } from '@/lib/types';
import { Coins } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { toast } from '@/components/ui/sonner';

interface RedeemModalProps {
  reward: Reward | null;
  isOpen: boolean;
  onClose: () => void;
}

const RedeemModal = ({ reward, isOpen, onClose }: RedeemModalProps) => {
  const { user, deductCoins, meetsWithdrawalRequirements } = useAuth();
  const { requestWithdrawal } = useData();
  const [playerUsername, setPlayerUsername] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!reward || !user) return null;

  const needsGameInfo = reward.category === 'FreeFire' || reward.category === 'PUBG';
  const isGiftCard = reward.category === 'Amazon' || reward.category === 'Google' || reward.category === 'Visa';

  const handleRedeem = () => {
    setIsSubmitting(true);
    
    // Validate fields
    if (needsGameInfo && (!playerUsername || !playerId)) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    if (isGiftCard && !email) {
      toast.error('Please provide your email address');
      setIsSubmitting(false);
      return;
    }
    
    // Check if user has enough coins
    if (user.coins < reward.coinCost) {
      toast.error('You do not have enough coins for this reward');
      setIsSubmitting(false);
      return;
    }
    
    // Check if user meets withdrawal requirements before processing
    if (!meetsWithdrawalRequirements()) {
      setIsSubmitting(false);
      onClose(); // Close the modal
      return; // The requestWithdrawal function will handle the redirect and error message
    }
    
    // Prepare the withdrawal request
    const withdrawalData = {
      userId: user.id,
      username: user.username,
      rewardId: reward.id,
      rewardName: reward.name,
      coinAmount: reward.coinCost,
      additionalInfo: {
        playerUsername: needsGameInfo ? playerUsername : undefined,
        playerId: needsGameInfo ? playerId : undefined,
        email: isGiftCard ? email : undefined
      }
    };
    
    // Submit withdrawal request and deduct coins if successful
    const success = requestWithdrawal(withdrawalData);
    
    if (success) {
      // Deduct coins from user account
      deductCoins(reward.coinCost);
      
      // Reset form and close modal
      setPlayerUsername('');
      setPlayerId('');
      setEmail('');
      setIsSubmitting(false);
      onClose();
    } else {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redeem {reward.name}</DialogTitle>
          <DialogDescription>
            You're about to redeem this reward for {reward.coinCost} coins.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Your Balance:</div>
            <div className="flex items-center gap-1 text-gold-600 font-semibold">
              <Coins size={16} className="text-gold-500" />
              <span>{user.coins}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="font-medium">Cost:</div>
            <div className="flex items-center gap-1 text-gold-600 font-semibold">
              <Coins size={16} className="text-gold-500" />
              <span>{reward.coinCost}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between font-medium">
            <div>Remaining Balance:</div>
            <div className="flex items-center gap-1 text-gold-600 font-semibold">
              <Coins size={16} className="text-gold-500" />
              <span>{Math.max(0, user.coins - reward.coinCost)}</span>
            </div>
          </div>
          
          <div className="h-px bg-gray-200 my-2"></div>
          
          {needsGameInfo && (
            <>
              <div className="grid gap-2">
                <Label htmlFor="playerUsername">Player Username</Label>
                <Input
                  id="playerUsername"
                  value={playerUsername}
                  onChange={(e) => setPlayerUsername(e.target.value)}
                  placeholder="Enter your in-game username"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="playerId">Player ID</Label>
                <Input
                  id="playerId"
                  value={playerId}
                  onChange={(e) => setPlayerId(e.target.value)}
                  placeholder="Enter your player ID"
                />
              </div>
            </>
          )}
          
          {isGiftCard && (
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email to receive your gift card"
                type="email"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleRedeem} disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : 'Confirm Redemption'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemModal;
