
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Reward } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { toast } from '@/components/ui/sonner';
import { DollarSign } from 'lucide-react';

interface RedeemModalProps {
  reward: Reward;
  isOpen: boolean;
  onClose: () => void;
}

const RedeemModal = ({ reward, isOpen, onClose }: RedeemModalProps) => {
  const navigate = useNavigate();
  const { user, deductCoins, meetsWithdrawalRequirements } = useAuth();
  const { requestWithdrawal } = useData();
  const [playerUsername, setPlayerUsername] = useState('');
  const [playerID, setPlayerID] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (!user) return null;
  
  const needsGameInfo = reward.category === 'gaming';
  const { title, coinCost, category } = reward;
  
  const handleSubmit = () => {
    setIsSubmitting(true);
    
    // Validate form
    if (needsGameInfo && (!playerUsername || !playerID)) {
      toast.error('Please enter your game username and ID');
      setIsSubmitting(false);
      return;
    }
    
    if (!email) {
      toast.error('Please enter your email address');
      setIsSubmitting(false);
      return;
    }
    
    if (!phoneNumber) {
      toast.error('Please enter your phone number');
      setIsSubmitting(false);
      return;
    }
    
    // Check if user has enough coins
    if (user.coins < coinCost) {
      toast.error('You don\'t have enough coins for this reward');
      setIsSubmitting(false);
      return;
    }
    
    // Check if user meets withdrawal requirements
    if (!meetsWithdrawalRequirements()) {
      setIsSubmitting(false);
      onClose(); // Close the modal
      toast.error("You need at least 5 referrals to make a withdrawal");
      navigate('/profile'); // Redirect to profile for referrals
      return;
    }
    
    // Prepare the withdrawal request
    const withdrawalRequest = {
      rewardId: reward.id,
      rewardName: title,
      coinAmount: coinCost,
      playerUsername: needsGameInfo ? playerUsername : '',
      playerID: needsGameInfo ? playerID : '',
      email,
      phoneNumber,
      category
    };
    
    // Deduct coins and create withdrawal request
    const coinsDeducted = deductCoins(coinCost);
    if (coinsDeducted) {
      const success = requestWithdrawal(withdrawalRequest);
      if (success) {
        toast.success(`Withdrawal request for ${title} submitted!`);
        onClose();
      } else {
        // If withdrawal failed but coins were deducted, we should refund
        // This won't happen with our current implementation but is good practice
        toast.error(`Withdrawal request failed`);
      }
    }
    
    setIsSubmitting(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Redeem {title}</DialogTitle>
          <DialogDescription>
            Complete the form to redeem this reward.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-md border border-amber-200">
            <DollarSign className="h-5 w-5 text-amber-500" />
            <span className="text-sm">This will cost you <strong>{coinCost}</strong> coins</span>
          </div>
          
          {needsGameInfo && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="playerUsername" className="text-right">
                  Username
                </Label>
                <Input
                  id="playerUsername"
                  value={playerUsername}
                  onChange={(e) => setPlayerUsername(e.target.value)}
                  className="col-span-3"
                  disabled={isSubmitting}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="playerID" className="text-right">
                  Player ID
                </Label>
                <Input
                  id="playerID"
                  value={playerID}
                  onChange={(e) => setPlayerID(e.target.value)}
                  className="col-span-3"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phoneNumber" className="text-right">
              Phone
            </Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="col-span-3"
              disabled={isSubmitting}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Redeem Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RedeemModal;
