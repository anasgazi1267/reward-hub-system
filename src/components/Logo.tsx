
import { Coins } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Logo = ({ size = 'md', showText = true }: LogoProps) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32
  };

  return (
    <div className="flex items-center gap-2">
      <div className="coin-gradient p-2 rounded-full">
        <Coins className={`text-white coin-animation`} size={iconSizes[size]} />
      </div>
      {showText && (
        <h1 className={`font-bold ${sizeClasses[size]} tracking-tight`}>
          <span className="text-gold-500">Reward</span>
          <span>Hub</span>
        </h1>
      )}
    </div>
  );
};

export default Logo;
