
import { useEffect, useState } from 'react';
import { useData } from '@/context/DataContext';

interface AdBannerProps {
  position?: 'top' | 'bottom';
}

const AdBanner = ({ position = 'top' }: AdBannerProps) => {
  const { bannerAds } = useData();
  const [randomAd, setRandomAd] = useState<string | null>(null);
  
  useEffect(() => {
    if (bannerAds.length > 0) {
      const randomIndex = Math.floor(Math.random() * bannerAds.length);
      setRandomAd(bannerAds[randomIndex].htmlContent);
    }
  }, [bannerAds]);
  
  if (!randomAd) return null;
  
  return (
    <div className={`w-full flex justify-center my-4 ${position === 'top' ? 'mb-6' : 'mt-6'}`}>
      <div
        className="overflow-hidden flex items-center justify-center"
        style={{ width: '468px', height: '60px' }}
        dangerouslySetInnerHTML={{ __html: randomAd }}
      />
    </div>
  );
};

export default AdBanner;
