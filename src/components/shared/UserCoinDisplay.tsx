
import { Coins } from 'lucide-react';

interface UserCoinDisplayProps {
  coins: number;
  size?: 'sm' | 'md' | 'lg';
}

const UserCoinDisplay = ({ coins, size = 'md' }: UserCoinDisplayProps) => {
  const sizes = {
    sm: {
      container: 'text-xs px-2 py-1',
      icon: 14
    },
    md: {
      container: 'text-sm px-3 py-1.5',
      icon: 16
    },
    lg: {
      container: 'text-base px-4 py-2',
      icon: 20
    }
  };
  
  const currentSize = sizes[size];
  
  return (
    <div className={`inline-flex items-center gap-1.5 ${currentSize.container} bg-gold-100 text-gold-800 rounded-full font-medium`}>
      <Coins size={currentSize.icon} className="text-gold-500" />
      <span>{coins.toLocaleString()}</span>
    </div>
  );
};

export default UserCoinDisplay;
