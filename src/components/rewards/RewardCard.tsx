
import { Reward } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Coins } from 'lucide-react';

interface RewardCardProps {
  reward: Reward;
  onSelect: (reward: Reward) => void;
}

const RewardCard = ({ reward, onSelect }: RewardCardProps) => {
  const { name, description, coinCost, imageUrl, available } = reward;

  return (
    <div className={`reward-card ${!available ? 'opacity-60' : ''}`}>
      <div className="aspect-square w-full relative overflow-hidden rounded-md mb-3">
        <img
          src={imageUrl || '/placeholder.svg'}
          alt={name}
          className="object-cover w-full h-full"
        />
        {!available && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-medium px-2 py-1 rounded-md bg-black/60">
              Out of Stock
            </span>
          </div>
        )}
      </div>
      <h3 className="font-semibold text-lg">{name}</h3>
      <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-2">{description}</p>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1 text-gold-600 font-semibold">
          <Coins size={16} className="text-gold-500" />
          <span>{coinCost}</span>
        </div>
        <Button
          onClick={() => onSelect(reward)}
          disabled={!available}
          variant="outline"
          size="sm"
        >
          Redeem
        </Button>
      </div>
    </div>
  );
};

export default RewardCard;
