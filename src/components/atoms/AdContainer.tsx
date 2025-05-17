// filepath: /Users/asayed/Babbel/projects/tools/merge_pdfs/src/components/atoms/AdContainer.tsx
import React, { useEffect, useRef } from 'react';

// Add window augmentation for adsbygoogle
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

interface AdContainerProps {
  position?: 'sidebar' | 'content-top' | 'content-bottom' | 'welcome-bottom';
  adClient?: string;
  adSlot?: string;
  className?: string;
}

/**
 * AdContainer component for AdSense ads
 */
const AdContainer: React.FC<AdContainerProps> = ({ 
  position = 'content-top', 
  adClient = 'ca-pub-xxxxxxxxxxxxxxxx', 
  adSlot = '1234567890',
  className = '' 
}) => {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load AdSense script if not already loaded
    if (window.adsbygoogle === undefined) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize the ad
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error('AdSense error:', e);
    }
  }, []);

  const getSizeClasses = (): string => {
    switch (position) {
      case 'sidebar':
        return 'ad-container-sidebar';
      case 'content-top':
        return 'ad-container-content-top';
      case 'content-bottom':
        return 'ad-container-content-bottom';
      case 'welcome-bottom':
        return 'ad-container-welcome-bottom';
      default:
        return 'ad-container-default';
    }
  };

  return (
    <div className={`ad-container ${getSizeClasses()} ${className}`} ref={adRef}>
      <div className="ad-label">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdContainer;