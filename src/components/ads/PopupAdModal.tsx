
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PopupAd } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
// No timer import needed

interface PopupAdModalProps {
  ad: PopupAd;
  isOpen: boolean;
  onClose: () => void;
}

const PopupAdModal = ({ ad, isOpen, onClose }: PopupAdModalProps) => {
  const [timeLeft, setTimeLeft] = useState(ad.durationSeconds);
  const [adClicked, setAdClicked] = useState(false);
  const { addCoins } = useAuth();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start the timer when ad is shown
  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, timeLeft]);

  // Handle ad completion
  const handleAdComplete = () => {
    if (adClicked) {
      addCoins(ad.coinReward);
      onClose();
    } else {
      alert('You must click on the ad to receive coins!');
    }
  };

  // Handle ad click
  const handleAdClick = () => {
    setAdClicked(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 border-0" onEscapeKeyDown={(e) => e.preventDefault()}>
        {/* Timer bar */}
        <div className="bg-primary h-1.5" style={{ width: `${(timeLeft / ad.durationSeconds) * 100}%` }} />
        
        {/* Ad content */}
        <div 
          className="ad-container cursor-pointer overflow-hidden" 
          onClick={handleAdClick}
        >
          <div
            dangerouslySetInnerHTML={{ __html: ad.htmlContent }}
            className="p-4"
          />
        </div>
        
        {/* Footer */}
        <div className="p-3 border-t flex items-center justify-between bg-gray-50">
          <div className="text-sm font-medium">
            {timeLeft > 0 ? (
              <span className="text-muted-foreground">Wait {timeLeft}s to close</span>
            ) : (
              <span className="text-green-600">Ready to claim!</span>
            )}
          </div>
          <Button
            disabled={timeLeft > 0}
            onClick={handleAdComplete}
            size="sm"
          >
            {`Claim ${ad.coinReward} Coins`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PopupAdModal;
